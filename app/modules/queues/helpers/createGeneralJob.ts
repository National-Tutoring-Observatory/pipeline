import type { JobsOptions } from "bullmq";
import getQueue from "./getQueue";

export default async (
  name: string,
  data: Record<string, unknown>,
  opts?: JobsOptions,
) => {
  const queue = getQueue("general");
  return queue.add(name, data, opts);
};
