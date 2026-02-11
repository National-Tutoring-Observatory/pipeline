import ProjectAuthorization from "~/modules/projects/authorization";
import type { User } from "~/modules/users/users.types";

export default function getTeamProjectsActions(user: User, teamId: string) {
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
}
