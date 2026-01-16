import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import SystemAdminAuthorization from "~/modules/authorization/systemAdminAuthorization";
import { UserService } from "~/modules/users/user";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import type { User } from '~/modules/users/users.types';
import type { Route } from "./+types/availableTeamUsers.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  if (!SystemAdminAuthorization.FeatureFlags.canManage(user)) {
    throw new Error('Access denied');
  }

  const url = new URL(request.url);
  const featureFlagId = url.searchParams.get('featureFlagId');

  if (!featureFlagId) {
    throw Error("Feature flag id is not defined");
  }

  const featureFlag = await FeatureFlagService.findById(featureFlagId);
  if (!featureFlag) {
    throw new Error('Feature flag not found');
  }

  const users = await UserService.find({
    match: {
      featureFlags: { "$ne": featureFlag.name },
      isRegistered: true
    }
  });

  return { data: users };

}
