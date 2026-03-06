import { redirect } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import SystemAdminAuthorization from "~/modules/authorization/systemAdminAuthorization";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/availableTeamUsers.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  if (!SystemAdminAuthorization.FeatureFlags.canManage(user)) {
    throw new Error("Access denied");
  }

  const url = new URL(request.url);
  const featureFlagId = url.searchParams.get("featureFlagId");

  if (!featureFlagId) {
    throw Error("Feature flag id is not defined");
  }

  const featureFlag = await FeatureFlagService.findById(featureFlagId);
  if (!featureFlag) {
    throw new Error("Feature flag not found");
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "username",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: {
      featureFlags: { $ne: featureFlag.name },
      isRegistered: true,
    },
    queryParams,
    searchableFields: ["name", "username", "email"],
    sortableFields: ["username", "createdAt"],
    filterableFields: [],
  });

  const result = await UserService.paginate(query);

  return { data: result.data, totalPages: result.totalPages };
}
