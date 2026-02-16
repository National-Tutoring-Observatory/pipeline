export interface Evaluation {
  _id: string;
  name: string;
  project: string;
  runSet: string;
  runs: string[];
  isExporting?: boolean;
  hasExportedCSV?: boolean;
  hasExportedJSONL?: boolean;
  createdAt?: string;
}
