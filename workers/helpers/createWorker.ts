import { getRedisInstance } from "app/helpers/getRedisInstance";
import { Job, MetricsTime, Worker } from "bullmq";
import type { Redis } from "ioredis";

export const WORKERS: Record<string, { worker: Worker; redis: Redis }> = {};

export default async ({ name }: { name: string }, file: string) => {
  const redis = getRedisInstance({ maxRetriesPerRequest: null });

  redis.on("connect", () => console.log(`[${name}] Redis connected`));
  redis.on("ready", () => console.log(`[${name}] Redis ready`));
  redis.on("close", () => console.log(`[${name}] Redis connection closed`));
  redis.on("reconnecting", () =>
    console.log(`[${name}] Redis reconnecting...`),
  );
  redis.on("error", (err) =>
    console.error(`[${name}] Redis error:`, err.message),
  );

  const worker = new Worker(name, file, {
    connection: redis,
    concurrency: 5,
    metrics: {
      maxDataPoints: MetricsTime.ONE_WEEK * 2,
    },
    useWorkerThreads: false,
    // Increase lock duration given how long some scripts can take - set to 5 mins.
    lockDuration: 300000,
  });

  worker.on("active", (job: Job) => {
    console.log("Job started", job.name);
  });

  worker.on("completed", (job: Job) => {
    console.log("Job completed", job.name);
  });
  // @ts-ignore
  worker.on("failed", (job: Job, error: Error) => {
    console.log("Job failed", job.name, error);
  });

  // @ts-ignore
  worker.on("error", (err: Error) => {
    console.error(err);
  });

  WORKERS[name] = { worker, redis };

  async function shutdown() {
    const closing = [];

    for (const name in WORKERS) {
      if (WORKERS[name]) {
        closing.push(WORKERS[name].worker.close());
      }
    }

    await Promise.all(closing);

    const disconnecting = [];

    for (const name in WORKERS) {
      if (WORKERS[name]) {
        disconnecting.push(WORKERS[name].redis.disconnect());
      }
    }

    await Promise.all(disconnecting);

    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
