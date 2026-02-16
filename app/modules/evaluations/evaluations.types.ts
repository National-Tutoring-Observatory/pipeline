export interface Evaluation {
  _id: string;
  name: string;
  project: string;
  runSet: string;
  baseRun: string;
  runs: string[];
  isExporting?: boolean;
  hasExportedCSV?: boolean;
  hasExportedJSONL?: boolean;
  createdAt?: string;
}
