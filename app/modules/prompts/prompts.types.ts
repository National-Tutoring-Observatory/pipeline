export interface Prompt {
  _id: string;
  name: string;
  createdAt: string;
  annotationType: string;
}

export interface PromptVersion {
  _id: string;
  name: string;
  createdAt: string;
  prompt: string;
  version: number;
}