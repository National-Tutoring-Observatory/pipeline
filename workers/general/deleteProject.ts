import type { Job } from "bullmq";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import emitFromJob from "../helpers/emitFromJob";

export default async function deleteProjectProcess(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    throw new Error('missing projectId');
  }

  const documents = getDocumentsAdapter();

  await documents.deleteDocument({ collection: 'projects', match: { _id: projectId } });

  await emitFromJob(job as any, { projectId }, 'FINISHED');

  return { status: 'DELETED', projectId };
}
