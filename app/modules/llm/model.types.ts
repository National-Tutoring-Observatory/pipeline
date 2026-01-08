
export interface ModelInfo {
  code: string;
  name: string;
  provider: string;
}

export interface Provider {
  name: string;
  models: Array<{ code: string; name: string }>;
}
