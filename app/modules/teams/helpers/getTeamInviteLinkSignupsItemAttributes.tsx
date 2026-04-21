import getDateString from "~/modules/app/helpers/getDateString";
import type { User } from "~/modules/users/users.types";

export default function getTeamInviteLinkSignupsItemAttributes(
  item: User,
  inviteId: string,
) {
  const displayName = item.name || item.username || "User";
  const description = item.username || "";
  const membership = item.teams?.find((t) => t.viaTeamInvite === inviteId);
  const meta: Array<{ text: string }> = [
    { text: item.isRegistered ? "Registered" : "Invited" },
  ];
  if (membership?.joinedAt) {
    meta.push({ text: `Joined ${getDateString(membership.joinedAt)}` });
  }
  return {
    id: item._id,
    title: displayName,
    description,
    meta,
  };
}
