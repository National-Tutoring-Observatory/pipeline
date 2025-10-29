import archiver from "archiver";
import map from 'lodash/map';
import { PassThrough, Readable } from "node:stream";
import { redirect } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import type { Run } from "../runs.types";
import type { Route } from "./+types/downloadRun.route";

export async function loader({ request, params }: Route.LoaderArgs) {

  const documents = getDocumentsAdapter();
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');

  // First verify the project exists and user has access
  const project = await documents.getDocument({
    collection: 'projects',
    match: { _id: params.projectId, team: { $in: teamIds } }
  }) as { data: any };

  if (!project.data) {
    return redirect('/');
  }

  const url = new URL(request.url);

  const searchParams = url.searchParams;

  const exportType = searchParams.get("exportType");

  const run = await documents.getDocument({
    collection: 'runs',
    match: { _id: params.runId, project: params.projectId }
  }) as { data: Run };

  if (!run.data) {
    throw new Error("Run not found.");
  }

  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  const outputDirectory = `storage/${run.data.project}/runs/${run.data._id}/exports`;

  let filesToArchive = [];

  if (exportType === 'CSV') {
    filesToArchive.push({
      path: `${outputDirectory}/${run.data.project}-${run.data._id}-meta.csv`,
      name: `${run.data.project}-${run.data._id}-meta.csv`,
    });
    if (run.data.annotationType === 'PER_UTTERANCE') {
      filesToArchive.push({
        path: `${outputDirectory}/${run.data.project}-${run.data._id}-utterances.csv`,
        name: `${run.data.project}-${run.data._id}-utterances.csv`,
      })
    } else {
      filesToArchive.push({
        path: `${outputDirectory}/${run.data.project}-${run.data._id}-sessions.csv`,
        name: `${run.data.project}-${run.data._id}-sessions.csv`,
      })
    }
  } else {
    filesToArchive.push({
      path: `${outputDirectory}/${run.data.project}-${run.data._id}-meta.jsonl`,
      name: `${run.data.project}-${run.data._id}-meta.jsonl`,
    });
    filesToArchive.push({
      path: `${outputDirectory}/${run.data.project}-${run.data._id}-sessions.jsonl`,
      name: `${run.data.project}-${run.data._id}-sessions.jsonl`,
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
      const requestUrl = await storage.request(file.path, {});
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
      'Content-Disposition': `attachment; filename="project-${run.data.project}-run-${run.data._id}-${run.data.name}.zip"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
