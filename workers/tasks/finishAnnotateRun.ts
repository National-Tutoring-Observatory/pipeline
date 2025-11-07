import type { Job } from 'bullmq';
import getSockets from 'workers/helpers/getSockets';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';

export default async function finishAnnotateRun(job: Job) {

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

  sockets.emit('ANNOTATE_RUN', {
    runId,
    task: 'FINISH_ANNOTATE_RUN',
    status: 'FINISHED'
  });

}
