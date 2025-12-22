import type { Project } from "~/modules/projects/projects.types";
import type { Prompt } from "~/modules/prompts/prompts.types";
import type { RunSnapshot } from "~/modules/runs/services/buildRunSnapshot.server";

export interface Run {
  _id: string;
  name: string;
  project: Project | string;
  annotationType: string;
  prompt: Prompt | string;
  promptVersion: number;
  model: string;
  sessions: RunSession[]
  snapshot?: RunSnapshot;
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

export interface RunSession { sessionId: string, status: 'DONE' | 'RUNNING' | 'ERRORED', name: string, fileType: string, startedAt: Date, finishedAt: Date }

export interface CreateRun {
  selectedAnnotationType: string,
  selectedPrompt: string | null,
  selectedPromptVersion: number | null,
  selectedModel: string,
  selectedSessions: string[]
}

export interface StartRunProps {
  runId: string
  projectId: string,
  sessions: string[],
  annotationType: 'PER_UTTERANCE' | 'PER_SESSION',
  prompt: string
  promptVersion: number,
  modelCode: string
}
