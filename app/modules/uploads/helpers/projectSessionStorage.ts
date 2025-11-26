import path from "path";

export function getProjectSessionStorageDir(projectId: string, sessionId: string) {
  return `storage/${projectId}/preAnalysis/${sessionId}`;
}

export function getProjectSessionStoragePath(projectId: string, sessionId: string, filename: string) {
  const sanitizedFilename = path.basename(filename);
  return `${getProjectSessionStorageDir(projectId, sessionId)}/${sanitizedFilename}`;
}
