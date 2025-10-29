import type { Project } from "~/modules/projects/projects.types";
import type { Prompt } from "~/modules/prompts/prompts.types";

export interface Run {
  _id: string;
  name: string;
  project: Project | string;
  annotationType: string;
  prompt: Prompt | string;
  promptVersion: number;
  model: string;
  sessions: { sessionId: string, status: string, name: string, fileType: string, startedAt: Date, finishedAt: Date }[]
  hasSetup: boolean;
  isRunning: boolean;
  isComplete: boolean;
  hasErrored: boolean;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  isExporting: boolean;
  hasExportedCSV: boolean;
  hasExportedJSONL: boolean;
}

export interface CreateRun {
  selectedAnnotationType: string,
  selectedPrompt: string | null,
  selectedPromptVersion: number | null,
  selectedModel: string,
  selectedSessions: string[]
}
