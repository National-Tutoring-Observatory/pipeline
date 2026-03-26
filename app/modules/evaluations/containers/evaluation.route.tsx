import has from "lodash/has";
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "react-router";
import { toast } from "sonner";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import Evaluation from "~/modules/evaluations/components/evaluation";
import AdjudicationDialogContainer from "~/modules/evaluations/containers/adjudicationDialog.container";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import getTopPerformersVsGoldLabel from "~/modules/evaluations/helpers/getTopPerformersVsGoldLabel";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import { RunSetService } from "~/modules/runSets/runSet";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/evaluation.route";

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

  const evaluation = await EvaluationService.findById(params.evaluationId);
  if (!evaluation) {
    return redirect(
      `/projects/${params.projectId}/run-sets/${params.runSetId}/evaluations`,
    );
  }

  const evaluationRuns = await RunService.find({
    match: { _id: { $in: evaluation.runs } },
  });
  const firstRunWithPrompt = evaluationRuns.find((r) => !r.isHuman && r.prompt);
  const evaluationPrompt = firstRunWithPrompt
    ? {
        promptId: String(firstRunWithPrompt.prompt),
        promptVersion: firstRunWithPrompt.promptVersion!,
      }
    : null;

  return { project, runSet, evaluation, evaluationPrompt };
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
    case "START_ADJUDICATION": {
      const { selectedRuns } = payload;

      if (!Array.isArray(selectedRuns) || selectedRuns.length < 2) {
        return data(
          { errors: { runs: "At least 2 runs must be selected" } },
          { status: 400 },
        );
      }

      const { modelCode } = payload;

      console.log("START_ADJUDICATION", {
        evaluationId: params.evaluationId,
        selectedRuns,
        modelCode,
      });

      return data({
        success: true,
        intent: "START_ADJUDICATION",
      });
    }

    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function EvaluationRoute() {
  const { project, runSet, evaluation, evaluationPrompt } =
    useLoaderData<typeof loader>();
  const [progress, setProgress] = useState(0);
  const { revalidate } = useRevalidator();
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data || !("success" in fetcher.data)) return;
    if (fetcher.data.intent === "START_ADJUDICATION") {
      toast.success("Adjudication started");
    }
  }, [fetcher.state, fetcher.data]);

  useHandleSockets({
    event: "CREATE_EVALUATION",
    matches: [
      {
        evaluationId: evaluation._id,
        task: "CREATE_EVALUATION:START",
        status: "FINISHED",
      },
      {
        evaluationId: evaluation._id,
        task: "CREATE_EVALUATION:PROCESS",
        status: "STARTED",
      },
      {
        evaluationId: evaluation._id,
        task: "CREATE_EVALUATION:PROCESS",
        status: "FINISHED",
      },
      {
        evaluationId: evaluation._id,
        task: "CREATE_EVALUATION:FINISH",
        status: "FINISHED",
      },
    ],
    callback: (payload) => {
      if (has(payload, "progress")) {
        setProgress(payload.progress);
      }
      debounceRevalidate(revalidate);
    },
  });

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Run Sets", link: `/projects/${project._id}/run-sets` },
    {
      text: runSet.name,
      link: `/projects/${project._id}/run-sets/${runSet._id}`,
    },
    {
      text: "Evaluations",
      link: `/projects/${project._id}/run-sets/${runSet._id}/evaluations`,
    },
    { text: evaluation.name },
  ];

  const report = evaluation.report || [];
  const firstReport = report[0];
  const performers = firstReport
    ? getTopPerformersVsGoldLabel(firstReport, evaluation.baseRun)
    : [];
  const nonHumanPerformerCount = performers.filter((p) => !p.isHuman).length;
  const canStartAdjudication =
    evaluation.isComplete === true && nonHumanPerformerCount >= 2;

  const submitStartAdjudication = (
    selectedRuns: string[],
    modelCode: string,
    promptId: string,
    promptVersion: number,
  ) => {
    fetcher.submit(
      JSON.stringify({
        intent: "START_ADJUDICATION",
        payload: { selectedRuns, modelCode, promptId, promptVersion },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const openAdjudicationDialog = () => {
    addDialog(
      <AdjudicationDialogContainer
        evaluation={evaluation}
        evaluationPrompt={evaluationPrompt}
        onStartAdjudication={submitStartAdjudication}
      />,
    );
  };

  return (
    <Evaluation
      evaluation={evaluation}
      breadcrumbs={breadcrumbs}
      progress={progress}
      canStartAdjudication={canStartAdjudication}
      onAdjudicationClicked={openAdjudicationDialog}
    />
  );
}
