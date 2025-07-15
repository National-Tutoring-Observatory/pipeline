export interface Prompt {
  _id: string;
  name: string;
  createdAt: string;
  annotationType: string;
  productionVersion: number;
}

export interface PromptVersion {
  _id: string;
  name: string;
  createdAt: string;
  prompt: number;
  version: number;
  userPrompt: string;
  annotationSchema: [],
  hasBeenSaved: boolean,
  updatedAt: string,
}

export interface Model {
  provider: string;
  name: string;
}

export interface AnnotationType {
  value: string;
  name: string;
}