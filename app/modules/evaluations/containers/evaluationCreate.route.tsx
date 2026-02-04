import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { useState } from "react";
import {
  data,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "react-router";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import EvaluationCreate from "~/modules/evaluations/components/evaluationCreate";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import isAbleToCreateEvaluation from "~/modules/evaluations/helpers/isAbleToCreateEvaluation";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/evaluationCreate.route";

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

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection) {
    return redirect(`/projects/${params.projectId}/collections`);
  }

  const runs = collection.runs?.length
    ? await RunService.find({ match: { _id: { $in: collection.runs } } })
    : [];

  return { project, collection, runs };
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

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection) {
    return data(
      { errors: { collection: "Collection not found" } },
      { status: 404 },
    );
  }

  const { intent, payload = {} } = await request.json();

  switch (intent) {
    case "CREATE_EVALUATION": {
      if (!isAbleToCreateEvaluation(collection)) {
        return data(
          {
            errors: {
              runs: "At least 2 runs are required to create an evaluation",
            },
          },
          { status: 400 },
        );
      }

      const { name, runs: selectedRuns } = payload;
      const errors: Record<string, string> = {};

      if (typeof name !== "string" || name.trim().length < 1) {
        errors.name = "Evaluation name is required";
      }

      if (!Array.isArray(selectedRuns) || selectedRuns.length < 2) {
        errors.runs = "At least 2 runs must be selected";
      }

      if (Object.keys(errors).length > 0) {
        return data({ errors }, { status: 400 });
      }

      const evaluation = await EvaluationService.create({
        name: name.trim(),
        project: params.projectId,
        collection: params.collectionId,
        runs: selectedRuns,
      });

      return {
        intent: "CREATE_EVALUATION",
        data: {
          evaluationId: evaluation._id,
          collectionId: params.collectionId,
          projectId: params.projectId,
        },
      };
    }

    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

export default function EvaluationCreateRoute() {
  const { project, collection, runs } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseRun, setBaseRun] = useState<string | null>(null);
  const [selectedRuns, setSelectedRuns] = useState<string[]>(
    runs.map((run) => run._id),
  );

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Collections", link: `/projects/${project._id}/collections` },
    {
      text: collection.name,
      link: `/projects/${project._id}/collections/${collection._id}`,
    },
    { text: "Create Evaluation" },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    submit(
      JSON.stringify({
        intent: "CREATE_EVALUATION",
        payload: { name, runs: selectedRuns },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const handleCancel = () => {
    navigate(
      `/projects/${project._id}/collections/${collection._id}/evaluations`,
    );
  };

  return (
    <div className="px-8 pt-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <div className="mb-8">
        <p className="text-muted-foreground">
          Create a new evaluation for this collection
        </p>
      </div>

      <EvaluationCreate
        name={name}
        isSubmitting={isSubmitting}
        isAbleToCreateEvaluation={isAbleToCreateEvaluation(collection)}
        projectId={project._id}
        collectionId={collection._id}
        runs={runs}
        baseRun={baseRun}
        selectedRuns={selectedRuns}
        onNameChanged={setName}
        onBaseRunChanged={setBaseRun}
        onSelectedRunsChanged={setSelectedRuns}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
