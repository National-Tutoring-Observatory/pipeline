import type { Collection } from "../collections.types";
import { emitter } from "~/core/events/emitter";
import { handler as outputCollectionDataToCSV } from '../../../functions/outputCollectionDataToCSV/app';
import { handler as outputCollectionDataToJSON } from '../../../functions/outputCollectionDataToJSON/app';
import includes from 'lodash/includes';
import type { Run } from "~/modules/runs/runs.types";
import getDocumentsAdapter from "~/core/documents/helpers/getDocumentsAdapter";

export default async function exportCollection({ collectionId, exportType }: { collectionId: string, exportType: string }) {

  const documents = getDocumentsAdapter();

  const collection = await documents.getDocument({ collection: 'collections', match: { _id: collectionId } }) as { data: Collection };

  const runs = await documents.getDocuments({
    collection: 'runs',
    match: (item: Run) => {
      if (includes(collection.data.runs, item._id)) {
        return true;
      }
    }, sort: {}
  }) as { data: Run[] };

  const inputDirectory = `storage/${collection.data.project}/runs`;

  const outputDirectory = `storage/${collection.data.project}/collections/${collection.data._id}/exports`;

  await documents.updateDocument({
    collection: 'collections',
    match: { _id: collectionId },
    update: {
      isExporting: true
    }
  });

  emitter.emit("EXPORT_COLLECTION", { collectionId: Number(collectionId), progress: 0, status: 'STARTED' });

  if (exportType === 'CSV') {
    await outputCollectionDataToCSV({ body: { collection: collection.data, runs: runs.data, inputFolder: inputDirectory, outputFolder: outputDirectory } });
  } else {
    //await outputCollectionDataToJSON({ body: { collection: collection.data, runs: runs.data, inputFolder: inputDirectory, outputFolder: outputDirectory } });
  }

  let update = { isExporting: false, hasExportedCSV: collection.data.hasExportedCSV, hasExportedJSONL: collection.data.hasExportedJSONL };

  if (exportType === 'CSV') {
    update.hasExportedCSV = true;
  } else {
    update.hasExportedJSONL = true;
  }


  setTimeout(async () => {

    await documents.updateDocument({
      collection: 'collections',
      match: { _id: collectionId },
      update
    });


    emitter.emit("EXPORT_COLLECTION", { collectionId: Number(collectionId), progress: 100, status: 'DONE' });

  }, 2000);

}