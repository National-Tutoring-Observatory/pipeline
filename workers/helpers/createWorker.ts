import { getRedisInstance } from "app/helpers/getRedisInstance";
import { Job, MetricsTime, Worker } from "bullmq";
import type { Redis } from "ioredis";

// Sandboxed workers fork child processes that pipe stdout/stderr to the parent.
// With concurrency up to 50 when using grouped pro workers, this exceeds Node's default limit of 10 listeners.
process.stdout.setMaxListeners(60);
process.stderr.setMaxListeners(60);

export const WORKERS: Record<string, { worker: Worker; redis: Redis }> = {};

export default async (
  { name, isGrouped }: { name: string; isGrouped?: boolean },
  file: string,
) => {
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

  const isProWorker = isGrouped && !!process.env.BULLMQ_PRO_TOKEN;

  const baseOpts = {
    connection: redis,
    concurrency: isProWorker ? 20 : 5,
    metrics: {
      maxDataPoints: MetricsTime.ONE_WEEK * 2,
    },
    useWorkerThreads: false,
    // Increase lock duration given how long some scripts can take - set to 5 mins.
    lockDuration: 300000,
  };

  let worker: Worker;
  if (isProWorker) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - bullmq-pro is conditionally installed
      const { WorkerPro } = await import("@taskforcesh/bullmq-pro");
      worker = new WorkerPro(name, file, {
        ...baseOpts,
        connection: redis as any,
        group: { concurrency: 50 },
      }) as unknown as Worker;
      console.log(`[${name}] BullMQ Pro is running`);
    } catch {
      console.warn(
        `[${name}] BullMQ Pro not installed, falling back to BullMQ`,
      );
      worker = new Worker(name, file, baseOpts);
    }
  } else {
    worker = new Worker(name, file, baseOpts);
  }

  worker.on("active", (job: Job) => {
    console.log("Job started", job.name);
  });

  worker.on("completed", (job: Job) => {
    console.log("Job completed", job.name);
  });
  worker.on("failed", (job: Job | undefined, error: Error) => {
    console.log("Job failed", job?.name, error);
  });

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
