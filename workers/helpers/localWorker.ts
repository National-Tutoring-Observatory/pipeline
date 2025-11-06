import type { Job } from 'bullmq';
import dayjs from 'dayjs';
import fse from 'fs-extra';
import filter from 'lodash/filter.js';
import remove from 'lodash/remove.js';
import path from 'path';

export default class LocalWorker {

  name;
  file;
  isProcessing = false;
  interval: any;
  events: any = {
    "active": [],
    "completed": [],
    "failed": [],
    "error": []
  }

  constructor(name: string, file: string) {
    this.name = name;
    this.file = file;
    this.setupQueue();
    this.init();
  }

  init = () => {
    this.interval = setInterval(async () => {
      this.cleanupJobs();
      this.processJobs();
    }, 3000);
  }

  setupQueue = () => {
    const jobsPath = path.join(process.cwd(), `../data/jobs.json`);
    if (!fse.pathExistsSync(jobsPath)) {
      fse.writeJsonSync(jobsPath, []);
    }
  }

  processJobs = async () => {
    try {

      if (this.isProcessing) {
        return;
      }

      if (this.#isPaused()) {
        return;
      }

      const jobsPath = path.join(process.cwd(), `../data/jobs.json`);
      const jobs = await fse.readJson(jobsPath);

      const queueJobs = filter(jobs, (job) => {
        if (job.queue === this.name && job.attemptsMade < 3 && job.state === 'wait') {
          return job;
        }
      });

      if (queueJobs.length > 0) {

        this.isProcessing = true;
        const currentJob = queueJobs[0];

        try {

          currentJob.processedOn = new Date();
          currentJob.state = 'active';
          await fse.writeJson(jobsPath, jobs);
          this.emit('active', currentJob);

          await this.processJob(jobs[0]);

          currentJob.finishedOn = new Date();
          currentJob.attemptsMade = jobs[0].attemptsMade + 1;
          currentJob.state = 'completed';
          await fse.writeJson(jobsPath, jobs);
          this.emit('completed', currentJob);

        } catch (error: any) {

          currentJob.finishedOn = Date.now();
          currentJob.attemptsMade = jobs[0].attemptsMade + 1;

          if (error) {
            currentJob.failedReason = error.message;
            currentJob.stacktrace = error.stack ? error.stack.split('\n') : [];
          }
          if (currentJob.attemptsMade >= 3) {
            currentJob.state = 'failed';
          } else {
            currentJob.state = 'wait';
          }
          await fse.writeJson(jobsPath, jobs);
          this.emit('failed', currentJob, error);

        }

        this.isProcessing = false;

      }
    } catch (error: any) {
      this.emit('error', undefined, error);
    }
  }

  processJob = async (job: Job) => {
    const processFile = await import(this.file);
    return await processFile.default(job);
  }

  cleanupJobs = async () => {
    try {

      const jobsPath = path.join(process.cwd(), `../data/jobs.json`);
      const jobs = await fse.readJson(jobsPath);

      // Removes queue items that are older than 30 days
      remove(jobs, (queue) => {
        if (dayjs(queue.timestamp).isBefore(dayjs().subtract(30, 'days'))) {
          return true;
        }
      });

      await fse.writeJson(jobsPath, jobs);

    } catch (error) {
      console.warn('Error during cleanupJobs', error);
    }
  }

  on = (event: string, callback: (job: Job, error?: Error) => any) => {
    if (this.events[event]) {
      this.events[event].push(callback);
    }
  }

  emit = (event: string, job?: Job, error?: Error) => {
    if (this.events[event] && this.events[event].length > 0) {
      for (const callback of this.events[event]) {
        callback(job, error);
      }
    }
  }

  close = () => {
    clearInterval(this.interval);
  }

  #isPaused = () => {
    const pauseFilePath = path.join(process.cwd(), `../data/queue-${this.name}.lock`);
    return fse.pathExistsSync(pauseFilePath);
  }
}
