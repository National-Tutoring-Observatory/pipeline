import countBy from "lodash/countBy";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Job } from "../queues.types";

export default class LocalQueue {

  name;

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

    return { ...jobObject.data };

  }

  private getJobs = async (match: any) => {
    const documents = getDocumentsAdapter();

    match.queue = this.name;

    return await documents.getDocuments({
      collection: 'jobs',
      match
    }) as { data: Job[], count: number };
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

}
