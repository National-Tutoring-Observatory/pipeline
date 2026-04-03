export interface MtmLatest {
  version: number;
}

export interface MtmManifestSession {
  sessionId: string;
  filename: string;
  inputTokens: number;
  utteranceCount: number;
  leadRole: string;
}

export interface MtmManifest {
  version: number;
  createdAt: string;
  sessionCount: number;
  sessions: MtmManifestSession[];
}
