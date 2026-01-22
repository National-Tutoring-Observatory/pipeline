import type { Job } from "bullmq";
import find from "lodash/find.js";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function finishAnnotateRun(job: Job) {
  const { runId } = job.data;

  if (!runId) {
    throw new Error("finishAnnotateRun: runId is required");
  }

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  const result = await RunService.updateById(runId, {
    isRunning: false,
    isComplete: true,
    hasErrored: hasFailedTasks,
    finishedAt: new Date(),
  });

  if (!result) {
    throw new Error(`finishAnnotateRun: Run not found: ${runId}`);
  }

  await emitFromJob(job, { runId }, "FINISHED");

  return { status: "SUCCESS" };
}
