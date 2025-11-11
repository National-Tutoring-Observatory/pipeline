import type { Job } from 'bullmq';
import find from 'lodash/find.js';
import emitFromJob from 'workers/helpers/emitFromJob';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';

export default async function finishAnnotateRun(job: Job) {

  const { runId } = job.data;

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  const documents = getDocumentsAdapter();

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      isRunning: false,
      isComplete: true,
      hasErrored: hasFailedTasks,
      finishedAt: new Date()
    }
  });

  await emitFromJob(job, { runId }, 'FINISHED');

  return { status: 'SUCCESS' };

}
