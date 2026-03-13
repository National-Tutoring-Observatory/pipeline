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
  const queue = getQueue("general");
  await queue.add("TRACK_ANALYTICS_EVENT", { name, userId, params });
}
