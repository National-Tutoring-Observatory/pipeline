import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter"
import type { Route } from "./+types/availableTeamUsers.route";

export async function loader({ request }: Route.LoaderArgs) {

  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId');

  if (!teamId) {
    throw Error("Team id is not defined");
  }

  const documents = getDocumentsAdapter();
  const users = await documents.getDocuments({ collection: 'users', match: { "teams.team": { "$ne": teamId } } });

  return users;

}