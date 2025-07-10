export interface Run {
  _id: string;
  name: string;
  project: string;
  annotationType: string;
  prompt: number;
  promptVersion: number;
  model: string;
  sessions: { sessionId: number, status: string, name: string, fileType: string, startedAt: Date, finishedAt: Date }[]
  hasSetup: boolean;
  isRunning: boolean;
  isComplete: boolean;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
}

export interface CreateRun {
  selectedAnnotationType: string,
  selectedPrompt: number | null,
  selectedPromptVersion: number | null,
  selectedModel: string,
  selectedSessions: number[]
}
