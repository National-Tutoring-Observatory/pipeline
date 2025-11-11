import type { Job } from 'bullmq';
import emitFromJob from 'workers/helpers/emitFromJob';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';

export default async function startAnnotateRun(job: Job) {

  const { runId } = job.data;

  const documents = getDocumentsAdapter();

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      isRunning: true,
      isComplete: false,
      hasErrored: false,
      startedAt: new Date()
    }
  });

  await emitFromJob(job, { runId }, 'FINISHED');

  return {
    status: 'SUCCESS'
  }

}
