export interface Session {
  _id: string;
  name: string;
  createdAt: string;
  project: string;
  file: string;
  hasConverted: boolean;
  fileType: string;
  startedAt: string;
  finishedAt: string;
}

export interface SessionFile {
  transcript: [];
  annotations: Utterance[]
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