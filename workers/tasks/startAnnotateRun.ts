import type { Job } from "bullmq";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function startAnnotateRun(job: Job) {
  const { runId } = job.data;

  if (!runId) {
    throw new Error("startAnnotateRun: runId is required");
  }

  const run = await RunService.findById(runId);
  if (!run) {
    throw new Error(`startAnnotateRun: Run not found: ${runId}`);
  }

  if (run.stoppedAt) {
    await emitFromJob(job, { runId }, "FINISHED");
    return { status: "STOPPED" };
  }

  await RunService.updateById(runId, {
    isRunning: true,
    isComplete: false,
    hasErrored: false,
    stoppedAt: null,
    startedAt: new Date(),
  });

  await emitFromJob(job, { runId }, "FINISHED");

  return {
    status: "SUCCESS",
  };
}
