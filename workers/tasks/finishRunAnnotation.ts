import type { Job } from 'bullmq';
import getSockets from 'workers/helpers/getSockets';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';

export default async function finishRunAnnotation(job: Job) {

  const { runId } = job.data;

  const documents = getDocumentsAdapter();

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      isRunning: false,
      isComplete: true,
      hasErrored: false,
      finishedAt: new Date()
    }
  });

  const sockets = await getSockets();

  sockets.emit('ANNOTATE_RUN_SESSIONS', {
    runId,
    task: 'FINISH_RUN_ANNOTATION',
    status: 'FINISHED'
  });

}
