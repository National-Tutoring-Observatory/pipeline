import fse from 'fs-extra';
import path from 'path';
import filter from 'lodash/filter.js';

const processJob = async (job) => {
  // Faked process of job
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

export default class LocalWorker {

  name;
  file;
  isProcessing = false;
  interval;

  constructor(name, file) {
    this.name = name;
    this.file = file;
    this.init();
  }

  init = () => {
    this.interval = setInterval(async () => {
      try {

        if (this.isProcessing) {
          return;
        }

        const queue = await fse.readJson(path.join(process.cwd(), `../data/queues.json`));

        const jobs = filter(queue, (job) => {
          if (job.queue === this.name && job.attemptsMade < 3) {
            return job;
          }
        });

        if (jobs.length > 0) {

          this.isProcessing = true;
          const currentJob = jobs[0];

          try {

            currentJob.processedOn = new Date();
            await fse.writeJson(path.join(process.cwd(), `../data/queues.json`), queue);

            await processJob(jobs[0]);

            currentJob.finishedOn = new Date();
            currentJob.attemptsMade = jobs[0].attemptsMade + 1;
            await fse.writeJson(path.join(process.cwd(), `../data/queues.json`), queue);

          } catch (error) {

            currentJob.finishedOn = new Date();
            currentJob.attemptsMade = jobs[0].attemptsMade + 1;

            if (error) {
              currentJob.failedReason = error.message;
              currentJob.stacktrace = error.stack;
            }

            await fse.writeJson(path.join(process.cwd(), `../data/queues.json`), queue);

          }

          this.isProcessing = false;

        }
      } catch (error) {
        console.log(error);
      }

    }, 3000);
  }

  on = (event, callback) => {
    // TODO: Create a listening function
    console.log('On event', event);
  }

  close = () => {
    clearInterval(this.interval);
  }
}