import includes from 'lodash/includes.js';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { FeatureFlagService } from "../featureFlag";

export default async (
  featureFlagName: string,
  context: { request: Request },
  options: { defaultValue?: boolean } = {}
) => {
  const { defaultValue = true } = options;
  const featureFlag = await FeatureFlagService.find({ match: { name: featureFlagName } });

  if (featureFlag.length > 0) {
    const user = await getSessionUser({ request: context.request });
    if (includes(user?.featureFlags, featureFlag[0].name)) {
      return true;
    }
  } else {
    return defaultValue;
  }

  return false;
}
