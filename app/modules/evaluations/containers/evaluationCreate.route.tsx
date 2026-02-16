import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { useEffect, useMemo, useState } from "react";
import {
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "react-router";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import EvaluationCreate from "~/modules/evaluations/components/evaluationCreate";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import getEvaluationCompatibleRuns from "~/modules/evaluations/helpers/getEvaluationCompatibleRuns";
import isAbleToCreateEvaluation from "~/modules/evaluations/helpers/isAbleToCreateEvaluation";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
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

  const runs = runSet.runs?.length
    ? await RunService.find({ match: { _id: { $in: runSet.runs } } })
    : [];

  return { project, runSet, runs };
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

      const fetchedRuns = await RunService.find({
        match: { _id: { $in: selectedRuns } },
      });

      if (fetchedRuns.length !== selectedRuns.length) {
        return data(
          { errors: { runs: "One or more runs could not be found" } },
          { status: 400 },
        );
      }

      const compatible = getEvaluationCompatibleRuns(
        fetchedRuns,
        fetchedRuns[0]._id,
      );

      if (compatible.length !== fetchedRuns.length - 1) {
        return data(
          {
            errors: {
              runs: "All runs must share the same sessions and annotation schema",
            },
          },
          { status: 400 },
        );
      }

      const evaluation = await EvaluationService.create({
        name: name.trim(),
        project: params.projectId,
        runSet: params.runSetId,
        runs: selectedRuns,
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
  const { project, runSet, runs } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseRun, setBaseRun] = useState<string | null>(null);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  useEffect(() => {
    if (actionData?.intent === "CREATE_EVALUATION") {
      navigate(
        `/projects/${actionData.data.projectId}/run-sets/${actionData.data.runSetId}/evaluations/${actionData.data.evaluationId}`,
      );
    }
  }, [actionData]);

  const compatibleRuns = useMemo(
    () => getEvaluationCompatibleRuns(runs, baseRun),
    [baseRun, runs],
  );

  const handleBaseRunChanged = (id: string | null) => {
    setBaseRun(id);
    const compatible = getEvaluationCompatibleRuns(runs, id);
    setSelectedRuns(compatible.map((run) => run._id));
  };

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
        payload: { name, runs: [baseRun, ...selectedRuns] },
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
        name={name}
        isSubmitting={isSubmitting}
        isAbleToCreateEvaluation={isAbleToCreateEvaluation(runSet)}
        projectId={project._id}
        runSetId={runSet._id}
        runs={runs}
        baseRun={baseRun}
        compatibleRuns={compatibleRuns}
        selectedRuns={selectedRuns}
        onNameChanged={setName}
        onBaseRunChanged={handleBaseRunChanged}
        onSelectedRunsChanged={setSelectedRuns}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
