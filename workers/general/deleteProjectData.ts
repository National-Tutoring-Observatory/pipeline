import type { Job } from "bullmq";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import { FileService } from "~/modules/files/file";
import { RunService } from "~/modules/runs/run";
import { RunSetService } from "~/modules/runSets/runSet";
import { SessionService } from "~/modules/sessions/session";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { getProjectStorageDir } from "~/modules/uploads/helpers/projectStorage";

export default async function deleteProjectData(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    throw new Error("missing projectId");
  }

  const storage = getStorageAdapter();

  await Promise.all([
    FileService.deleteByProject(projectId),
    SessionService.deleteByProject(projectId),
    RunService.deleteByProject(projectId),
    RunSetService.deleteByProject(projectId),
    EvaluationService.deleteByProject(projectId),
  ]);

  const projectStorageDir = getProjectStorageDir(projectId);
  await storage.removeDir({ sourcePath: projectStorageDir });

  return { status: "OK", projectId };
}
