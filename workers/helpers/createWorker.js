import dotenv from 'dotenv';
dotenv.config({ path: '../.env' })

import { Worker, MetricsTime } from 'bullmq';
import Redis from 'ioredis';

export const WORKERS = {};

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

export default async ({ name }, callback) => {

  const worker = new Worker(name, callback, {
    connection: redis,
    concurrency: 1,
    metrics: {
      maxDataPoints: MetricsTime.ONE_WEEK * 2,
    },
    useWorkerThreads: false
  });

  worker.on('active', (job) => {
    console.log('Job started', job.name);
  });

  worker.on('completed', (job) => {
    console.log('Job completed', job.name);
  });

  worker.on('failed', (job, error) => {
    console.log('Job failed', job.name, error);
  });

  worker.on('error', err => {
    console.error(err);
  });

  process.on("SIGINT", async () => {
    for (const name in WORKERS) {
      if (WORKERS[name]) {
        WORKERS[name].close();
      }
    }
  });

  WORKERS[name] = worker;
};