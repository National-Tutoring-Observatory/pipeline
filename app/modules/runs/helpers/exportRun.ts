import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { emitter } from "~/modules/events/emitter";
import { handler as outputRunDataToCSV } from '../../../functions/outputRunDataToCSV/app';
import { handler as outputRunDataToJSON } from '../../../functions/outputRunDataToJSON/app';
import type { Run } from "../runs.types";

export default async function exportRun({ runId, exportType }: { runId: string, exportType: string }) {

  const documents = getDocumentsAdapter();

  const run = await documents.getDocument<Run>({ collection: 'runs', match: { _id: runId } });
  if (!run.data) throw new Error('Run not found');

  const projectId = run.data.project;

  const inputDirectory = `storage/${projectId}/runs/${runId}`;
  const outputDirectory = `storage/${projectId}/runs/${runId}/exports`;

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      isExporting: true
    }
  });

  emitter.emit("EXPORT_RUN", { runId, progress: 0, status: 'STARTED' });

  if (exportType === 'CSV') {
    await outputRunDataToCSV({ body: { run: run.data, inputFolder: inputDirectory, outputFolder: outputDirectory } });
  } else {
    await outputRunDataToJSON({ body: { run: run.data, inputFolder: inputDirectory, outputFolder: outputDirectory } });
  }

  let update = { isExporting: false, hasExportedCSV: run.data.hasExportedCSV, hasExportedJSONL: run.data.hasExportedJSONL };

  if (exportType === 'CSV') {
    update.hasExportedCSV = true;
  } else {
    update.hasExportedJSONL = true;
  }

  const downloadType = exportType === 'CSV' ? 'CSV' : 'JSONL';
  const downloadUrl = `/api/downloads/${projectId}/${runId}?exportType=${downloadType}`;

  setTimeout(async () => {
    await documents.updateDocument({
      collection: 'runs',
      match: { _id: runId },
      update
    });

    emitter.emit("EXPORT_RUN", { runId: runId, project: projectId, progress: 100, status: 'DONE', exportType, url: downloadUrl });
  }, 2000);
}
