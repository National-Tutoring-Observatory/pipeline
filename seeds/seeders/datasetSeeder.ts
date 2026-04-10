import archiver from "archiver";
import extract from "extract-zip";
import fse from "fs-extra";
import path from "path";
import { PROJECT_ROOT } from "../../app/helpers/projectRoot";
import { convertMtmToSessionFile } from "../../app/modules/datasets/helpers/convertMtmToSessionFile";
import { getMtmFullDatasetZipPath } from "../../app/modules/datasets/helpers/getDatasetStoragePath";
import { prepareMtmDatasetFromFiles } from "../../app/modules/datasets/services/prepareMtmDataset";
import type { SessionFile } from "../../app/modules/sessions/sessions.types";
import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";

const DATASET_ZIP_PATH = path.join(PROJECT_ROOT, "datasets/mtm/dataset.zip");
const SAMPLE_SIZE = 50;

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function stratifiedSample(
  sessions: Array<{ sessionId: string; sessionFile: SessionFile }>,
  targetSize: number,
): Array<{ sessionId: string; sessionFile: SessionFile }> {
  if (targetSize >= sessions.length) return sessions;

  const sorted = [...sessions].sort(
    (a, b) => a.sessionFile.transcript.length - b.sessionFile.transcript.length,
  );

  const bucketCount = 4;
  const bucketSize = Math.floor(sorted.length / bucketCount);
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = i * bucketSize;
    const end = i === bucketCount - 1 ? sorted.length : start + bucketSize;
    return sorted.slice(start, end);
  });

  const result: Array<{ sessionId: string; sessionFile: SessionFile }> = [];

  for (let i = 0; i < bucketCount; i++) {
    const bucket = buckets[i];
    const n =
      i === bucketCount - 1
        ? targetSize - result.length
        : Math.round((bucket.length / sessions.length) * targetSize);
    result.push(...shuffle(bucket).slice(0, n));
  }

  return result;
}

async function loadSessionsFromZip(zipPath: string): Promise<{
  version: number;
  sessions: Array<{ sessionId: string; sessionFile: SessionFile }>;
}> {
  const extractDir = path.join(PROJECT_ROOT, "tmp/datasets/mtm/extracted");
  await fse.emptyDir(extractDir);
  await extract(zipPath, { dir: extractDir });

  const entries = await fse.readdir(extractDir);
  const versionDir = entries.find((e) => /^mtm-v\d+$/.test(e));
  if (!versionDir) {
    throw new Error(
      `Zip does not contain a mtm-vN directory. Found: ${entries.join(", ")}`,
    );
  }

  const version = parseInt(versionDir.replace("mtm-v", ""), 10);
  const sessionsDir = path.join(extractDir, versionDir);
  const files = await fse.readdir(sessionsDir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const sessions = await Promise.all(
    jsonFiles.map(async (filename) => {
      const raw = await fse.readJSON(path.join(sessionsDir, filename));
      const sessionId = raw.id as string;
      return { sessionId, sessionFile: convertMtmToSessionFile(raw) };
    }),
  );

  return { version, sessions };
}

export async function seedDataset() {
  if (!fse.existsSync(DATASET_ZIP_PATH)) {
    throw new Error(
      "No dataset zip found at datasets/mtm/dataset.zip. Place the full MTM dataset zip there and retry.",
    );
  }

  const { version, sessions: allSessions } =
    await loadSessionsFromZip(DATASET_ZIP_PATH);
  const sessions = stratifiedSample(allSessions, SAMPLE_SIZE);

  await prepareMtmDatasetFromFiles({ version, sessions });

  // Build and upload a zip of the sample so the download button works locally
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
    for (const { sessionId, sessionFile } of sessions) {
      archive.append(JSON.stringify(sessionFile, null, 2), {
        name: `mtm-v${version}/${sessionId}.json`,
      });
    }
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
