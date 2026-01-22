import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import ProjectAuthorization from "~/modules/projects/authorization";
import type { User } from "~/modules/users/users.types";

export default (teamId: string) => {
  const user = useContext(AuthenticationContext) as User;

  if (ProjectAuthorization.canCreate(user, teamId)) {
    return [
      {
        action: "CREATE",
        text: "Create project",
      },
    ];
  } else {
    return [];
  }
};
