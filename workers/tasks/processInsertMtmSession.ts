import type { Job } from "bullmq";
import fse from "fs-extra";
import { getDatasetSessionPath } from "../../app/modules/datasets/helpers/getDatasetStoragePath";
import { FileService } from "../../app/modules/files/file";
import { SessionService } from "../../app/modules/sessions/session";
import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";
import { getProjectFileStoragePath } from "../../app/modules/uploads/helpers/projectFileStorage";
import { getProjectSessionStoragePath } from "../../app/modules/uploads/helpers/projectSessionStorage";
import emitFromJob from "../helpers/emitFromJob";

export default async function processInsertMtmSession(job: Job) {
  const {
    projectId,
    sessionId,
    filename,
    inputTokens,
    version,
    totalSessions,
  } = job.data;

  try {
    await emitFromJob(job, { projectId, sessionId }, "STARTED");

    const storage = getStorageAdapter();

    const sourcePath = getDatasetSessionPath(version, filename);
    const downloadedPath = await storage.download({ sourcePath });
    const buffer = await fse.readFile(downloadedPath);

    const name = filename.replace(/\.json$/, "");

    const file = await FileService.create({
      name: `${name}.json`,
      project: projectId,
      fileType: "application/json",
      hasUploaded: true,
    });

    const fileStoragePath = getProjectFileStoragePath(
      projectId,
      file._id,
      `${name}.json`,
    );
    const fileUploadPromise = storage.upload({
      file: { buffer, size: buffer.length, type: "application/json" },
      uploadPath: fileStoragePath,
    });

    const session = await SessionService.create({
      name: `${name}.json`,
      project: projectId,
      file: file._id,
      fileType: "application/json",
      hasConverted: true,
      inputTokens,
    });

    const sessionStoragePath = getProjectSessionStoragePath(
      projectId,
      session._id,
      `${name}.json`,
    );
    await Promise.all([
      fileUploadPromise,
      storage.upload({
        file: { buffer, size: buffer.length, type: "application/json" },
        uploadPath: sessionStoragePath,
      }),
    ]);

    const completedSessionsCount = await SessionService.count({
      project: projectId,
      hasConverted: true,
    });

    await emitFromJob(
      job,
      {
        projectId,
        sessionId: session._id,
        progress: Math.round((100 / totalSessions) * completedSessionsCount),
      },
      "FINISHED",
    );

    return { status: "SUCCESS" };
  } catch (error) {
    await emitFromJob(job, { projectId, sessionId }, "ERRORED");
    return {
      status: "ERRORED",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
