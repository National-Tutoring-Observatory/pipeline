export interface AnalysisResult {
  annotators: string[];
  annotationFields: string[];
  matchedSessions: { sessionId: string; name: string; _id: string }[];
  unmatchedSessionIds: string[];
}
