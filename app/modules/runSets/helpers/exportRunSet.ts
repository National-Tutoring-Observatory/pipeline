import { emitter } from "~/modules/events/emitter";
import { RunService } from "~/modules/runs/run";
import { handler as outputRunSetDataToCSV } from "../../../functions/outputRunSetDataToCSV/app";
import { handler as outputRunSetDataToJSONL } from "../../../functions/outputRunSetDataToJSON/app";
import { RunSetService } from "../runSet";

export default async function exportRunSet({
  runSetId,
  exportType,
}: {
  runSetId: string;
  exportType: string;
}) {
  const runSet = await RunSetService.findById(runSetId);
  if (!runSet) {
    throw new Error("Run set not found");
  }

  const runs = await RunService.find({
    match: { _id: { $in: runSet.runs || [] } },
  });

  const inputDirectory = `storage/${runSet.project}/runs`;

  const outputDirectory = `storage/${runSet.project}/collections/${runSet._id}/exports`;

  await RunSetService.updateById(runSetId, {
    isExporting: true,
  });

  emitter.emit("EXPORT_RUN_SET", {
    runSetId,
    progress: 0,
    status: "STARTED",
  });

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

  const update = {
    isExporting: false,
    hasExportedCSV: runSet.hasExportedCSV,
    hasExportedJSONL: runSet.hasExportedJSONL,
  };

  if (exportType === "CSV") {
    update.hasExportedCSV = true;
  } else {
    update.hasExportedJSONL = true;
  }

  const downloadType = exportType === "CSV" ? "CSV" : "JSONL";
  const downloadUrl = `/api/downloads/${runSet.project}/run-sets/${runSet._id}?exportType=${downloadType}`;

  setTimeout(async () => {
    await RunSetService.updateById(runSetId, update);

    emitter.emit("EXPORT_RUN_SET", {
      runSetId,
      progress: 100,
      status: "DONE",
      exportType,
      url: downloadUrl,
    });
  }, 2000);
}
