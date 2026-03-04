import type { Job } from "bullmq";
import find from "lodash/find.js";
import { RunSetService } from "../../app/modules/runSets/runSet";
import emitFromJob from "../helpers/emitFromJob";

export default async function finishExportRunSet(job: Job) {
  const { runSetId, exportType } = job.data;

  if (!runSetId) {
    throw new Error("finishExportRunSet: runSetId is required");
  }

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  const runSet = await RunSetService.findById(runSetId);
  if (!runSet) {
    throw new Error(`finishExportRunSet: Run set not found: ${runSetId}`);
  }

  await RunSetService.updateById(runSetId, { isExporting: false });

  const downloadType = exportType === "CSV" ? "CSV" : "JSONL";
  const downloadUrl = `/api/downloads/${runSet.project}/run-sets/${runSet._id}?exportType=${downloadType}`;

  await emitFromJob(
    job,
    {
      runSetId,
      hasErrored: hasFailedTasks,
      downloadUrl: hasFailedTasks ? null : downloadUrl,
      exportType,
    },
    "FINISHED",
  );

  return { status: hasFailedTasks ? "ERRORED" : "SUCCESS" };
}
