import { FlowProducer, Queue } from "bullmq";
import { getRedisInstance } from "~/helpers/getRedisInstance";
import LocalQueue from "./localQueue";

export const QUEUES: Record<string, Queue | any> = {};

export let redis: any;
export let flowProducer: FlowProducer;

const isRedisQueue = (process.env.DOCUMENTS_ADAPTER === 'DOCUMENT_DB');

if (isRedisQueue) {
  redis = getRedisInstance({ maxRetriesPerRequest: null });
  flowProducer = new FlowProducer({ connection: redis });
}

export default (name: string) => {
  if (isRedisQueue) {
    const queue = new Queue(name, {
      connection: redis
    });
    QUEUES[name] = queue;
  } else {
    QUEUES[name] = new LocalQueue(name);
  }
}
