import { data } from "react-router";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { TeamBillingService } from "../teamBilling";
import type { Route } from "./+types/estimateCost.route";

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth({ request });

  const { intent, payload = {} } = await request.json();

  if (intent !== "ESTIMATE_COST") {
    return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }

  const { projectId, sessionIds, definitions, shouldRunVerification } = payload;

  if (!projectId) {
    return data(
      { errors: { general: "projectId is required" } },
      { status: 400 },
    );
  }

  const project = await ProjectService.findById(projectId);
  if (!project) {
    return data({ errors: { general: "Project not found" } }, { status: 404 });
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return data({ errors: { general: "Access denied" } }, { status: 403 });
  }

  const teamId =
    typeof project.team === "string" ? project.team : project.team._id;

  const [estimate, balance] = await Promise.all([
    TeamBillingService.estimateCost({
      teamId,
      projectId,
      sessionIds: sessionIds ?? [],
      definitions: definitions ?? [],
      shouldRunVerification: !!shouldRunVerification,
    }),
    TeamBillingService.getBalance(teamId),
  ]);

  return {
    estimatedCost: estimate.estimatedCost,
    estimatedTimeSeconds: estimate.estimatedTimeSeconds,
    balance,
  };
}
