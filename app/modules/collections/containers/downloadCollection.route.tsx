import archiver from "archiver";
import map from "lodash/map";
import { PassThrough, Readable } from "node:stream";
import { redirect } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import requireCollectionsFeature from "~/modules/collections/helpers/requireCollectionsFeature";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { CollectionService } from "../collection";
import type { Route } from "./+types/downloadCollection.route";

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

  await requireCollectionsFeature(request, params);

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const exportType = searchParams.get("exportType");

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection || collection.project !== params.projectId) {
    throw new Error("Collection not found.");
  }

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const outputDirectory = `storage/${collection.project}/collections/${collection._id}/exports`;

  // Get runs to determine annotation type
  const runs = await RunService.find({
    match: { _id: { $in: collection.runs || [] } },
  });
  const annotationType = runs[0]?.annotationType;

  let filesToArchive = [];

  if (exportType === "CSV") {
    // Add meta CSV (always included)
    filesToArchive.push({
      path: `${outputDirectory}/${collection.project}-${collection._id}-meta.csv`,
      name: `${collection.project}-${collection._id}-meta.csv`,
    });

    // Add utterances or sessions CSV based on annotation type
    if (annotationType === "PER_UTTERANCE") {
      filesToArchive.push({
        path: `${outputDirectory}/${collection.project}-${collection._id}-utterances.csv`,
        name: `${collection.project}-${collection._id}-utterances.csv`,
      });
    } else if (annotationType === "PER_SESSION") {
      filesToArchive.push({
        path: `${outputDirectory}/${collection.project}-${collection._id}-sessions.csv`,
        name: `${collection.project}-${collection._id}-sessions.csv`,
      });
    }
  } else {
    // JSONL export
    filesToArchive.push({
      path: `${outputDirectory}/${collection.project}-${collection._id}-meta.jsonl`,
      name: `${collection.project}-${collection._id}-meta.jsonl`,
    });

    filesToArchive.push({
      path: `${outputDirectory}/${collection.project}-${collection._id}-sessions.jsonl`,
      name: `${collection.project}-${collection._id}-sessions.jsonl`,
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
      "Content-Disposition": `attachment; filename="project-${collection.project}-collection-${collection._id}-${collection.name}.zip"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
