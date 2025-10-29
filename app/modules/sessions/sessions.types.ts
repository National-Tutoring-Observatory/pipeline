import type { Project } from "~/modules/projects/projects.types";
import type { File } from "~/modules/files/files.types";

export interface Session {
  _id: string;
  name: string;
  createdAt: string;
  project: Project | string;
  file: File | string;
  hasConverted: boolean;
  sessionId: string;
  fileType: string;
  startedAt: string;
  finishedAt: string;
}

export interface SessionFile {
  transcript: Utterance[];
  annotations: Annotation[]
}

export interface Utterance {
  _id: string;
  role: string;
  content: string;
  start_time: string;
  end_time: string;
  annotations: any[]
}

export interface Annotation {
  _id: string;
  identifiedBy: string;
}