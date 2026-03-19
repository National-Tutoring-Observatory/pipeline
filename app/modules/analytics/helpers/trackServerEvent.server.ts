import getQueue from "~/modules/queues/helpers/getQueue";

export default async function trackServerEvent({
  name,
  userId,
  params,
}: {
  name: string;
  userId: string;
  params?: Record<string, string | number>;
}) {
  if (
    !process.env.GOOGLE_ANALYTICS_ID ||
    !process.env.GOOGLE_ANALYTICS_API_SECRET
  )
    return;

  const queue = getQueue("general");
  await queue.add("TRACK_ANALYTICS_EVENT", { name, userId, params });
}
