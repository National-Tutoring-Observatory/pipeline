import path from "path";
import uploadFile from "./uploadFile";
import removeFile from "./removeFile";
import { handler as convertSessionDataToJSON } from '../../functions/convertSessionDataToJSON/app';
import fs from 'fs';
import getDocuments from "../documents/getDocuments";
import updateDocument from "../documents/updateDocument";
import type { Project } from "~/modules/projects/projects.types";
import { emitter } from "../events/emitter";

export default async function convertFilesToSessions({ entityId }: { entityId: string }) {

  const projectFiles = await getDocuments({ collection: 'files', match: { project: parseInt(entityId) } }) as { data: Array<Project> };

  const inputDirectory = `./storage/${entityId}/files`;

  const outputDirectory = `./storage/${entityId}/preAnalysis`;

  let completedFiles = 0;

  for (const projectFile of projectFiles.data) {
    await convertSessionDataToJSON({
      body: {
        inputFile: `${inputDirectory}/${projectFile._id}/${projectFile.name}`,
        outputFolder: `${outputDirectory}/${projectFile._id}`
      }
    });
    await updateDocument({
      collection: 'files',
      match: {
        _id: parseInt(projectFile._id)
      },
      update: {
        hasConverted: true
      }
    });
    completedFiles++;
    emitter.emit("CONVERT_FILES", { projectId: parseInt(entityId), progress: Math.round((100 / projectFiles.data.length) * completedFiles), status: 'RUNNING' });
  }

  await updateDocument({ collection: 'projects', match: { _id: parseInt(entityId) }, update: { isConvertingFiles: false } }) as { data: Project };
  emitter.emit("CONVERT_FILES", { projectId: parseInt(entityId), progress: 100, status: 'DONE' });

}