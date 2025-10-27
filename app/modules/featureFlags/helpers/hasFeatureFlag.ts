import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { FeatureFlag } from "../featureFlags.types";
import includes from 'lodash/includes.js';

export default async (featureFlagName: string, context: { request: Request }) => {

  const documents = getDocumentsAdapter();
  const featureFlag = await documents.getDocument({ collection: 'featureFlags', match: { name: featureFlagName } }) as { data: FeatureFlag };

  if (featureFlag.data) {
    const user = await getSessionUser({ request: context.request });
    if (includes(user?.featureFlags, featureFlag.data.name)) {
      return true;
    }
  } else {
    // If the feature flag does not exist, then they all have that feature enabled.
    return true;
  }

  return false;
}