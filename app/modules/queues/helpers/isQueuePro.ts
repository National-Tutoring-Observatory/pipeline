import type { Queue } from "bullmq";

export interface QueuePro extends Queue {
  getGroupsJobsCount(): Promise<number>;
  getGroups(start: number, end: number): Promise<Array<{ id: string }>>;
  getGroupJobs(groupId: string, start: number, end: number): Promise<unknown[]>;
}

export default function isQueuePro(queue: Queue): queue is QueuePro {
  return (
    typeof (queue as unknown as Record<string, unknown>)?.getGroups ===
    "function"
  );
}
