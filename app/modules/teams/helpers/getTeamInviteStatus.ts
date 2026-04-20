import dayjs from "dayjs";
import type { TeamInvite, TeamInviteStatus } from "../teamInvites.types";
import INVITE_LINK_TTL_DAYS from "./inviteLink";

export default function getTeamInviteStatus(
  invite: TeamInvite,
): TeamInviteStatus {
  if (invite.revokedAt) return "revoked";
  if (invite.usedCount >= invite.maxUses) return "full";
  if (
    dayjs().isAfter(dayjs(invite.createdAt).add(INVITE_LINK_TTL_DAYS, "day"))
  ) {
    return "expired";
  }
  return "active";
}
