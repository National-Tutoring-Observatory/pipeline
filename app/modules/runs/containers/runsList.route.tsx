import map from "lodash/map";
import { redirect } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "../run";
import type { Route } from "./+types/runsList.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project");

  if (!projectId) {
    throw new Error("Project parameter is required.");
  }

  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");

  // First verify the project exists and user has access
  const project = await ProjectService.findOne({
    _id: projectId,
    team: { $in: teamIds },
  });

  if (!project) {
    return redirect("/");
  }

  const runs = await RunService.find({ match: { project: projectId } });
  return { runs: { data: runs } };
}
