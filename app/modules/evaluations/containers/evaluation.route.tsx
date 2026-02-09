import { redirect, useLoaderData } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import Evaluation from "~/modules/evaluations/components/evaluation";
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

export default function EvaluationRoute() {
  const { project, runSet, evaluation } = useLoaderData<typeof loader>();

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

  return <Evaluation evaluation={evaluation} breadcrumbs={breadcrumbs} />;
}
