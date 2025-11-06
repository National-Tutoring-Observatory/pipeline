import dotenv from 'dotenv';
dotenv.config({ path: '../.env' })

import { Job, MetricsTime, Worker } from 'bullmq';
import Redis from 'ioredis';
import { getRedisInstance } from './getRedisInstance';
import LocalWorker from './localWorker';

export let redis: Redis;

const isRedisQueue = (process.env.DOCUMENTS_ADAPTER === 'DOCUMENT_DB');

export const WORKERS: any = {};

if (isRedisQueue) {
  redis = getRedisInstance({ maxRetriesPerRequest: null });
}

export default async ({ name }: { name: string }, file: string) => {

  let worker;

  if (isRedisQueue) {
    worker = new Worker(name, file, {
      connection: redis,
      concurrency: 1,
      metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK * 2,
      },
      useWorkerThreads: false
    });
  } else {
    worker = new LocalWorker(name, file);
  }

  if (worker) {

    worker.on('active', (job: Job) => {
      console.log('Job started', job.name);
    });

    worker.on('completed', (job: Job) => {
      console.log('Job completed', job.name);
    });
    // @ts-ignore
    worker.on('failed', (job: Job, error: Error) => {
      console.log('Job failed', job.name, error);
    });

    // @ts-ignore
    worker.on('error', (err: Error) => {
      console.error(err);
    });

    WORKERS[name] = worker;

  }

  async function shutdown() {

    const workers = [];

    for (const name in WORKERS) {
      if (WORKERS[name]) {
        workers.push(WORKERS[name].close());
      }
    }

    await Promise.all(workers);

    if (redis) {
      await redis.disconnect();
    }

    process.exit(0);

  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

};
