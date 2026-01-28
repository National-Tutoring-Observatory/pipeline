import { useContext } from "react";
import getDateString from "~/modules/app/helpers/getDateString";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import ProjectAuthorization from "~/modules/projects/authorization";
import type { Project } from "~/modules/projects/projects.types";
import type { User } from "~/modules/users/users.types";

export default (item: Project, teamId: string) => {
  const user = useContext(AuthenticationContext) as User;
  const canCreate = ProjectAuthorization.canCreate(user, teamId);

  return {
    id: item._id,
    title: item.name,
    to: canCreate ? `/projects/${item._id}` : undefined,
    meta: [
      {
        text: `Created at - ${getDateString(item.createdAt)}`,
      },
    ],
  };
};
