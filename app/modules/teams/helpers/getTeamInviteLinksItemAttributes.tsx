import dayjs from "dayjs";
import getDateString from "~/modules/app/helpers/getDateString";
import type { User } from "~/modules/users/users.types";
import type { TeamInvite } from "../teamInvites.types";
import getTeamInviteStatus from "./getTeamInviteStatus";
import INVITE_LINK_TTL_DAYS from "./inviteLink";

function describeExpiry(status: string, createdAt: string): string {
  if (status === "revoked") return "Revoked";
  if (status === "full") return "Full";
  if (status === "expired") return "Expired";
  const expiresAt = dayjs(createdAt).add(INVITE_LINK_TTL_DAYS, "day");
  const daysLeft = expiresAt.diff(dayjs(), "day");
  if (daysLeft <= 0) {
    const hoursLeft = Math.max(0, expiresAt.diff(dayjs(), "hour"));
    return `Expires in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`;
  }
  return `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
}

export default function getTeamInviteLinksItemAttributes(
  item: TeamInvite,
  createdByUser?: Pick<User, "name" | "username"> | null,
  baseUrl?: string,
) {
  const status = getTeamInviteStatus(item);
  const origin =
    baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const creatorLabel =
    createdByUser?.name || createdByUser?.username || "Unknown";
  return {
    id: item._id,
    title: item.name,
    description: `${origin}/join/${item.slug}`,
    meta: [
      { text: `${item.usedCount} of ${item.maxUses} used` },
      { text: describeExpiry(status, item.createdAt) },
      { text: `Created by ${creatorLabel} · ${getDateString(item.createdAt)}` },
    ],
    to: `./${item._id}`,
  };
}
