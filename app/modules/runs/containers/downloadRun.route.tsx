import archiver from "archiver";
import map from 'lodash/map';
import { PassThrough, Readable } from "node:stream";
import { redirect } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "../run";
import type { Route } from "./+types/downloadRun.route";

export async function loader({ request, params }: Route.LoaderArgs) {

  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');

  const project = await ProjectService.findOne({ _id: params.projectId, team: { $in: teamIds } });

  if (!project) {
    return redirect('/');
  }

  const url = new URL(request.url);

  const searchParams = url.searchParams;

  const exportType = searchParams.get("exportType");

  const run = await RunService.findById(params.runId);
  if (!run || run.project !== params.projectId) {
    throw new Error("Run not found.");
  }

  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  const outputDirectory = `storage/${run.project}/runs/${run._id}/exports`;

  let filesToArchive = [];

  if (exportType === 'CSV') {
    filesToArchive.push({
      path: `${outputDirectory}/${run.project}-${run._id}-meta.csv`,
      name: `${run.project}-${run._id}-meta.csv`,
    });
    if (run.annotationType === 'PER_UTTERANCE') {
      filesToArchive.push({
        path: `${outputDirectory}/${run.project}-${run._id}-utterances.csv`,
        name: `${run.project}-${run._id}-utterances.csv`,
      })
    } else {
      filesToArchive.push({
        path: `${outputDirectory}/${run.project}-${run._id}-sessions.csv`,
        name: `${run.project}-${run._id}-sessions.csv`,
      })
    }
  } else {
    filesToArchive.push({
      path: `${outputDirectory}/${run.project}-${run._id}-meta.jsonl`,
      name: `${run.project}-${run._id}-meta.jsonl`,
    });
    filesToArchive.push({
      path: `${outputDirectory}/${run.project}-${run._id}-sessions.jsonl`,
      name: `${run.project}-${run._id}-sessions.jsonl`,
    });
  }



  const passthroughStream = new PassThrough();

  archive.pipe(passthroughStream);

  archive.on('error', (err) => {
    console.error('Archiver encountered an error:', err);
  });

  const storage = getStorageAdapter();

  for (const file of filesToArchive) {
    try {
      const requestUrl = await storage.request({ url: file.path });
      const response = await fetch(requestUrl as string);

      // Check if the request was successful.
      if (!response.ok) {
        throw new Error(`Fetch Error: ${response.status} ${response.statusText}`);
      }

      if (response.body) {
        // @ts-ignore
        const stream = Readable.fromWeb(response.body);
        archive.append(stream, { name: file.name });
      } else {
        throw new Error(`Response body is null for file ${file.name}`);
      }
      // const fileStream = fs.createReadStream(file.path);
      // archive.append(fileStream, { name: file.name });
    } catch (error) {
      console.error(`Error adding file ${file.name} to archive:`, error);
    }
  }

  archive.finalize();

  const webStream = Readable.toWeb(passthroughStream);

  return new Response(webStream as ReadableStream<Uint8Array>, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="project-${run.project}-run-${run._id}-${run.name}.zip"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
