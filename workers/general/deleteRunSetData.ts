import type { Job } from "bullmq";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export default async function deleteRunSetData(job: Job) {
  const { runSetId, projectId } = job.data || {};

  if (!runSetId || !projectId) {
    throw new Error("missing runSetId or projectId");
  }

  const storage = getStorageAdapter();

  const exportsDir = `storage/${projectId}/collections/${runSetId}/exports`;
  await storage.removeDir({ sourcePath: exportsDir });

  return { status: "OK", runSetId };
}
