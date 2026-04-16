export interface Job {
  // Custom properties
  _id: string;
  id: string;
  state:
    | "active"
    | "completed"
    | "delayed"
    | "failed"
    | "groups"
    | "paused"
    | "prioritized"
    | "waiting"
    | "waiting-children";
  queue: {
    name: string;
  };
  // Core properties
  name: string;
  data: unknown;
  opts: unknown;
  timestamp: Date;
  processedOn?: Date;
  finishedOn?: Date;
  returnvalue: unknown;
  failedReason: string;
  stacktrace: string[];
  attemptsMade: number;

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
