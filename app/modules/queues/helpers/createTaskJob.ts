import map from 'lodash/map.js';
import { flowProducer } from './createQueue';
import getQueue from "./getQueue";

interface ChildJob {
  name: string,
  job: any
}

export default async ({ task, job, children }: { task: string, job: any, children: ChildJob[] }) => {
  const queue = getQueue('tasks');

  if (children && children.length > 0) {
    const flow = {
      name: task,
      queueName: 'tasks',
      data: job,
      children: map(children, (child) => {
        return {
          name: child.name,
          queueName: 'tasks',
          data: child.job
        }
      })
    };
    const flowTree = await flowProducer.add(flow);
    return flowTree.job;
  }

  const taskJob = await queue.add(task, job, {
    removeOnComplete: {
      age: 72 * 3600, // keep up to 1 hour
      count: 2000, // keep up to 2000 jobs
    },
    removeOnFail: {
      age: 72 * 3600,
      count: 2000,
    },
  });
  return taskJob;
}
