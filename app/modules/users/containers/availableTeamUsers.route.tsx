import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import TeamAuthorization from "~/modules/teams/authorization";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from '~/modules/users/users.types';
import type { Route } from "./+types/availableTeamUsers.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId');

  if (!teamId) {
    throw Error("Team id is not defined");
  }

  if (!TeamAuthorization.canView(user, teamId)) {
    throw new Error('Access denied');
  }

  const documents = getDocumentsAdapter();
  const users = await documents.getDocuments<User>({
    collection: 'users', match: {
      "teams.team": { "$ne": teamId },
      "isRegistered": true
    }
  });

  return users;

}
