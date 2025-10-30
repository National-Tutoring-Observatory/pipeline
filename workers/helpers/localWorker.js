import dayjs from 'dayjs';
import fse from 'fs-extra';
import filter from 'lodash/filter.js';
import remove from 'lodash/remove.js';
import path from 'path';

export default class LocalWorker {

  name;
  file;
  isProcessing = false;
  interval;
  events = {
    "active": [],
    "completed": [],
    "failed": [],
    "error": []
  }

  constructor(name, file) {
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
    const queuesPath = path.join(process.cwd(), `../data/queues.json`);
    if (!fse.pathExistsSync(queuesPath)) {
      fse.writeJsonSync(queuesPath, []);
    }
  }

  processJobs = async () => {
    try {

      if (this.isProcessing) {
        return;
      }

      const queuesPath = path.join(process.cwd(), `../data/queues.json`);
      const queues = await fse.readJson(queuesPath);

      const jobs = filter(queues, (job) => {
        if (job.queue === this.name && job.attemptsMade < 3 && job.state === 'wait') {
          return job;
        }
      });

      if (jobs.length > 0) {

        this.isProcessing = true;
        const currentJob = jobs[0];

        try {

          currentJob.processedOn = new Date();
          currentJob.state = 'active';
          await fse.writeJson(queuesPath, queues);
          this.emit('active', currentJob);

          await this.processJob(jobs[0]);

          currentJob.finishedOn = new Date();
          currentJob.attemptsMade = jobs[0].attemptsMade + 1;
          currentJob.state = 'completed';
          await fse.writeJson(queuesPath, queues);
          this.emit('completed', currentJob);

        } catch (error) {

          currentJob.finishedOn = new Date();
          currentJob.attemptsMade = jobs[0].attemptsMade + 1;

          if (error) {
            currentJob.failedReason = error.message;
            currentJob.stacktrace = error.stack;
          }
          if (currentJob.attemptsMade >= 3) {
            currentJob.state = 'failed';
          } else {
            currentJob.state = 'wait';
          }
          await fse.writeJson(queuesPath, queues);
          this.emit('failed', currentJob, error);

        }

        this.isProcessing = false;

      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  processJob = async (job) => {
    const processFile = await import(this.file);
    return await processFile.default(job);
  }

  cleanupJobs = async () => {
    try {

      const queuesPath = path.join(process.cwd(), `../data/queues.json`);
      const queues = await fse.readJson(queuesPath);

      // Removes queue items that are older than 30 days
      remove(queues, (queue) => {
        if (dayjs(queue.timestamp).isBefore(dayjs().subtract(30, 'days'))) {
          return true;
        }
      });

      await fse.writeJson(queuesPath, queues);

    } catch (error) {
      console.warn('Error during cleanupJobs', error);
    }
  }

  on = (event, callback) => {
    if (this.events[event]) {
      this.events[event].push(callback);
    }
  }

  emit = (event, job, error) => {
    if (this.events[event] && this.events[event].length > 0) {
      for (const callback of this.events[event]) {
        callback(job, error);
      }
    }
  }

  close = () => {
    clearInterval(this.interval);
  }
}
