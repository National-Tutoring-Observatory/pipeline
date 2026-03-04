import type { Job } from "bullmq";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function startUploadHumanAnnotations(job: Job) {
  const { runId } = job.data;

  if (!runId) {
    throw new Error("startUploadHumanAnnotations: runId is required");
  }

  await RunService.updateById(runId, {
    isRunning: true,
    isComplete: false,
    hasErrored: false,
    stoppedAt: null,
    startedAt: new Date(),
  });

  await emitFromJob(job, { runId }, "FINISHED");

  return { status: "SUCCESS" };
}
