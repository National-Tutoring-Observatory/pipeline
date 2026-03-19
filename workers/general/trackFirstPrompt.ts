import type { Job } from "bullmq";
import sendGA4Event from "~/modules/analytics/helpers/sendGA4Event.server";
import { PromptService } from "~/modules/prompts/prompt";
import { UserService } from "~/modules/users/user";

export default async function trackFirstPrompt(job: Job) {
  const { userId } = job.data || {};
  if (!userId) {
    return { status: "ERRORED", message: "Missing userId" };
  }

  const count = await PromptService.count({ createdBy: userId });
  if (count !== 1) {
    return { status: "OK", message: "Not first prompt" };
  }

  const user = await UserService.findById(userId);
  const timeToFirst = user?.registeredAt
    ? Math.round((Date.now() - new Date(user.registeredAt).getTime()) / 1000)
    : null;

  await sendGA4Event({
    clientId: userId,
    name: "first_prompt_created",
    params: {
      ...(timeToFirst !== null && { time_to_first_seconds: timeToFirst }),
    },
  });

  return { status: "OK", message: "Tracked first_prompt_created" };
}
