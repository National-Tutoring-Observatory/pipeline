import type { File } from "~/modules/files/files.types";
import type { Project } from "~/modules/projects/projects.types";

export interface Session {
  _id: string;
  name: string;
  project: Project | string;
  file: File | string;
  sessionId?: string;
  fileType?: string;
  error?: string;
  hasConverted: boolean;
  hasErrored: boolean;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SessionFile {
  transcript: Utterance[];
  leadRole: string;
  annotations: Annotation[];
}

export interface Utterance {
  _id: string;
  role: string;
  content: string;
  start_time: string;
  end_time: string;
  timestamp: string;
  annotations: any[];
}

export interface Annotation {
  _id: string;
  identifiedBy: string;
}
