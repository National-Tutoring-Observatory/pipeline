import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter"
import type { Route } from "./+types/availableTeamUsers.route";

export async function loader({ request }: Route.LoaderArgs) {

  const url = new URL(request.url);
  const featureFlagId = url.searchParams.get('featureFlagId');

  if (!featureFlagId) {
    throw Error("Feature flag id is not defined");
  }

  const documents = getDocumentsAdapter();
  const users = await documents.getDocuments({
    collection: 'users',
    match: {
      "featureFlags": { "$ne": featureFlagId },
      "isRegistered": true
    }
  });

  return users;

}