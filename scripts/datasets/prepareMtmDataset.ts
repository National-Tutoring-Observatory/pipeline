import archiver from "archiver";
import { execSync } from "child_process";
import fse from "fs-extra";
import { encode } from "gpt-tokenizer";
import path from "path";
import { PROJECT_ROOT } from "../../app/helpers/projectRoot";
import type {
  MtmManifest,
  MtmManifestSession,
} from "../../app/modules/datasets/datasets.types";
import {
  getDatasetDir,
  getDatasetLatestPath,
  getDatasetManifestPath,
  getDatasetSessionPath,
} from "../../app/modules/datasets/helpers/getDatasetStoragePath";
import getConversationFromJSON from "../../app/modules/sessions/helpers/getConversationFromJSON";
import type { SessionFile } from "../../app/modules/sessions/sessions.types";

const STAGING = "staging.nto";

function parseArgs() {
  const args = process.argv.slice(2);

  function getFlag(flag: string): string | undefined {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  }

  const versionStr = getFlag("--version");
  const inputPath = getFlag("--input");
  const sampleSizeStr = getFlag("--sample-size") ?? "500";
  const fixturesSizeStr = getFlag("--fixtures-size") ?? "50";

  if (!inputPath) {
    console.error(
      "Usage: yarn dataset:prepare-mtm --input <folder> [--version <N>] [--sample-size <N>] [--fixtures-size <N>]",
    );
    process.exit(1);
  }

  const version = versionStr ? parseInt(versionStr, 10) : undefined;
  if (version !== undefined && (isNaN(version) || version < 1)) {
    console.error("Version must be a positive integer");
    process.exit(1);
  }

  const sampleSize = parseInt(sampleSizeStr, 10);
  if (isNaN(sampleSize) || sampleSize < 1) {
    console.error("Sample size must be a positive integer");
    process.exit(1);
  }

  const fixturesSize = parseInt(fixturesSizeStr, 10);
  if (isNaN(fixturesSize) || fixturesSize < 1) {
    console.error("Fixtures size must be a positive integer");
    process.exit(1);
  }

  return { version, inputPath, sampleSize, fixturesSize };
}

async function resolveVersion(
  explicitVersion: number | undefined,
): Promise<number> {
  if (explicitVersion !== undefined) return explicitVersion;

  const tmpPath = path.join(PROJECT_ROOT, "tmp/datasets/mtm/latest-check.json");
  const s3Path = `s3://${STAGING}/${getDatasetLatestPath()}`;
  try {
    await fse.ensureDir(path.dirname(tmpPath));
    execSync(`aws s3 cp ${s3Path} ${tmpPath} --quiet`, { stdio: "pipe" });
    const latest = await fse.readJSON(tmpPath);
    const next = latest.version + 1;
    console.log(
      `No --version given. Current staging version: v${latest.version} → using v${next}\n`,
    );
    return next;
  } catch (err) {
    console.error(`Failed to fetch ${s3Path}:`, err);
    console.error(
      "Could not determine current version from staging. Pass --version explicitly.",
    );
    process.exit(1);
  }
}

async function checkGithubRelease() {
  try {
    const latestTag = execSync("gh release view --json tagName --jq .tagName", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    const currentTag = execSync(
      "git describe --tags --exact-match HEAD 2>/dev/null || echo ''",
      { encoding: "utf-8", shell: "/bin/sh" },
    ).trim();

    if (!currentTag || currentTag !== latestTag) {
      const shortHead = execSync("git rev-parse --short HEAD", {
        encoding: "utf-8",
      }).trim();
      console.warn(
        `⚠  HEAD (${shortHead}) is not the latest release (${latestTag}).`,
      );
      console.warn(`   Consider: git checkout ${latestTag}\n`);
    } else {
      console.log(`✓ On latest release: ${latestTag}\n`);
    }
  } catch {
    // gh CLI not available or no releases yet — skip
  }
}

function convertToSessionFile(raw: Record<string, unknown>): SessionFile {
  const sessionId = raw.id as string;
  const transcriptStr = raw.transcript as string;
  const lines = transcriptStr.split("\n").filter((l) => l.trim());

  const transcript = lines.map((line, index) => {
    const colonIdx = line.indexOf(":");
    const role = colonIdx !== -1 ? line.slice(0, colonIdx).trim() : "unknown";
    const content = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : line;
    return {
      _id: String(index),
      role,
      content,
      start_time: "",
      end_time: "",
      timestamp: "",
      session_id: sessionId,
      sequence_id: String(index),
      annotations: [],
    };
  });

  const roles = [...new Set(transcript.map((u) => u.role))];
  const nonStudentRoles = roles.filter((r) => r.toLowerCase() !== "student");
  const leadRole = nonStudentRoles[0] ?? roles[0] ?? "unknown";

  return { transcript, leadRole, annotations: [] };
}

async function loadSessionFolder(
  folderPath: string,
): Promise<Array<{ sessionId: string; sessionFile: SessionFile }>> {
  const files = await fse.readdir(folderPath);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.error(`No JSON files found in ${folderPath}`);
    process.exit(1);
  }

  const sessions = await Promise.all(
    jsonFiles.map(async (filename) => {
      const raw = await fse.readJSON(path.join(folderPath, filename));
      const sessionId = raw.id as string;
      return { sessionId, sessionFile: convertToSessionFile(raw) };
    }),
  );

  return sessions;
}

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

async function buildZip(folderPath: string, version: number): Promise<string> {
  const zipPath = path.join(
    PROJECT_ROOT,
    getDatasetDir(version),
    "mtm-full-dataset.zip",
  );
  await fse.ensureDir(path.dirname(zipPath));

  return new Promise((resolve, reject) => {
    const output = fse.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(zipPath));
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(folderPath, `mtm-v${version}`);
    archive.finalize();
  });
}

async function main() {
  await checkGithubRelease();

  const {
    version: rawVersion,
    inputPath,
    sampleSize,
    fixturesSize,
  } = parseArgs();
  const version = await resolveVersion(rawVersion);

  if (
    !fse.existsSync(inputPath) ||
    !(await fse.stat(inputPath)).isDirectory()
  ) {
    console.error(`Input path is not a directory: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Preparing MTM dataset v${version}`);
  console.log(`  Input    : ${inputPath}`);
  console.log(
    `  Sample   : ${sampleSize} sessions (stratified by utterance count)`,
  );
  console.log(`  Fixtures : ${fixturesSize} sessions\n`);

  // 1. Load all sessions from folder
  console.log("Loading sessions...");
  const allSessions = await loadSessionFolder(inputPath);
  console.log(`✓ ${allSessions.length} sessions loaded\n`);

  // 2. Write fixtures for local dev
  console.log(`Writing fixtures (${fixturesSize} sessions)...`);
  const fixturesDir = path.join(PROJECT_ROOT, "datasets/mtm/fixtures");
  await fse.emptyDir(fixturesDir);
  const fixtureSessions = stratifiedSample(allSessions, fixturesSize);
  for (const { sessionId, sessionFile } of fixtureSessions) {
    await fse.writeJSON(
      path.join(fixturesDir, `${sessionId}.json`),
      sessionFile,
      { spaces: 2 },
    );
  }
  await fse.writeJSON(
    path.join(fixturesDir, "version.json"),
    { version },
    { spaces: 2 },
  );
  console.log(`✓ Fixtures written → datasets/mtm/fixtures/\n`);

  // 3. Write sample to disk for aws s3 sync
  const sampledSessions = stratifiedSample(allSessions, sampleSize);
  console.log(
    `Writing sample (${sampledSessions.length} sessions, stratified by utterance count)...`,
  );
  const manifestSessions: MtmManifestSession[] = [];
  let totalUtterances = 0;
  for (const { sessionId, sessionFile } of sampledSessions) {
    const inputTokens = encode(getConversationFromJSON(sessionFile)).length;
    const filename = `${sessionId}.json`;
    const filePath = path.join(
      PROJECT_ROOT,
      getDatasetSessionPath(version, filename),
    );
    await fse.outputJSON(filePath, sessionFile);
    manifestSessions.push({
      sessionId,
      filename,
      inputTokens,
      utteranceCount: sessionFile.transcript.length,
      leadRole: sessionFile.leadRole,
    });
    totalUtterances += sessionFile.transcript.length;
  }
  const manifest: MtmManifest = {
    version,
    createdAt: new Date().toISOString(),
    sessionCount: manifestSessions.length,
    sessions: manifestSessions,
  };
  await fse.outputJSON(
    path.join(PROJECT_ROOT, getDatasetManifestPath(version)),
    manifest,
    { spaces: 2 },
  );
  console.log(
    `✓ ${manifest.sessionCount} sessions, ${totalUtterances} utterances written to disk\n`,
  );

  // 4. Build zip from full folder
  console.log("Building zip from full dataset...");
  const zipPath = await buildZip(inputPath, version);
  console.log(`✓ Zip ready: ${zipPath}\n`);

  console.log(`✓ Done. Validate locally with:\n`);
  console.log(`    yarn seeds --dataset\n`);
  console.log(`  Then release with:\n`);
  console.log(`    yarn dataset:release-mtm --version ${version}\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
