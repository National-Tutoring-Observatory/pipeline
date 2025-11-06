import type { Job } from 'bullmq';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';

export default async function startRunAnnotation(job: Job) {

  const { runId } = job.data;

  const documents = getDocumentsAdapter();

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      isRunning: true,
      startedAt: new Date()
    }
  });

}
