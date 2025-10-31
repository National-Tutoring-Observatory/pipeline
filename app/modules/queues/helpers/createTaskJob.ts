import getQueue from "./getQueue";

export default async ({ task, job }: { task: string, job: any }) => {
  const queue = getQueue('tasks');
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