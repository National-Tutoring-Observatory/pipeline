import map from 'lodash/map';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import type { Team } from '../teams.types';
import type { Route } from "./+types/availableTeams.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  const userSession = await getSessionUser({ request }) as User;

  if (!userSession) {
    return { teams: [] }
  }

  const teamIds = map(userSession.teams, "team");
  const match = { _id: { $in: teamIds } }

  const result = await documents.getDocuments<Team>({ collection: 'teams', match, sort: {} });
  const teams = { data: result.data };

  return { teams };
}
