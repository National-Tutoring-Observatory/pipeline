import { getRedisInstance } from "app/helpers/getRedisInstance";
import { Queue } from "bullmq";
import path from "path";
import createWorker from "./helpers/createWorker";

declare global {
  var root: string;
}

const root = path.resolve(`./`);
global.root = root;

createWorker(
  { name: "tasks", isGrouped: true },
  `${global.root}/runners/tasks.ts`,
);
createWorker({ name: "general" }, `${global.root}/runners/general.ts`);
createWorker({ name: "cron" }, `${global.root}/runners/cron.ts`);

// Warm up the process pools by pushing staggered dummy jobs.
// BullMQ spawns child processes lazily — without this, the first real jobs
// trigger simultaneous process spawns causing a CPU spike.
const WARMUP_INTERVAL_MS = 2000;

const warmupRedis = getRedisInstance({ maxRetriesPerRequest: null });

let TasksQueue: typeof Queue = Queue;
if (process.env.BULLMQ_PRO_TOKEN) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - bullmq-pro is conditionally installed
    const pro = await import("@taskforcesh/bullmq-pro");
    TasksQueue = pro.QueuePro as unknown as typeof Queue;
  } catch {
    // Falls back to standard Queue
  }
}

const tasksQueue = new TasksQueue("tasks", { connection: warmupRedis });
const generalQueue = new Queue("general", { connection: warmupRedis });
const cronQueue = new Queue("cron", { connection: warmupRedis });

console.log("[warmup] Sending warm-up jobs...");

await Promise.all([
  ...Array.from({ length: 20 }, (_, i) =>
    tasksQueue.add(
      "WARM_UP",
      { index: i },
      {
        delay: i * WARMUP_INTERVAL_MS,
        removeOnComplete: true,
        removeOnFail: true,
      },
    ),
  ),
  ...Array.from({ length: 5 }, (_, i) =>
    generalQueue.add(
      "WARM_UP",
      { index: i },
      {
        delay: i * WARMUP_INTERVAL_MS,
        removeOnComplete: true,
        removeOnFail: true,
      },
    ),
  ),
  cronQueue.add("WARM_UP", {}, { removeOnComplete: true, removeOnFail: true }),
]);

console.log("[warmup] Warm-up jobs sent");

await tasksQueue.close();
await generalQueue.close();
await cronQueue.close();
await warmupRedis.disconnect();
