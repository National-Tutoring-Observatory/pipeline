export interface Collection {
  _id: string;
  name: string;
  project: string;
  sessions: [sessionId: string];
  runs: [runId: string];
  createdAt: string;
  hasSetup: false;
  isExporting: boolean;
  startedAt: string;
  finishedAt: string;
  hasExportedCSV: boolean;
  hasExportedJSONL: boolean;
}
export interface CreateCollection {
  selectedSessions: string[]
  selectedRuns: string[]
}