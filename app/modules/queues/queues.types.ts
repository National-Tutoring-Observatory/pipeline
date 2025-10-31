export interface Job {
  _id: string,
  id: string,
  state: 'wait' | 'active' | 'completed' | 'failed' | 'delayed' | 'waiting-children',
  queue: 'tasks' | 'cron',
  name: string,
  data: any,
  opts: any,
  timestamp: Date,
  processedOn: Date,
  finishedOn: Date,
  returnvalue: any,
  failedReason: string,
  stacktrace: string,
  attemptsMade: number
}
