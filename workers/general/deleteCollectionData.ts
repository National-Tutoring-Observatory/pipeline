import type { Job } from "bullmq";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export default async function deleteCollectionData(job: Job) {
  const { collectionId, projectId } = job.data || {};

  if (!collectionId || !projectId) {
    throw new Error("missing collectionId or projectId");
  }

  const storage = getStorageAdapter();

  // Delete collection exports directory
  const collectionExportsDir = `storage/${projectId}/collections/${collectionId}/exports`;
  await storage.removeDir({ sourcePath: collectionExportsDir });

  return { status: "OK", collectionId };
}
