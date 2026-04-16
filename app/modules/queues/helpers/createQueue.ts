import { FlowProducer, Queue } from "bullmq";
import { getRedisInstance } from "~/helpers/getRedisInstance";

const isProAvailable = !!process.env.BULLMQ_PRO_TOKEN;

let FlowProducerClass: typeof FlowProducer = FlowProducer;
let QueueProClass: typeof Queue | null = null;
let isProInitialized = false;

async function initPro() {
  if (isProInitialized || !isProAvailable) return;
  isProInitialized = true;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - bullmq-pro is conditionally installed
    const pro = await import(/* @vite-ignore */ "@taskforcesh/bullmq-pro");
    FlowProducerClass = pro.FlowProducerPro as unknown as typeof FlowProducer;
    QueueProClass = pro.QueuePro as unknown as typeof Queue;
  } catch {
    console.warn("[queues] BullMQ Pro not installed, falling back to BullMQ");
  }
}

export const QUEUES: Record<string, Queue> = {};

export const redis = getRedisInstance({ maxRetriesPerRequest: null });
redis.on("error", (err: Error) =>
  console.error("[queues] Redis error:", err.message),
);

let flowProducerInstance: FlowProducer | null = null;

export function getFlowProducer(): FlowProducer {
  if (!flowProducerInstance) {
    flowProducerInstance = new FlowProducerClass({ connection: redis });
    flowProducerInstance.on("error", (err: Error) =>
      console.error("[queues] FlowProducer error:", err.message),
    );
  }
  return flowProducerInstance;
}

export { initPro };

export default async (name: string) => {
  await initPro();
  const queue =
    name === "tasks" && QueueProClass
      ? new QueueProClass(name, { connection: redis })
      : new Queue(name, { connection: redis });
  queue.on("error", (err: Error) =>
    console.error(`[queues:${name}] Queue error:`, err.message),
  );
  QUEUES[name] = queue;
};
