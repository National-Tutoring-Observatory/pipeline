import has from "lodash/has";
import throttle from "lodash/throttle";
import { useState } from "react";
import { redirect, useLoaderData, useRevalidator } from "react-router";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import Evaluation from "~/modules/evaluations/components/evaluation";
import AdjudicationDialogContainer from "~/modules/evaluations/containers/adjudicationDialog.container";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
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

  return { project, runSet, evaluation };
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function EvaluationRoute() {
  const { project, runSet, evaluation } = useLoaderData<typeof loader>();
  const [progress, setProgress] = useState(0);
  const { revalidate } = useRevalidator();

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

  const submitStartAdjudication = (selectedRuns: string[]) => {
    console.log("submitStartAdjudication selectedRuns:", selectedRuns);
  };

  const openAdjudicationDialog = () => {
    addDialog(
      <AdjudicationDialogContainer
        evaluation={evaluation}
        onStartAdjudication={submitStartAdjudication}
      />,
    );
  };

  return (
    <Evaluation
      evaluation={evaluation}
      breadcrumbs={breadcrumbs}
      progress={progress}
      onAdjudicationClicked={openAdjudicationDialog}
    />
  );
}
