import includes from 'lodash/includes.js';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { FeatureFlagService } from "../featureFlag";

export default async (featureFlagName: string, context: { request: Request }) => {
  const featureFlag = await FeatureFlagService.find({ match: { name: featureFlagName } });

  if (featureFlag.length > 0) {
    const user = await getSessionUser({ request: context.request });
    if (includes(user?.featureFlags, featureFlag[0].name)) {
      return true;
    }
  } else {
    // If the feature flag does not exist, then they all have that feature enabled.
    return true;
  }

  return false;
}
