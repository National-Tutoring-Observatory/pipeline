export interface AnalysisResult {
  annotators: string[];
  annotationFields: string[];
  matchedSessions: { sessionId: string; name: string; _id: string }[];
  unmatchedSessionIds: string[];
}

export interface AnnotationTemplateField {
  fieldKey: string;
  slots: number;
}

export interface AnnotationTemplateConfig {
  annotators: string[];
  fields: AnnotationTemplateField[];
}
