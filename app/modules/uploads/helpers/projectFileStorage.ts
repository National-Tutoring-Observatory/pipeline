import path from "path";

export function getProjectFileStorageDir(projectId: string, fileId: string) {
  return `storage/${projectId}/files/${fileId}`;
}

export function getProjectFileStoragePath(projectId: string, fileId: string, filename: string) {
  const sanitizedFilename = path.basename(filename);
  return `${getProjectFileStorageDir(projectId, fileId)}/${sanitizedFilename}`;
}
