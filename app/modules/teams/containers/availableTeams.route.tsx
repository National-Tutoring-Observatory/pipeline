import map from "lodash/map";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import type { User } from "~/modules/users/users.types";
import { TeamService } from "../team";
import type { Route } from "./+types/availableTeams.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userSession = (await getSessionUser({ request })) as User;

  if (!userSession) {
    return { teams: [] };
  }

  const teamIds = map(userSession.teams, "team");
  const match = { _id: { $in: teamIds } };

  const result = await TeamService.find({ match });
  const teams = { data: result };

  return { teams };
}
