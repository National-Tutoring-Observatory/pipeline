export interface Prompt {
  _id: string;
  name: string;
  createdAt: string;
  annotationType: string;
  latestVersion: number;
}

export interface PromptVersion {
  _id: string;
  name: string;
  createdAt: string;
  prompt: number;
  version: number;
}