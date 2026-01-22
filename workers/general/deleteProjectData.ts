import type { Job } from "bullmq";
import { FileService } from "~/modules/files/file";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { getProjectStorageDir } from "~/modules/uploads/helpers/projectStorage";

export default async function deleteProjectData(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    throw new Error("missing projectId");
  }

  const storage = getStorageAdapter();

  // Delete all files
  await FileService.deleteByProject(projectId);

  // Delete entire project storage directory
  const projectStorageDir = getProjectStorageDir(projectId);
  await storage.removeDir({ sourcePath: projectStorageDir });

  return { status: "OK", projectId };
}
