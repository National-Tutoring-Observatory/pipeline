export interface Job {
  // Custom properties
  _id: string,
  id: string,
  state: 'active' | 'completed' | 'delayed' | 'failed' | 'paused' | 'prioritized' | 'waiting' | 'waiting-children',
  queue: 'tasks' | 'cron',

  // Core properties
  name: string,
  data: any,
  opts: any,
  timestamp: Date,
  processedOn?: Date,
  finishedOn?: Date,
  returnvalue: any,
  failedReason: string,
  stacktrace: string[],
  attemptsMade: number,

  // Additional BullMQ properties (optional since not in current DB)
  // progress?: number | object,
  // delay?: number,
  // parent?: {
  //   id: string,
  //   queue: string
  // },
  // parentKey?: string,
  // repeatJobKey?: string
}
