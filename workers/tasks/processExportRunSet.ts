import type { Job } from "bullmq";
import { handler as outputRunSetDataToCSV } from "../../app/functions/outputRunSetDataToCSV/app";
import { handler as outputRunSetDataToJSONL } from "../../app/functions/outputRunSetDataToJSON/app";
import { RunService } from "../../app/modules/runs/run";
import { RunSetService } from "../../app/modules/runSets/runSet";
import emitFromJob from "../helpers/emitFromJob";

export default async function processExportRunSet(job: Job) {
  const { runSetId, exportType } = job.data;

  if (!runSetId) {
    throw new Error("processExportRunSet: runSetId is required");
  }

  if (!exportType) {
    throw new Error("processExportRunSet: exportType is required");
  }

  const runSet = await RunSetService.findById(runSetId);
  if (!runSet) {
    throw new Error(`processExportRunSet: Run set not found: ${runSetId}`);
  }

  const runs = await RunService.find({
    match: { _id: { $in: runSet.runs || [] } },
  });

  const inputDirectory = `storage/${runSet.project}/runs`;
  const outputDirectory = `storage/${runSet.project}/collections/${runSet._id}/exports`;

  if (exportType === "CSV") {
    await outputRunSetDataToCSV({
      body: {
        runSet,
        runs,
        inputFolder: inputDirectory,
        outputFolder: outputDirectory,
      },
    });
  } else {
    await outputRunSetDataToJSONL({
      body: {
        runSet,
        runs,
        inputFolder: inputDirectory,
        outputFolder: outputDirectory,
      },
    });
  }

  await emitFromJob(job, { runSetId }, "FINISHED");

  return { status: "SUCCESS", exportType };
}
