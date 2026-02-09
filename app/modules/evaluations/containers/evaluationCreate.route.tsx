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
import EvaluationCreate from "~/modules/evaluations/components/evaluationCreate";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import isAbleToCreateEvaluation from "~/modules/evaluations/helpers/isAbleToCreateEvaluation";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunSetService } from "~/modules/runSets/runSet";
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

  const runSet = await RunSetService.findById(params.runSetId);
  if (!runSet) {
    return redirect(`/projects/${params.projectId}/run-sets`);
  }

  return { project, runSet };
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

  const runSet = await RunSetService.findById(params.runSetId);
  if (!runSet) {
    return data({ errors: { runSet: "Run set not found" } }, { status: 404 });
  }

  const { intent, payload = {} } = await request.json();

  switch (intent) {
    case "CREATE_EVALUATION": {
      if (!isAbleToCreateEvaluation(runSet)) {
        return data(
          {
            errors: {
              runs: "At least 2 runs are required to create an evaluation",
            },
          },
          { status: 400 },
        );
      }

      const { name } = payload;
      const errors: Record<string, string> = {};

      if (typeof name !== "string" || name.trim().length < 1) {
        errors.name = "Evaluation name is required";
      }

      if (Object.keys(errors).length > 0) {
        return data({ errors }, { status: 400 });
      }

      const evaluation = await EvaluationService.create({
        name: name.trim(),
        project: params.projectId,
        collection: params.runSetId,
        runs: runSet.runs || [],
      });

      return {
        intent: "CREATE_EVALUATION",
        data: {
          evaluationId: evaluation._id,
          runSetId: params.runSetId,
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
  const { project, runSet } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Run Sets", link: `/projects/${project._id}/run-sets` },
    {
      text: runSet.name,
      link: `/projects/${project._id}/run-sets/${runSet._id}`,
    },
    { text: "Create Evaluation" },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    submit(
      JSON.stringify({
        intent: "CREATE_EVALUATION",
        payload: { name },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const handleCancel = () => {
    navigate(`/projects/${project._id}/run-sets/${runSet._id}/evaluations`);
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
          Create a new evaluation for this run set
        </p>
      </div>

      <EvaluationCreate
        runSetName={runSet.name}
        name={name}
        isSubmitting={isSubmitting}
        isAbleToCreateEvaluation={isAbleToCreateEvaluation(runSet)}
        projectId={project._id}
        runSetId={runSet._id}
        onNameChanged={setName}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
