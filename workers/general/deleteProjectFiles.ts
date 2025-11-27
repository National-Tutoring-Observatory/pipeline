import type { Job } from "bullmq";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { File } from "~/modules/files/files.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { getProjectFileStoragePath } from "~/modules/uploads/helpers/projectFileStorage";

export default async function deleteProjectFiles(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    return { status: 'ERRORED', message: 'missing projectId' };
  }

  const documents = getDocumentsAdapter();
  const storage = getStorageAdapter();

  const result = await documents.getDocuments({ collection: 'files', match: { project: projectId }, sort: {} }) as { data: File[] };
  const files = result.data;

  for (const file of files) {
    const path = getProjectFileStoragePath(projectId, file._id, file.name);
    await storage.remove({ sourcePath: path });
    await documents.deleteDocument({ collection: 'files', match: { _id: file._id } });
  }

  return { status: 'OK', projectId };
}
