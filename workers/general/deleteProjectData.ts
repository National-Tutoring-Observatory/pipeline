import type { Job } from "bullmq";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { getProjectStorageDir } from "~/modules/uploads/helpers/projectStorage";

export default async function deleteProjectData(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    throw new Error('missing projectId');
  }

  const documents = getDocumentsAdapter();
  const storage = getStorageAdapter();

  // Delete all documents
  await documents.deleteDocuments({ collection: 'runs', match: { project: projectId } });
  await documents.deleteDocuments({ collection: 'sessions', match: { project: projectId } });
  await documents.deleteDocuments({ collection: 'files', match: { project: projectId } });
  await documents.deleteDocuments({ collection: 'collections', match: { project: projectId } });

  // Delete entire project storage directory
  const projectStorageDir = getProjectStorageDir(projectId);
  await storage.removeDir({ sourcePath: projectStorageDir });

  return { status: 'OK', projectId };
}
