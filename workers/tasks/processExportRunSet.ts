import type { Job } from "bullmq";
import { handler as outputRunSetDataToCSV } from "../../app/functions/outputRunSetDataToCSV/app";
import { handler as outputRunSetDataToJSONL } from "../../app/functions/outputRunSetDataToJSON/app";
import { ProjectService } from "../../app/modules/projects/project";
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
    sort: { isHuman: -1, createdAt: 1 },
  });

  const project = await ProjectService.findById(runSet.project as string);
  const teamId = project!.team as string;
  const inputDirectory = `storage/${runSet.project}/runs`;
  const outputDirectory = `storage/${runSet.project}/run-sets/${runSet._id}/exports`;

  if (exportType === "CSV") {
    await outputRunSetDataToCSV({
      body: {
        runSet,
        runs,
        teamId,
        inputFolder: inputDirectory,
        outputFolder: outputDirectory,
      },
    });
  } else {
    await outputRunSetDataToJSONL({
      body: {
        runSet,
        runs,
        teamId,
        inputFolder: inputDirectory,
        outputFolder: outputDirectory,
      },
    });
  }

  await emitFromJob(job, { runSetId }, "FINISHED");

  return { status: "SUCCESS", exportType };
}
