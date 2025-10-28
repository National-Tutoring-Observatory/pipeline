import dotenv from 'dotenv';
dotenv.config({ path: '../.env' })

import { Worker, MetricsTime } from 'bullmq';
import Redis from 'ioredis';
import LocalWorker from './localWorker.js';

export let redis;

const isRedisQueue = (process.env.REDIS_URL && process.env.DOCUMENTS_ADAPTER === 'DOCUMENT_DB');

export const WORKERS = {};

if (isRedisQueue && process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
  });
}

export default async ({ name }, file) => {

  let worker;

  if (isRedisQueue) {
    if (redis) {
      worker = new Worker(name, file, {
        connection: redis,
        concurrency: 1,
        metrics: {
          maxDataPoints: MetricsTime.ONE_WEEK * 2,
        },
        useWorkerThreads: false
      });
    } else {
      console.warn('Error with redis not being available');
    }
  } else {
    worker = new LocalWorker(name, file);
  }

  if (worker) {

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

    WORKERS[name] = worker;

  }

  process.on("SIGINT", async () => {
    for (const name in WORKERS) {
      if (WORKERS[name]) {
        WORKERS[name].close();
      }
    }
  });

};