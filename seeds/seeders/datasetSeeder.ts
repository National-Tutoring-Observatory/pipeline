import archiver from "archiver";
import fse from "fs-extra";
import path from "path";
import { PROJECT_ROOT } from "../../app/helpers/projectRoot";
import { getMtmFullDatasetZipPath } from "../../app/modules/datasets/helpers/getDatasetStoragePath";
import { prepareMtmDatasetFromFiles } from "../../app/modules/datasets/services/prepareMtmDataset";
import type { SessionFile } from "../../app/modules/sessions/sessions.types";
import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";

export async function seedDataset() {
  const fixturesDir = path.join(PROJECT_ROOT, "datasets/mtm/fixtures");

  if (!fse.existsSync(fixturesDir)) {
    console.log("  No fixtures found at datasets/mtm/fixtures/ — skipping.");
    return;
  }

  const { version } = await fse.readJSON(
    path.join(fixturesDir, "version.json"),
  );

  const files = await fse.readdir(fixturesDir);
  const sessionFiles = files.filter(
    (f) => f.endsWith(".json") && f !== "version.json",
  );

  const sessions = await Promise.all(
    sessionFiles.map(async (filename) => ({
      sessionId: path.basename(filename, ".json"),
      sessionFile: (await fse.readJSON(
        path.join(fixturesDir, filename),
      )) as SessionFile,
    })),
  );

  await prepareMtmDatasetFromFiles({ version, sessions });

  // Build and upload zip so the download button works locally
  const zipPath = path.join(
    PROJECT_ROOT,
    "tmp",
    `mtm-v${version}-fixtures.zip`,
  );
  await fse.ensureDir(path.dirname(zipPath));

  await new Promise<void>((resolve, reject) => {
    const output = fse.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(fixturesDir, `mtm-v${version}`);
    archive.finalize();
  });

  const zipBuffer = await fse.readFile(zipPath);
  const storage = getStorageAdapter();
  await storage.upload({
    file: {
      buffer: zipBuffer,
      size: zipBuffer.length,
      type: "application/zip",
    },
    uploadPath: getMtmFullDatasetZipPath(version),
  });
}
