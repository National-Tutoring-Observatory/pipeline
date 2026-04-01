import type { Job } from "bullmq";
import { NotificationService } from "~/modules/notifications/notification";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";

export default async function notifyCreditsExhausted(job: Job) {
  const { teamId } = job.data || {};
  if (!teamId) return { status: "ERRORED", message: "Missing teamId" };

  const team = await TeamService.findById(teamId);
  if (!team) return { status: "ERRORED", message: "Team not found" };

  const user = await UserService.findById(team.createdBy);

  const lines = [
    `:warning: *Team out of credits*`,
    `*Team:* ${team.name} (${team._id})`,
    `*User:* ${user?.name ?? "—"} (${team.createdBy ?? "—"})`,
    `*Email:* ${user?.email ?? "—"}`,
    `*Institution:* ${user?.institution ?? "—"}`,
  ];

  await NotificationService.deliver(lines.join("\n"));

  return { status: "OK", message: "Slack notification sent" };
}
