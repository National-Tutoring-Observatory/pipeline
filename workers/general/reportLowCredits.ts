import type { Job } from "bullmq";
import { TeamBillingService } from "~/modules/billing/teamBilling";
import { NotificationService } from "~/modules/notifications/notification";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import mapWithConcurrency from "../helpers/mapWithConcurrency";

const LOW_CREDITS_THRESHOLD = 5;

export default async function reportLowCredits(_job: Job) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return { status: "OK", message: "No Slack webhook configured, skipping" };
  }

  const teamIds = await TeamService.findAllIds();

  const balances = await mapWithConcurrency(teamIds, async (teamId) => ({
    teamId,
    balance: await TeamBillingService.getBalance(teamId),
  }));

  const lowCreditTeams = balances.filter(
    ({ balance }) => balance < LOW_CREDITS_THRESHOLD,
  );

  if (lowCreditTeams.length === 0) {
    return { status: "OK", message: "No teams with low credits" };
  }

  const lowCreditTeamIds = lowCreditTeams.map(({ teamId }) => teamId);
  const teams = await TeamService.find({
    match: { _id: { $in: lowCreditTeamIds } },
  });

  const teamDetails = await Promise.all(
    lowCreditTeams.map(async ({ teamId, balance }) => {
      const team = teams.find((t) => String(t._id) === teamId) ?? null;
      const user = team ? await UserService.findById(team.createdBy) : null;
      return { team, user, balance };
    }),
  );

  const lines = [
    `:warning: *Daily low-credits report* — ${lowCreditTeams.length} team(s) below $${LOW_CREDITS_THRESHOLD}`,
    "",
    ...teamDetails.map(({ team, user, balance }) => {
      const balanceStr = `$${balance.toFixed(2)}`;
      return [
        `*Team:* ${team?.name ?? "—"} (${team?._id ?? "—"}) — *Balance:* ${balanceStr}`,
        `*User:* ${user?.name ?? "—"} | *Email:* ${user?.email ?? "—"} | *Institution:* ${user?.institution ?? "—"}`,
      ].join("\n");
    }),
  ];

  await NotificationService.deliver(lines.join("\n"));

  return {
    status: "OK",
    message: `Low-credits report sent for ${lowCreditTeams.length} team(s)`,
  };
}
