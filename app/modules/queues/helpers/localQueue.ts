import fse from "fs-extra";
import countBy from "lodash/countBy";
import path from "path";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Job } from "../queues.types";

export default class LocalQueue {

  name;
  private _isPaused = false;

  constructor(name: string) {
    this.name = name;
    this.debug();
  }

  debug = () => {
    setTimeout(async () => {
      const count = await this.count();
      console.log('queue.count', count);
      const getJobCounts = await this.getJobCounts();
      console.log('queue.getJobCounts', getJobCounts);
      const getActive = await this.getActive();
      console.log('queue.getActive', getActive);
      const getWaiting = await this.getWaiting();
      console.log('queue.getWaiting', getWaiting);
      const getCompleted = await this.getCompleted();
      console.log('queue.getCompleted', getCompleted);
      const getFailed = await this.getFailed();
      console.log('queue.getFailed', getFailed);
      const getDelayed = await this.getDelayed();
      console.log('queue.getDelayed', getDelayed);
      const getJob = await this.getJob("69022d2acf4d87c30ae4ad5c");
      console.log('queue.getJob', getJob);
      const remove = await this.remove("690282d367f8be03945dacff");
      console.log('queue.remove', remove);
    }, 1000);
  }

  add = async (name: string, job: any, options: any) => {

    const documents = getDocumentsAdapter();

    const jobObject = await documents.createDocument({
      collection: 'jobs',
      update: {
        queue: this.name,
        name: name,
        data: job,
        opts: options,
      }
    }) as { data: Job };

    return this.addBullMQCompatibility(jobObject.data);

  }

  private getJobs = async (match: any) => {
    const documents = getDocumentsAdapter();

    match.queue = this.name;

    const result = await documents.getDocuments({
      collection: 'jobs',
      match
    }) as { data: Job[], count: number };

    return {
      ...result,
      data: result.data.map(jobData => this.addBullMQCompatibility(jobData))
    };
  }

  count = async () => {
    const jobs = await this.getJobs({
      state: { $in: ['wait', 'delayed'] }
    });

    return jobs.count;
  }

  getJobCounts = async () => {

    const jobs = await this.getJobs({});

    let initialCount = {
      "wait": 0,
      "active": 0,
      "completed": 0,
      "failed": 0,
      "delayed": 0,
      'waiting-children': 0
    }

    return { ...initialCount, ...countBy(jobs.data, 'state') };
  }

  getActive = async () => {
    const jobs = await this.getJobs({
      state: 'active'
    });

    return jobs.data;
  }

  getWaiting = async () => {
    const jobs = await this.getJobs({
      state: 'wait'
    });

    return jobs.data;
  }

  getCompleted = async () => {
    const jobs = await this.getJobs({
      state: 'completed'
    });

    return jobs.data;
  }

  getFailed = async () => {
    const jobs = await this.getJobs({
      state: 'failed'
    });

    return jobs.data;
  }

  getDelayed = async () => {
    const jobs = await this.getJobs({
      state: 'delayed'
    });

    return jobs.data;
  }

  getJob = async (jobId: string) => {
    const documents = getDocumentsAdapter();

    const job = await documents.getDocument({
      collection: 'jobs',
      match: {
        _id: jobId,
        queue: this.name
      }
    }) as { data: Job };

    if (!job?.data) {
      return null;
    }

    return this.addBullMQCompatibility(job.data);
  }

  remove = async (jobId: string) => {
    const documents = getDocumentsAdapter();

    // Get job data directly to avoid circular dependency
    const jobData = await documents.getDocument({
      collection: 'jobs',
      match: {
        _id: jobId,
        queue: this.name
      }
    }) as { data: Job };

    if (!jobData?.data) {
      return 0; // Job not found
    }

    // Check if job is active - active jobs cannot be removed
    if (jobData.data.state === 'active') {
      return 0; // Cannot remove active job
    }

    // Remove the job
    const hasRemoved = await documents.deleteDocument({
      collection: 'jobs',
      match: {
        _id: jobId
      }
    }) as boolean;

    return hasRemoved ? 1 : 0;
  }

  pause = async (): Promise<void> => {
    this._isPaused = true;
    const pauseFilePath = path.join(process.cwd(), `data/queue-${this.name}-paused`);
    await fse.writeFile(pauseFilePath, '');
  }

  resume = async (): Promise<void> => {
    this._isPaused = false;
    const pauseFilePath = path.join(process.cwd(), `data/queue-${this.name}-paused`);
    await fse.remove(pauseFilePath);
  }

  isPaused = async (): Promise<boolean> => {
    return this._isPaused;
  }

  private addBullMQCompatibility = (jobData: Job): Job & {
    remove: () => Promise<number>;
    updateData: (data: any) => Promise<any>;
    getState: () => Promise<string>;
  } => {
    const documents = getDocumentsAdapter();

    return {
      ...jobData,
      id: jobData._id,
      remove: async () => {
        const result = await this.remove(jobData._id);
        if (result === 0) {
          throw new Error(`Failed to remove job ${jobData._id}`);
        }
        return result;
      },
      updateData: async (data: any) => {
        const updatedJob = await documents.updateDocument({
          collection: 'jobs',
          match: { _id: jobData._id },
          update: { data }
        });
        return updatedJob;
      },
      getState: async () => {
        const currentJob = await this.getJob(jobData._id);
        return currentJob?.state || 'unknown';
      }
    };
  }
}
