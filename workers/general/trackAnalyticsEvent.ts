import type { Job } from "bullmq";
import sendGA4Event from "~/modules/analytics/helpers/sendGA4Event.server";
import { PromptService } from "~/modules/prompts/prompt";
import { RunService } from "~/modules/runs/run";
import { UserService } from "~/modules/users/user";

async function getTimeToFirstSeconds(userId: string): Promise<number | null> {
  const user = await UserService.findById(userId);
  if (!user?.registeredAt) return null;
  return Math.round(
    (Date.now() - new Date(user.registeredAt).getTime()) / 1000,
  );
}

export default async function trackAnalyticsEvent(job: Job) {
  const { name, userId, params } = job.data || {};
  if (!name || !userId) {
    return { status: "ERRORED", message: "Missing name or userId" };
  }

  await sendGA4Event({ clientId: userId, name, params });

  if (name === "run_created") {
    const count = await RunService.count({ createdBy: userId });
    if (count === 1) {
      const timeToFirst = await getTimeToFirstSeconds(userId);
      await sendGA4Event({
        clientId: userId,
        name: "first_run_created",
        params: {
          ...(timeToFirst !== null && {
            time_to_first_seconds: timeToFirst,
          }),
        },
      });
    }
  }

  if (name === "prompt_created") {
    const count = await PromptService.count({ createdBy: userId });
    if (count === 1) {
      const timeToFirst = await getTimeToFirstSeconds(userId);
      await sendGA4Event({
        clientId: userId,
        name: "first_prompt_created",
        params: {
          ...(timeToFirst !== null && {
            time_to_first_seconds: timeToFirst,
          }),
        },
      });
    }
  }

  return { status: "OK", message: `Tracked ${name}` };
}
