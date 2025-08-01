export interface LLMSettings {
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  responseFormat: 'json' | 'text';
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  responseFormat: 'json',
}

export interface LLMOptions {
  quality?: string;
  model?: string;
  format?: string;
  retries?: number;
  modelSettings?: LLMSettings;
};
