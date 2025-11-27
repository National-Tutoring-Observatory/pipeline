import type { Job } from 'bullmq';
import find from 'lodash/find.js';
import type { Run } from '../../app/modules/runs/runs.types';
import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter';
import emitFromJob from '../helpers/emitFromJob';

export default async function finishAnnotateRun(job: Job) {

  const { runId } = job.data;

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  const documents = getDocumentsAdapter();

  await documents.updateDocument<Run>({
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
