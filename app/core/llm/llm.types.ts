export interface LLMSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  responseFormat: 'json' | 'text';
  stream: boolean;
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  responseFormat: 'json',
  stream: false
}
export interface LLMOptions {
  quality?: string;
  model?: string;
  stream?: boolean;
  format?: string;
  retries?: number;
  modelSettings?: LLMSettings;
};