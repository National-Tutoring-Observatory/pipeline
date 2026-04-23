import dayjs from "dayjs";
import find from "lodash/find";
import mongoose from "mongoose";
import teamInviteSchema from "~/lib/schemas/teamInvite.schema";
import trackServerEvent from "~/modules/analytics/helpers/trackServerEvent.server";
import setupNewUser from "~/modules/authentication/services/setupNewUser.server";
import getTeamInviteStatus from "~/modules/teams/helpers/getTeamInviteStatus";
import INVITE_LINK_TTL_DAYS from "~/modules/teams/helpers/inviteLink";
import { TeamInviteService } from "~/modules/teams/teamInvites";
import type { TeamInvite } from "~/modules/teams/teamInvites.types";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";

const TeamInviteModel =
  mongoose.models.TeamInvite || mongoose.model("TeamInvite", teamInviteSchema);

export type ConsumeStatus =
  | "success"
  | "already_member"
  | "expired"
  | "full"
  | "revoked"
  | "not_found";

export interface ConsumeResult {
  status: ConsumeStatus;
  user?: User;
  invite?: TeamInvite;
  isNewUser?: boolean;
}

export default async function consumeTeamInvite({
  inviteId,
  githubUser,
  primaryEmail,
}: {
  inviteId: string;
  githubUser: { id: number; login: string; name?: string };
  primaryEmail: string;
}): Promise<ConsumeResult> {
  const invite = await TeamInviteService.findById(inviteId);

  if (!invite) return { status: "not_found" };

  const status = getTeamInviteStatus(invite);
  if (status !== "active") {
    return { status };
  }

  const existingUsers = await UserService.find({
    match: { githubId: githubUser.id, hasGithubSSO: true },
  });
  const existingUser = existingUsers[0] ?? null;

  if (existingUser) {
    const alreadyInTeam = find(
      existingUser.teams,
      (t) => t.team === invite.team,
    );
    if (alreadyInTeam) {
      return { status: "already_member", user: existingUser, invite };
    }
  }

  const cutoff = dayjs().subtract(INVITE_LINK_TTL_DAYS, "day").toDate();
  const atomicallyUpdated = await TeamInviteModel.findOneAndUpdate(
    {
      _id: inviteId,
      revokedAt: null,
      createdAt: { $gt: cutoff },
      $expr: { $lt: ["$usedCount", "$maxUses"] },
    },
    { $inc: { usedCount: 1 } },
    { new: true },
  );

  if (!atomicallyUpdated) {
    const current = await TeamInviteService.findById(inviteId);
    if (!current) return { status: "not_found" };
    const currentStatus = getTeamInviteStatus(current);
    // "active" shouldn't happen here (atomic match failed but invite appears active);
    // treat as "full" since usedCount reaching maxUses is the most likely race.
    if (currentStatus === "active") return { status: "full" };
    return { status: currentStatus };
  }

  let user: User;
  let isNewUser: boolean;

  if (existingUser) {
    const updatedTeams = [
      ...existingUser.teams,
      { team: invite.team, role: "MEMBER" as const, viaTeamInvite: invite._id },
    ];
    user = (await UserService.updateById(existingUser._id, {
      teams: updatedTeams,
    })) as User;
    isNewUser = false;
  } else {
    const created = await UserService.create({
      username: githubUser.login,
      name: githubUser.name || githubUser.login,
      email: primaryEmail,
      githubId: githubUser.id,
      hasGithubSSO: true,
      isRegistered: true,
      registeredAt: new Date(),
      role: "USER",
      teams: [{ team: invite.team, role: "MEMBER", viaTeamInvite: invite._id }],
      onboardingComplete: false,
    });
    await setupNewUser(
      created._id,
      `${githubUser.name || githubUser.login}'s Workspace`,
    );
    user = (await UserService.findById(created._id)) as User;
    isNewUser = true;
    trackServerEvent({ name: "user_registered", userId: user._id });
  }

  trackServerEvent({
    name: "team_invite_signup",
    userId: user._id,
    params: {
      team_invite_id: invite._id,
      team_id: invite.team,
      is_new_user: isNewUser ? 1 : 0,
    },
  });

  return { status: "success", user, invite, isNewUser };
}
