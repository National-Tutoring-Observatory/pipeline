import type { Job } from "bullmq";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import emitFromJob from "../helpers/emitFromJob";

export default async function deleteProjectProcess(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    return { status: 'ERRORED', message: 'missing projectId' };
  }

  const documents = getDocumentsAdapter();
  const storage = getStorageAdapter();

  try {
    try {
      await documents.deleteDocument({ collection: 'projects', match: { _id: projectId } });
    } catch (err) {
      console.warn('[deleteProject][db] failed to delete project document', projectId, err);
    }

    // notify clients that the delete has finished so UI routes can refresh
    try {
      await emitFromJob(job as any, { projectId }, 'FINISHED');
    } catch (err) {
      console.warn('[deleteProject] failed to emit delete finished event', err);
    }

    return { status: 'DELETED', projectId };
  } catch (error) {
    console.error('[deleteProjectProcess] error', error);
    // @ts-ignore
    throw new Error(error);
  }
}
