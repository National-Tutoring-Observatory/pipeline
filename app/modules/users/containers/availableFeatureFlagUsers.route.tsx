import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { FeatureFlag } from "~/modules/featureFlags/featureFlags.types";
import type { User } from '~/modules/users/users.types';
import type { Route } from "./+types/availableTeamUsers.route";

export async function loader({ request }: Route.LoaderArgs) {

  const url = new URL(request.url);
  const featureFlagId = url.searchParams.get('featureFlagId');

  if (!featureFlagId) {
    throw Error("Feature flag id is not defined");
  }

  const documents = getDocumentsAdapter();

  const featureFlag = await documents.getDocument({ collection: 'featureFlags', match: { _id: featureFlagId } }) as { data: FeatureFlag };

  const users = await documents.getDocuments<User>({
    collection: 'users',
    match: {
      "featureFlags": { "$ne": featureFlag.data.name },
      "isRegistered": true
    }
  });

  return users;

}
