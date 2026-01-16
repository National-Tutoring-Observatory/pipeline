import type { Job } from 'bullmq';
import { RunService } from '../../app/modules/runs/run';
import emitFromJob from '../helpers/emitFromJob';

export default async function startAnnotateRun(job: Job) {

  const { runId } = job.data;

  if (!runId) {
    throw new Error('startAnnotateRun: runId is required');
  }

  const result = await RunService.updateById(runId, {
    isRunning: true,
    isComplete: false,
    hasErrored: false,
    startedAt: new Date()
  });

  if (!result) {
    throw new Error(`startAnnotateRun: Run not found: ${runId}`);
  }

  await emitFromJob(job, { runId }, 'FINISHED');

  return {
    status: 'SUCCESS'
  }

}
