import getDateString from "~/modules/app/helpers/getDateString";
import type { User } from "~/modules/users/users.types";

export default function getTeamInviteLinkSignupsItemAttributes(item: User) {
  const displayName = item.name || item.username || "User";
  const description = item.username || "";
  return {
    id: item._id,
    title: displayName,
    description,
    meta: [
      { text: item.isRegistered ? "Registered" : "Invited" },
      { text: `Joined ${getDateString(item.createdAt)}` },
    ],
  };
}
