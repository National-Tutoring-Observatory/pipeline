import includes from "lodash/includes";
import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import type { User } from "~/modules/users/users.types";

export default function Flag({
  flag,
  children,
}: {
  flag: string;
  children: React.ReactElement;
}) {
  const authentication = useContext(AuthenticationContext) as User | null;

  if (authentication && authentication.featureFlags) {
    if (includes(authentication.featureFlags, flag)) {
      return children;
    }
  }

  return null;
}
