import { emitter } from "~/modules/events/emitter";
import { RunService } from "~/modules/runs/run";
import { handler as outputCollectionDataToCSV } from "../../../functions/outputCollectionDataToCSV/app";
import { CollectionService } from "../collection";

export default async function exportCollection({
  collectionId,
  exportType,
}: {
  collectionId: string;
  exportType: string;
}) {
  const collection = await CollectionService.findById(collectionId);
  if (!collection) {
    throw new Error("Collection not found");
  }

  const runs = await RunService.find({
    match: { _id: { $in: collection.runs || [] } },
  });

  const inputDirectory = `storage/${collection.project}/runs`;

  const outputDirectory = `storage/${collection.project}/collections/${collection._id}/exports`;

  await CollectionService.updateById(collectionId, {
    isExporting: true,
  });

  emitter.emit("EXPORT_COLLECTION", {
    collectionId,
    progress: 0,
    status: "STARTED",
  });

  if (exportType === "CSV") {
    await outputCollectionDataToCSV({
      body: {
        collection,
        runs,
        inputFolder: inputDirectory,
        outputFolder: outputDirectory,
      },
    });
  } else {
    //await outputCollectionDataToJSON({ body: { collection, runs, inputFolder: inputDirectory, outputFolder: outputDirectory } });
  }

  let update = {
    isExporting: false,
    hasExportedCSV: collection.hasExportedCSV,
    hasExportedJSONL: collection.hasExportedJSONL,
  };

  if (exportType === "CSV") {
    update.hasExportedCSV = true;
  } else {
    update.hasExportedJSONL = true;
  }

  setTimeout(async () => {
    await CollectionService.updateById(collectionId, update);

    emitter.emit("EXPORT_COLLECTION", {
      collectionId,
      progress: 100,
      status: "DONE",
    });
  }, 2000);
}
