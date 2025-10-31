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

  count = async () => {
    const documents = getDocumentsAdapter();

    const jobs = await documents.getDocuments({
      collection: 'jobs',
      match: {
        queue: this.name,
        state: { $in: ['wait', 'delayed'] }
      }
    }) as { data: Job[] };

    return jobs.data.length;
  }

  getJobCounts = async () => {
    const documents = getDocumentsAdapter();

    const jobs = await documents.getDocuments({
      collection: 'jobs',
      match: {
        queue: this.name,
      }
    }) as { data: Job[] };

    return countBy(jobs.data, 'state');
  }
}
