import map from 'lodash/map.js';
import { flowProducer } from './createQueue';
import getQueue from "./getQueue";

interface ChildJob {
  name: string,
  data: any
}

export default async ({ task, data, children }: { task: string, data: any, children: ChildJob[] }) => {
  const queue = getQueue('tasks');

  if (children && children.length > 0) {
    const flow = {
      name: task,
      queueName: 'tasks',
      data,
      children: map(children, (child) => {
        return {
          name: child.name,
          queueName: 'tasks',
          data: child.data
        }
      })
    };
    const flowTree = await flowProducer.add(flow);
    return flowTree.job;
  }

  const taskJob = await queue.add(task, data, {
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
