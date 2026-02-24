import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { useEffect } from "react";
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
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import getUsedPromptModels, {
  type PromptModelPair,
} from "~/modules/runSets/helpers/getUsedPromptModels";
import requireRunSetsFeature from "~/modules/runSets/helpers/requireRunSetsFeature";
import { RunSetService } from "~/modules/runSets/runSet";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/runSetCreateRuns.route";
import RunSetCreateRunsContainer from "./runSetCreateRuns.container";

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

  await requireRunSetsFeature(request, params);

  const runSet = await RunSetService.findById(params.runSetId);
  if (!runSet) {
    return redirect(`/projects/${params.projectId}/run-sets`);
  }

  const existingRuns = runSet.runs?.length
    ? await RunService.find({ match: { _id: { $in: runSet.runs } } })
    : [];

  const usedPromptModels = getUsedPromptModels(existingRuns);

  return {
    runSet,
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
      const { definitions } = payload;

      const errors: Record<string, string> = {};

      if (!Array.isArray(definitions) || definitions.length === 0) {
        errors.definitions = "At least one run is required";
      }

      if (Object.keys(errors).length > 0) {
        return data({ errors }, { status: 400 });
      }

      const result = await RunSetService.createRunsForRunSet({
        runSetId: params.runSetId,
        definitions,
      });

      if (!result.runSet) {
        return data(
          { errors: { runSet: "Run set not found" } },
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
          runSetId: params.runSetId,
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

export default function RunSetCreateRunsRoute() {
  const { runSet, project, usedPromptModels } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();

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
      navigate(`/projects/${project._id}/run-sets/${runSet._id}`);
    }
  }, [fetcher.state, fetcher.data, navigate, project._id, runSet._id]);

  const handleSubmit = (requestBody: string) => {
    fetcher.submit(requestBody, {
      method: "POST",
      encType: "application/json",
    });
  };

  const handleCancel = () => {
    navigate(`/projects/${project._id}/run-sets/${runSet._id}`);
  };

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Run Sets", link: `/projects/${project._id}/run-sets` },
    {
      text: runSet.name,
      link: `/projects/${project._id}/run-sets/${runSet._id}`,
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
            Add new runs to "{runSet.name}" by selecting prompts and models
          </p>
        </div>
      </div>

      <RunSetCreateRunsContainer
        runSet={runSet}
        usedPromptModels={usedPromptModels as PromptModelPair[]}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={fetcher.state !== "idle"}
        errors={(fetcher.data as any)?.errors || {}}
      />
    </div>
  );
}
