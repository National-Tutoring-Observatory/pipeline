import getDateString from "~/modules/app/helpers/getDateString";
import type { User } from "~/modules/users/users.types";
import type { Team } from "../teams.types";
import getUserRoleInTeam from "./getUserRoleInTeam";

export default function getTeamUsersItemAttributes(item: User, team: Team) {
  const { name: roleName } = getUserRoleInTeam({ user: item, team });

  let displayName = item.name || item.username;
  let description = item.username || "";

  if (!item.isRegistered) {
    if (item.name) {
      displayName = `${item.name} - Invited user`;
    } else {
      displayName = "Invited user";
    }
    description = `${window.location.origin}/invite/${item.inviteId}`;
  }

  return {
    id: item._id,
    title: displayName || "User",
    description,
    meta: [
      {
        text: roleName || "Member",
      },
      {
        text: `Created at - ${getDateString(item.createdAt)}`,
      },
    ],
  };
}
