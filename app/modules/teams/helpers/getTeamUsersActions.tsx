import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";

export default function getTeamUsersActions(user: User, teamId: string) {
  const actions = [];

  if (TeamAuthorization.Users.canRequestAccess(user, teamId)) {
    actions.push({
      action: "REQUEST_ACCESS",
      text: "Request Access to Team",
    });
  }

  if (TeamAuthorization.Users.canUpdate(user, teamId)) {
    actions.push({
      action: "ADD_USER",
      text: "Add existing user",
    });
  }

  if (TeamAuthorization.Users.canInvite(user, teamId)) {
    actions.push({
      action: "INVITE_USER",
      text: "Invite new user",
    });
  }

  return actions;
}
