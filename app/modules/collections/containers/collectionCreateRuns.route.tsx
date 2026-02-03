import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { useEffect, useState } from "react";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "react-router";
import { toast } from "sonner";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import type { PromptReference } from "~/modules/collections/collections.types";
import getUsedPromptModels, {
  type PromptModelPair,
} from "~/modules/collections/helpers/getUsedPromptModels";
import requireCollectionsFeature from "~/modules/collections/helpers/requireCollectionsFeature";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import type { User } from "~/modules/users/users.types";
import CollectionCreateRunsForm from "../components/collectionCreateRunsForm";
import type { Route } from "./+types/collectionCreateRuns.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return redirect("/");
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect("/");
  }

  await requireCollectionsFeature(request, params);

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection) {
    return redirect(`/projects/${params.projectId}/collections`);
  }

  const existingRuns = collection.runs?.length
    ? await RunService.find({ match: { _id: { $in: collection.runs } } })
    : [];

  const usedPromptModels = getUsedPromptModels(existingRuns);

  return {
    collection,
    project,
    usedPromptModels,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return data({ errors: { project: "Project not found" } }, { status: 404 });
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { project: "Access denied" } }, { status: 403 });
  }

  const { intent, payload = {} } = await request.json();

  switch (intent) {
    case "CREATE_RUNS": {
      const { prompts, models } = payload;

      const errors: Record<string, string> = {};

      if (!Array.isArray(prompts) || prompts.length === 0) {
        errors.prompts = "At least one prompt is required";
      }

      if (!Array.isArray(models) || models.length === 0) {
        errors.models = "At least one model is required";
      }

      if (Object.keys(errors).length > 0) {
        return data({ errors }, { status: 400 });
      }

      const result = await CollectionService.createRunsForCollection({
        collectionId: params.collectionId,
        prompts,
        models,
      });

      if (!result.collection) {
        return data(
          { errors: { collection: "Collection not found" } },
          { status: 404 },
        );
      }

      if (result.errors.length > 0 && result.createdRunIds.length === 0) {
        return data(
          { errors: { duplicate: result.errors.join(", ") } },
          { status: 400 },
        );
      }

      return {
        intent: "CREATE_RUNS",
        data: {
          collectionId: params.collectionId,
          projectId: params.projectId,
          createdCount: result.createdRunIds.length,
          errors: result.errors,
        },
      };
    }

    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

export default function CollectionCreateRunsRoute() {
  const { collection, project, usedPromptModels } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [selectedPrompts, setSelectedPrompts] = useState<PromptReference[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.intent !== "CREATE_RUNS") return;

    const createdCount = fetcher.data.data?.createdCount;
    if (createdCount > 0) {
      const runErrors = fetcher.data?.data?.errors;
      if (runErrors && runErrors.length > 0) {
        toast.warning(
          `${createdCount} run(s) created, but ${runErrors.length} run(s) failed to start`,
        );
      } else {
        toast.success(`${createdCount} run(s) created successfully`);
      }
      navigate(`/projects/${project._id}/collections/${collection._id}`);
    }
  }, [fetcher.state, fetcher.data, navigate, project._id, collection._id]);

  const handleCreateRuns = () => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_RUNS",
        payload: {
          prompts: selectedPrompts,
          models: selectedModels,
        },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const handleCancel = () => {
    navigate(`/projects/${project._id}/collections/${collection._id}`);
  };

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Collections", link: `/projects/${project._id}/collections` },
    {
      text: collection.name,
      link: `/projects/${project._id}/collections/${collection._id}`,
    },
    { text: "Create Runs" },
  ];

  return (
    <div>
      <div className="px-8 pt-8">
        <PageHeader>
          <PageHeaderLeft>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </PageHeaderLeft>
        </PageHeader>
        <div className="mb-8">
          <p className="text-muted-foreground">
            Add new runs to "{collection.name}" by selecting prompts and models
          </p>
        </div>
      </div>

      <CollectionCreateRunsForm
        collection={collection}
        selectedPrompts={selectedPrompts}
        selectedModels={selectedModels}
        usedPromptModels={usedPromptModels as PromptModelPair[]}
        onPromptsChanged={setSelectedPrompts}
        onModelsChanged={setSelectedModels}
        onCreateClicked={handleCreateRuns}
        onCancelClicked={handleCancel}
        isLoading={fetcher.state !== "idle"}
        errors={(fetcher.data as any)?.errors || {}}
      />
    </div>
  );
}
