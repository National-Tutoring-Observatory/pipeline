import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import map from 'lodash/map';
import type { Route } from "./+types/availableTeams.route";

type Teams = {
  data: [],
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  const userSession = await getSessionUser({ request }) as User;

  const teamIds = map(userSession.teams, "team");
  const match = { _id: { $in: teamIds } }

  const teams = await documents.getDocuments({ collection: 'teams', match, sort: {} }) as Teams;

  return { teams };
}