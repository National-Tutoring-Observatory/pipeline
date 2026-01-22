import dayjs from "dayjs";
import type { User } from "~/modules/users/users.types";
import type { Team } from "../teams.types";
import getUserRoleInTeam from "./getUserRoleInTeam";

export default (item: User, team: Team) => {
  const { name: roleName } = getUserRoleInTeam({ user: item, team });

  let username = item.username;
  let description = "";

  if (!item.isRegistered) {
    if (item.username) {
      username = `${item.username} - Invited user`;
    } else {
      username = "Invited user";
    }
    description = `${window.location.origin}/invite/${item.inviteId}`;
  }

  return {
    id: item._id,
    title: username || "User",
    description,
    meta: [
      {
        text: roleName || "Member",
      },
      {
        text: `Created at - ${dayjs(item.createdAt).format("ddd, MMM D, YYYY - h:mm A")}`,
      },
    ],
  };
};
