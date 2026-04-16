import map from "lodash/map";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import { TeamService } from "../team";
import type { Route } from "./+types/availableTeams.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth({ request });
  const teamIds = map(user.teams, "team");
  const result = await TeamService.find({ match: { _id: { $in: teamIds } } });

  return { teams: { data: result } };
}
