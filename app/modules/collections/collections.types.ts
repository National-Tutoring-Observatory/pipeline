export interface Collection {
  _id: string;
  name: string;
  project: string;
  sessions: [sessionId: number]
  createdAt: string;
  hasSetup: false;
  isExporting: boolean;
  hasExportedCSV: boolean;
  hasExportedJSONL: boolean;
}
export interface CreateCollection {
  selectedSessions: number[]
  selectedRuns: number[]
}