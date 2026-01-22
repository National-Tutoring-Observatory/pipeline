import { emitter } from "~/modules/events/emitter";
import { RunService } from "~/modules/runs/run";
import { handler as outputRunDataToCSV } from "../../../functions/outputRunDataToCSV/app";
import { handler as outputRunDataToJSON } from "../../../functions/outputRunDataToJSON/app";

export default async function exportRun({
  runId,
  exportType,
}: {
  runId: string;
  exportType: string;
}) {
  const run = await RunService.findById(runId);
  if (!run) throw new Error("Run not found");

  const projectId = run.project as string;

  const inputFolder = `storage/${projectId}/runs/${runId}`;
  const outputFolder = `storage/${projectId}/runs/${runId}/exports`;

  await RunService.updateById(runId, { isExporting: true });

  emitter.emit("EXPORT_RUN", { runId, progress: 0, status: "STARTED" });

  if (exportType === "CSV") {
    await outputRunDataToCSV({ body: { run, inputFolder, outputFolder } });
  } else {
    await outputRunDataToJSON({ body: { run, inputFolder, outputFolder } });
  }

  let update = {
    isExporting: false,
    hasExportedCSV: run.hasExportedCSV,
    hasExportedJSONL: run.hasExportedJSONL,
  };

  if (exportType === "CSV") {
    update.hasExportedCSV = true;
  } else {
    update.hasExportedJSONL = true;
  }

  const downloadType = exportType === "CSV" ? "CSV" : "JSONL";
  const downloadUrl = `/api/downloads/${projectId}/${runId}?exportType=${downloadType}`;

  setTimeout(async () => {
    await RunService.updateById(runId, update);

    emitter.emit("EXPORT_RUN", {
      runId: runId,
      project: projectId,
      progress: 100,
      status: "DONE",
      exportType,
      url: downloadUrl,
    });
  }, 2000);
}
