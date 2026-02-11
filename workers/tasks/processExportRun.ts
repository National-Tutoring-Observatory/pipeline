import type { Job } from "bullmq";
import { handler as outputRunDataToCSV } from "../../app/functions/outputRunDataToCSV/app";
import { handler as outputRunDataToJSON } from "../../app/functions/outputRunDataToJSON/app";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function processExportRun(job: Job) {
  const { runId, exportType } = job.data;

  if (!runId) {
    throw new Error("processExportRun: runId is required");
  }

  if (!exportType) {
    throw new Error("processExportRun: exportType is required");
  }

  const run = await RunService.findById(runId);
  if (!run) {
    throw new Error(`processExportRun: Run not found: ${runId}`);
  }

  const projectId = run.project as string;
  const inputFolder = `storage/${projectId}/runs/${runId}`;
  const outputFolder = `storage/${projectId}/runs/${runId}/exports`;

  if (exportType === "CSV") {
    await outputRunDataToCSV({ body: { run, inputFolder, outputFolder } });
  } else {
    await outputRunDataToJSON({ body: { run, inputFolder, outputFolder } });
  }

  await emitFromJob(job, { runId }, "FINISHED");

  return { status: "SUCCESS", exportType };
}
