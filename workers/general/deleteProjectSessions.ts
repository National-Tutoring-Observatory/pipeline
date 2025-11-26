import type { Job } from "bullmq";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Session } from "~/modules/sessions/sessions.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { getProjectSessionStoragePath } from "~/modules/uploads/helpers/projectSessionStorage";

export default async function deleteProjectFiles(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    return { status: 'ERRORED', message: 'missing projectId' };
  }

  const documents = getDocumentsAdapter();
  const storage = getStorageAdapter();

  const result = await documents.getDocuments({ collection: 'sessions', match: { project: projectId }, sort: {} }) as { data: Session[] };
  const sessions = result.data;

  for (const session of sessions) {
    const path = getProjectSessionStoragePath(projectId, session._id, session.name);
    await storage.remove({ sourcePath: path });
    await documents.deleteDocument({ collection: 'sessions', match: { _id: session._id } });
  }

  return { status: 'OK', projectId };
}
