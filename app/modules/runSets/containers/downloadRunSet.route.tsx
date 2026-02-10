import archiver from "archiver";
import map from "lodash/map";
import { PassThrough, Readable } from "node:stream";
import { redirect } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import requireRunSetsFeature from "~/modules/runSets/helpers/requireRunSetsFeature";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { RunSetService } from "../runSet";
import type { Route } from "./+types/downloadRunSet.route";

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

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const outputDirectory = `storage/${runSet.project}/collections/${runSet._id}/exports`;

  // Get runs to determine annotation type
  const runs = await RunService.find({
    match: { _id: { $in: runSet.runs || [] } },
  });
  const annotationType = runs[0]?.annotationType;

  const filesToArchive = [];

  if (exportType === "CSV") {
    // Add meta CSV (always included)
    filesToArchive.push({
      path: `${outputDirectory}/${runSet.project}-${runSet._id}-meta.csv`,
      name: `${runSet.project}-${runSet._id}-meta.csv`,
    });

    // Add utterances or sessions CSV based on annotation type
    if (annotationType === "PER_UTTERANCE") {
      filesToArchive.push({
        path: `${outputDirectory}/${runSet.project}-${runSet._id}-utterances.csv`,
        name: `${runSet.project}-${runSet._id}-utterances.csv`,
      });
    } else if (annotationType === "PER_SESSION") {
      filesToArchive.push({
        path: `${outputDirectory}/${runSet.project}-${runSet._id}-sessions.csv`,
        name: `${runSet.project}-${runSet._id}-sessions.csv`,
      });
    }
  } else {
    // JSONL export
    filesToArchive.push({
      path: `${outputDirectory}/${runSet.project}-${runSet._id}-meta.jsonl`,
      name: `${runSet.project}-${runSet._id}-meta.jsonl`,
    });

    filesToArchive.push({
      path: `${outputDirectory}/${runSet.project}-${runSet._id}-sessions.jsonl`,
      name: `${runSet.project}-${runSet._id}-sessions.jsonl`,
    });
  }

  const passthroughStream = new PassThrough();

  archive.pipe(passthroughStream);

  archive.on("error", (err) => {
    console.error("Archiver encountered an error:", err);
  });

  const storage = getStorageAdapter();

  const localPaths = await Promise.all(
    filesToArchive.map(async (file) => {
      const localPath = await storage.download({ sourcePath: file.path });
      return { file, localPath };
    }),
  );

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
