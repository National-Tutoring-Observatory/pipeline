export interface Evaluation {
  _id: string;
  name: string;
  project: string;
  collection: string;
  runs: string[];
  isExporting?: boolean;
  hasExportedCSV?: boolean;
  hasExportedJSONL?: boolean;
  createdAt?: string;
}
