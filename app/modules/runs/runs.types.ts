export interface Run {
  _id: string;
  name: string;
  createdAt: string;
  project: string;
  annotationType: string;
  hasSetup: boolean;
  isRunning: boolean;
  prompt: number;
  promptVersion: number;
  model: string;
  sessions: { sessionId: number, status: string, name: string, fileType: string, startedAt: Date, finishedAt: Date }[]
  isComplete: boolean;
}