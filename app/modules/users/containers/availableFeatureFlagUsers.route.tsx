import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import SystemAdminAuthorization from "~/modules/authorization/systemAdminAuthorization";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { FeatureFlag } from "~/modules/featureFlags/featureFlags.types";
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

  const documents = getDocumentsAdapter();

  const featureFlag = await documents.getDocument<FeatureFlag>({ collection: 'featureFlags', match: { _id: featureFlagId } });
  if (!featureFlag.data) {
    throw new Error('Feature flag not found');
  }

  const users = await documents.getDocuments<User>({
    collection: 'users',
    match: {
      "featureFlags": { "$ne": featureFlag.data.name },
      "isRegistered": true
    }
  });

  return users;

}
