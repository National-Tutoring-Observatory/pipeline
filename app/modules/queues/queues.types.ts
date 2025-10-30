export interface Queue {
    _id: string;
    id: string;
    state: string;
    queue: string;
    name: string;
    data: any;
    opts: any;
    timestamp: string;
    processedOn?: string;
    finishedOn?: string;
    returnvalue?: any;
    failedReason?: string;
    stacktrace?: string;
    attemptsMade: number;
}
