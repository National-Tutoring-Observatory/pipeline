export interface Evaluation {
  _id: string;
  name: string;
  project: string;
  runSet: string;
  baseRun: string;
  runs: string[];
  annotationFields: string[];
  isRunning?: boolean;
  isComplete?: boolean;
  hasErrored?: boolean;
  startedAt?: string;
  finishedAt?: string;
  isExporting?: boolean;
  hasExportedCSV?: boolean;
  hasExportedJSONL?: boolean;
  createdAt?: string;
}
