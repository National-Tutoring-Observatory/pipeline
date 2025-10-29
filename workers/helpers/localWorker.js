import fse from 'fs-extra';
import path from 'path';
import filter from 'lodash/filter.js';
import remove from 'lodash/remove.js';
import dayjs from 'dayjs';

const processJob = async (job) => {
  // Faked process of job
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (job.attemptsMade === 2) {
        resolve();
      } else {
        reject();
      }
    }, 5000);
  });
}

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
    this.init();
  }

  init = () => {
    this.interval = setInterval(async () => {
      this.cleanupJobs();
      this.processJobs();
    }, 3000);
  }

  processJobs = async () => {
    try {

      if (this.isProcessing) {
        return;
      }

      const queues = await fse.readJson(path.join(process.cwd(), `../data/queues.json`));

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
          await fse.writeJson(path.join(process.cwd(), `../data/queues.json`), queues);
          this.emit('active', currentJob);

          await processJob(jobs[0]);

          currentJob.finishedOn = new Date();
          currentJob.attemptsMade = jobs[0].attemptsMade + 1;
          currentJob.state = 'completed';
          await fse.writeJson(path.join(process.cwd(), `../data/queues.json`), queues);
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
          await fse.writeJson(path.join(process.cwd(), `../data/queues.json`), queues);
          this.emit('failed', currentJob, error);

        }

        this.isProcessing = false;

      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  cleanupJobs = async () => {
    try {

      const queues = await fse.readJson(path.join(process.cwd(), `../data/queues.json`));

      // Removes queue items that are older than 30 days
      remove(queues, (queue) => {
        if (dayjs(queue.timestamp).isBefore(dayjs().subtract(30, 'days'))) {
          return true;
        }
      });

      await fse.writeJson(path.join(process.cwd(), `../data/queues.json`), queues);

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