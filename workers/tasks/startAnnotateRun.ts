import type { Job } from 'bullmq';
import getSockets from 'workers/helpers/getSockets';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';

export default async function startAnnotateRun(job: Job) {

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

  const sockets = await getSockets();

  sockets.emit('ANNOTATE_RUN', {
    runId,
    task: 'START_ANNOTATE_RUN',
    status: 'FINISHED'
  });

}
