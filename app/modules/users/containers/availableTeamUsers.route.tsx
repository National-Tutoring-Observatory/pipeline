import { redirect } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import TeamAuthorization from "~/modules/teams/authorization";
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

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: '',
    currentPage: 1,
    sort: 'username',
    filters: {}
  });

  const query = buildQueryFromParams({
    match: {
      "teams.team": { "$ne": teamId },
      "isRegistered": true
    },
    queryParams,
    searchableFields: ['username', 'email'],
    sortableFields: ['username', 'createdAt'],
    filterableFields: []
  });

  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<User>({
    collection: 'users',
    ...query
  });

  return result;

}
