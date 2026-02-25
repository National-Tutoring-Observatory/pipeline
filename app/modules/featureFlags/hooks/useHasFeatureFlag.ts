import includes from "lodash/includes";
import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/authentication.context";

export default function useHasFeatureFlag(flag: string): boolean {
  const authentication = useContext(AuthenticationContext);

  if (authentication && authentication.featureFlags) {
    return includes(authentication.featureFlags, flag);
  }

  return false;
}
