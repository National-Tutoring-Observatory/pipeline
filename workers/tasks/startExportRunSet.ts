import type { Job } from "bullmq";
import { RunSetService } from "../../app/modules/runSets/runSet";
import emitFromJob from "../helpers/emitFromJob";

export default async function startExportRunSet(job: Job) {
  const { runSetId } = job.data;

  if (!runSetId) {
    throw new Error("startExportRunSet: runSetId is required");
  }

  const result = await RunSetService.updateById(runSetId, {
    isExporting: true,
  });

  if (!result) {
    throw new Error(`startExportRunSet: Run set not found: ${runSetId}`);
  }

  await emitFromJob(job, { runSetId }, "FINISHED");

  return { status: "SUCCESS" };
}
