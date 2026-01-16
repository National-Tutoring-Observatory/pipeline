export interface Collection {
  _id: string;
  name: string;
  project: string;
  sessions?: string[];
  runs?: string[];
  createdAt?: string;
  hasSetup?: boolean;
  isExporting?: boolean;
  startedAt?: string;
  finishedAt?: string;
  hasExportedCSV?: boolean;
  hasExportedJSONL?: boolean;
}
export interface CreateCollection {
  selectedSessions: string[]
  selectedRuns: string[]
}
