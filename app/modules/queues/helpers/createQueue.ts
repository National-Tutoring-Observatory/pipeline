import { FlowProducer, Queue } from "bullmq";
import { getRedisInstance } from "~/helpers/getRedisInstance";

export const QUEUES: Record<string, Queue | any> = {};

export const redis = getRedisInstance({ maxRetriesPerRequest: null });
redis.on("error", (err: Error) =>
  console.error("[queues] Redis error:", err.message),
);
export const flowProducer = new FlowProducer({ connection: redis });
flowProducer.on("error", (err: Error) =>
  console.error("[queues] FlowProducer error:", err.message),
);

export default (name: string) => {
  const queue = new Queue(name, {
    connection: redis,
  });
  queue.on("error", (err: Error) =>
    console.error(`[queues:${name}] Queue error:`, err.message),
  );
  QUEUES[name] = queue;
};
