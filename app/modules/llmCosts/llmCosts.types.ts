export interface LlmCost {
  _id: string;
  team: string;
  model: string;
  source: string;
  sourceId?: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  providerCost: number;
  createdAt: Date | string;
}
