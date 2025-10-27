import { Queue } from "bullmq";
import Redis from 'ioredis';

export const QUEUES: Record<string, Queue> = {};

let redis: any;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
  });
}

export default (name: string) => {
  if (redis) {
    const queue = new Queue(name, {
      connection: redis
    });
    QUEUES[name] = queue;
  }
}