export interface Collection {
  _id: string;
  name: string;
  project: string;
  sessions: string[];
  runs?: string[];
  annotationType: string;
  createdAt?: string;
  hasSetup?: boolean;
  isExporting?: boolean;
  hasExportedCSV?: boolean;
  hasExportedJSONL?: boolean;
}

export interface CreateCollection {
  selectedSessions: string[];
  selectedRuns: string[];
}

export interface PromptReference {
  promptId: string;
  promptName: string;
  version: number;
}

export interface PrefillData {
  sourceRunId?: string;
  sourceRunName?: string;
  sourceCollectionId?: string;
  sourceCollectionName?: string;
  annotationType: string;
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  selectedSessions: string[];
  validationErrors?: string[];
}
