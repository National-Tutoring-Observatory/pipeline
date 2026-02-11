import type { Job } from "bullmq";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function startExportRun(job: Job) {
  const { runId } = job.data;

  if (!runId) {
    throw new Error("startExportRun: runId is required");
  }

  const result = await RunService.updateById(runId, {
    isExporting: true,
  });

  if (!result) {
    throw new Error(`startExportRun: Run not found: ${runId}`);
  }

  await emitFromJob(job, { runId }, "FINISHED");

  return { status: "SUCCESS" };
}
