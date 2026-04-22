export type LlmCostSource =
  | "annotation:per-session"
  | "annotation:per-utterance"
  | "verification:per-session"
  | "verification:per-utterance"
  | "file-conversion"
  | "codebook-prompt-generation"
  | "attribute-mapping"
  | "prompt-alignment"
  | "adjudication:per-utterance"
  | "adjudication:per-session";

export interface CostByModel {
  model: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export interface CostBySource {
  source: string;
  totalCost: number;
}

export interface CostOverTime {
  period: string;
  totalCost: number;
}

export type SpendGranularity = "day" | "week" | "month";
