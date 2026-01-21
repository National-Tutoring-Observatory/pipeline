import { FlowProducer, Queue } from "bullmq";
import { getRedisInstance } from "~/helpers/getRedisInstance";

export const QUEUES: Record<string, Queue | any> = {};

export let redis: any;
export let flowProducer: FlowProducer;

redis = getRedisInstance({ maxRetriesPerRequest: null });
flowProducer = new FlowProducer({ connection: redis });

export default (name: string) => {
  const queue = new Queue(name, {
    connection: redis,
  });
  QUEUES[name] = queue;
};
