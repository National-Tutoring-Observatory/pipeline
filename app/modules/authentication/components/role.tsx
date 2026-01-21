import { useContext, type ReactNode } from "react";
import type { Roles } from "../authentication.types";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import type { User } from "~/modules/users/users.types";
import includes from "lodash/includes";

export default function Role({
  roles,
  children,
}: {
  roles: Roles[];
  children: ReactNode;
}) {
  const authentication = useContext(AuthenticationContext) as User | null;

  if (authentication && includes(roles, authentication.role)) {
    return children;
  }

  return null;
}
