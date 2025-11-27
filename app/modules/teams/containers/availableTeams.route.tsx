import map from 'lodash/map';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/availableTeams.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  const userSession = await getSessionUser({ request }) as User;

  if (!userSession) {
    return { teams: [] }
  }

  const teamIds = map(userSession.teams, "team");
  const match = { _id: { $in: teamIds } }

  const result = await documents.getDocuments({ collection: 'teams', match, sort: {} });
  const teams = { data: result.data as any[] };

  return { teams };
}
