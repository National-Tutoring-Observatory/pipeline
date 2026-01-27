export interface ModelInfo {
  code: string;
  name: string;
  provider: string;
  inputCostPer1M?: number;
  outputCostPer1M?: number;
}

export interface Provider {
  name: string;
  models: Array<{
    code: string;
    name: string;
    inputCostPer1M?: number;
    outputCostPer1M?: number;
  }>;
}
