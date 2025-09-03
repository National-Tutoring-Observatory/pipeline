import type { Run } from "../runs.types";
import { emitter } from "~/core/events/emitter";
import { handler as outputRunDataToCSV } from '../../../functions/outputRunDataToCSV/app';
import { handler as outputRunDataToJSON } from '../../../functions/outputRunDataToJSON/app';
import getDocumentsAdapter from "~/core/documents/helpers/getDocumentsAdapter";

export default async function exportRun({ runId, exportType }: { runId: string, exportType: string }) {

  const documents = getDocumentsAdapter();

  const run = await documents.getDocument({ collection: 'runs', match: { _id: runId } }) as { data: Run };

  const inputDirectory = `storage/${run.data.project}/runs/${run.data._id}`;

  const outputDirectory = `storage/${run.data.project}/runs/${run.data._id}/exports`;

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


  setTimeout(async () => {

    await documents.updateDocument({
      collection: 'runs',
      match: { _id: runId },
      update
    });


    emitter.emit("EXPORT_RUN", { runId: runId, progress: 100, status: 'DONE' });

  }, 2000);

}