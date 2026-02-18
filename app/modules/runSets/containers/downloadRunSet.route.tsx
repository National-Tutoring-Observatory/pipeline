import archiver from "archiver";
import map from "lodash/map";
import { PassThrough, Readable } from "node:stream";
import { redirect } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import requireRunSetsFeature from "~/modules/runSets/helpers/requireRunSetsFeature";
import type { RunSet } from "~/modules/runSets/runSets.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import type { StorageAdapter } from "~/modules/storage/storage.types";
import { RunSetService } from "../runSet";
import type { Route } from "./+types/downloadRunSet.route";

// TODO #1436 cleanup: remove LEGACY_PATH, buildExportFilePaths, downloadFiles,
// and the try/catch fallback in the loader once the migration has run in production.
const CURRENT_PATH = "run-sets";
const LEGACY_PATH = "collections";

function buildExportFilePaths(
  runSet: RunSet,
  pathSegment: string,
  exportType: string | null,
  annotationType: string | undefined,
) {
  const outputDirectory = `storage/${runSet.project}/${pathSegment}/${runSet._id}/exports`;
  const files: { path: string; name: string }[] = [];

  if (exportType === "CSV") {
    files.push({
      path: `${outputDirectory}/${runSet.project}-${runSet._id}-meta.csv`,
      name: `${runSet.project}-${runSet._id}-meta.csv`,
    });

    if (annotationType === "PER_UTTERANCE") {
      files.push({
        path: `${outputDirectory}/${runSet.project}-${runSet._id}-utterances.csv`,
        name: `${runSet.project}-${runSet._id}-utterances.csv`,
      });
    } else if (annotationType === "PER_SESSION") {
      files.push({
        path: `${outputDirectory}/${runSet.project}-${runSet._id}-sessions.csv`,
        name: `${runSet.project}-${runSet._id}-sessions.csv`,
      });
    }
  } else {
    files.push({
      path: `${outputDirectory}/${runSet.project}-${runSet._id}-meta.jsonl`,
      name: `${runSet.project}-${runSet._id}-meta.jsonl`,
    });

    files.push({
      path: `${outputDirectory}/${runSet.project}-${runSet._id}-sessions.jsonl`,
      name: `${runSet.project}-${runSet._id}-sessions.jsonl`,
    });
  }

  return files;
}

async function downloadFiles(
  storage: StorageAdapter,
  files: { path: string; name: string }[],
) {
  return Promise.all(
    files.map(async (file) => {
      const localPath = await storage.download({ sourcePath: file.path });
      return { file, localPath };
    }),
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");

  const project = await ProjectService.findOne({
    _id: params.projectId,
    team: { $in: teamIds },
  });

  if (!project) {
    return redirect("/");
  }

  await requireRunSetsFeature(request, params);

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const exportType = searchParams.get("exportType");

  const runSet = await RunSetService.findById(params.runSetId);
  if (!runSet || runSet.project !== params.projectId) {
    throw new Error("Run set not found.");
  }

  const runs = await RunService.find({
    match: { _id: { $in: runSet.runs || [] } },
  });
  const annotationType = runs[0]?.annotationType;

  const storage = getStorageAdapter();

  // Try current path first, fall back to legacy path for pre-migration exports
  let localPaths;
  try {
    const files = buildExportFilePaths(
      runSet,
      CURRENT_PATH,
      exportType,
      annotationType,
    );
    localPaths = await downloadFiles(storage, files);
  } catch {
    const legacyFiles = buildExportFilePaths(
      runSet,
      LEGACY_PATH,
      exportType,
      annotationType,
    );
    localPaths = await downloadFiles(storage, legacyFiles);
  }

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const passthroughStream = new PassThrough();

  archive.pipe(passthroughStream);

  archive.on("error", (err) => {
    console.error("Archiver encountered an error:", err);
  });

  for (const { file, localPath } of localPaths) {
    archive.file(localPath, { name: file.name });
  }

  archive.finalize();

  const webStream = Readable.toWeb(passthroughStream);

  return new Response(webStream as ReadableStream<Uint8Array>, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="project-${runSet.project}-run-set-${runSet._id}-${runSet.name}.zip"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
