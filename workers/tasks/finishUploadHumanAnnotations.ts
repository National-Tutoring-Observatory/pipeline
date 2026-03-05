import type { Job } from "bullmq";
import find from "lodash/find.js";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function finishUploadHumanAnnotations(job: Job) {
  const { runId } = job.data;

  if (!runId) {
    throw new Error("finishUploadHumanAnnotations: runId is required");
  }

  const run = await RunService.findById(runId);
  if (!run) {
    throw new Error(`finishUploadHumanAnnotations: Run not found: ${runId}`);
  }

  if (run.stoppedAt) {
    await emitFromJob(job, { runId }, "FINISHED");
    return { status: "STOPPED" };
  }

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  await RunService.updateById(runId, {
    isRunning: false,
    isComplete: true,
    hasErrored: hasFailedTasks,
    finishedAt: new Date(),
  });

  await emitFromJob(job, { runId }, "FINISHED");

  return { status: "SUCCESS" };
}
