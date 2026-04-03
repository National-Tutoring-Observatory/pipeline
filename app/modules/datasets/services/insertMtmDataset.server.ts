import fse from "fs-extra";
import TaskSequencer from "~/modules/queues/helpers/taskSequencer";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import type { MtmLatest, MtmManifest } from "../datasets.types";
import {
  getDatasetLatestPath,
  getDatasetManifestPath,
} from "../helpers/getDatasetStoragePath";

export default async function insertMtmDataset({
  projectId,
}: {
  projectId: string;
}) {
  const storage = getStorageAdapter();

  const latestPath = await storage.download({
    sourcePath: getDatasetLatestPath(),
  });
  const latest: MtmLatest = await fse.readJSON(latestPath);
  const { version } = latest;

  const manifestPath = await storage.download({
    sourcePath: getDatasetManifestPath(version),
  });
  const manifest: MtmManifest = await fse.readJSON(manifestPath);

  const taskSequencer = new TaskSequencer("INSERT_MTM_DATASET");

  taskSequencer.addTask("START", { projectId });

  for (const session of manifest.sessions) {
    taskSequencer.addTask(
      "PROCESS",
      {
        projectId,
        sessionId: session.sessionId,
        filename: session.filename,
        inputTokens: session.inputTokens,
        version,
        totalSessions: manifest.sessionCount,
      },
      { group: { id: projectId } },
    );
  }

  taskSequencer.addTask("FINISH", { projectId });

  await taskSequencer.run();
}
