import type { Team } from "../teams/teams.types";
import type { User } from "../users/users.types";

export interface Prompt {
  _id: string;
  name: string;
  team: Team | string;
  createdAt: string;
  annotationType: string;
  productionVersion: number;
  createdBy: User | string;
}

export interface PromptVersion {
  _id: string;
  name: string;
  createdAt: string;
  prompt: Prompt | string;
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

export interface AnnotationSchemaItem {
  fieldKey: string;
  value: any;
  isSystem: boolean;
};