import type { Job } from "bullmq";
import find from "lodash/find.js";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function finishExportRun(job: Job) {
  const { runId, exportType } = job.data;

  if (!runId) {
    throw new Error("finishExportRun: runId is required");
  }

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  const run = await RunService.findById(runId);
  if (!run) {
    throw new Error(`finishExportRun: Run not found: ${runId}`);
  }

  await RunService.updateById(runId, { isExporting: false });

  const projectId = run.project as string;
  const downloadType = exportType === "CSV" ? "CSV" : "JSONL";
  const downloadUrl = `/api/downloads/${projectId}/${runId}?exportType=${downloadType}`;

  await emitFromJob(
    job,
    {
      runId,
      hasErrored: hasFailedTasks,
      downloadUrl: hasFailedTasks ? null : downloadUrl,
      exportType,
    },
    "FINISHED",
  );

  return { status: hasFailedTasks ? "ERRORED" : "SUCCESS" };
}
