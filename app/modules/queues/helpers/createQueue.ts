import { Queue } from "bullmq";
import Redis from 'ioredis';
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import createTask from "./createTask";
import LocalQueue from "./localQueue";

export const QUEUES: Record<string, Queue | any> = {};

export let redis: any;

const isRedisQueue = (process.env.REDIS_URL && process.env.DOCUMENTS_ADAPTER === 'DOCUMENT_DB');

if (isRedisQueue && process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
  });
}

export default (name: string) => {
  if (isRedisQueue) {
    if (redis) {
      const queue = new Queue(name, {
        connection: redis
      });
      QUEUES[name] = queue;
    } else {
      console.warn('Error with redis not being available');
    }
  } else {
    QUEUES[name] = new LocalQueue(name);
  }
}