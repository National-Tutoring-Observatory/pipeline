import { redirect } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import TeamAuthorization from "~/modules/teams/authorization";
import { UserService } from "~/modules/users/user";
import type { Route } from "./+types/teamMembers.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) return redirect("/");

  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId");

  if (!teamId) {
    throw new Error("Team id is not defined");
  }

  if (!TeamAuthorization.canView(user, teamId)) {
    throw new Error("Access denied");
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "username",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: {
      "teams.team": teamId,
      isRegistered: true,
    },
    queryParams,
    searchableFields: ["username", "email"],
    sortableFields: ["username", "createdAt"],
  });

  const result = await UserService.paginate(query);

  return { data: result.data, totalPages: result.totalPages };
}
