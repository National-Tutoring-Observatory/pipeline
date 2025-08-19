import { handler as convertSessionDataToJSON } from '../../functions/convertSessionDataToJSON/app';
import getDocuments from "../documents/getDocuments";
import updateDocument from "../documents/updateDocument";
import type { Project } from "~/modules/projects/projects.types";
import { emitter } from "../events/emitter";
import createDocument from "../documents/createDocument";
import type { Session } from "~/modules/sessions/sessions.types";
import type { File } from "~/modules/files/files.types";
import getDocument from '../documents/getDocument';

export default async function convertFilesToSessions({ entityId }: { entityId: string }) {

  const projectFiles = await getDocuments({ collection: 'files', match: { project: parseInt(entityId) }, sort: {} }) as { data: Array<File> };

  const inputDirectory = `storage/${entityId}/files`;

  const outputDirectory = `storage/${entityId}/preAnalysis`;

  for (const projectFile of projectFiles.data) {
    await createDocument({
      collection: 'sessions',
      update: {
        project: projectFile.project,
        file: projectFile._id,
        fileType: 'application/json',
        name: `${projectFile.name.replace(/\.[^.]+$/, '')}.json`,
        hasConverted: false
      }
    }) as { data: Session };
  }

  emitter.emit("CONVERT_FILES", { projectId: parseInt(entityId), progress: 0, status: 'STARTED' });

  const projectSessions = await getDocuments({ collection: 'sessions', match: { project: parseInt(entityId) }, sort: {} }) as { data: Array<Session> };

  let completedFiles = 0;

  for (const projectFile of projectSessions.data) {
    let hasErrored;
    let hasConverted;
    const file = await getDocument({ collection: 'files', match: { _id: projectFile.file } }) as { data: { name: string } };
    try {
      await convertSessionDataToJSON({
        body: {
          inputFile: `${inputDirectory}/${projectFile.file}/${file.data.name}`,
          outputFolder: `${outputDirectory}/${projectFile._id}`
        }
      });
      hasErrored = false;
      hasConverted = true;
    } catch (error) {
      hasErrored = true;
      hasConverted = false;
    }
    await updateDocument({
      collection: 'sessions',
      match: {
        _id: parseInt(projectFile._id)
      },
      update: {
        hasConverted,
        hasErrored
      }
    });
    completedFiles++;
    emitter.emit("CONVERT_FILES", { projectId: parseInt(entityId), progress: Math.round((100 / projectSessions.data.length) * completedFiles), status: 'RUNNING' });
  }

  await updateDocument({ collection: 'projects', match: { _id: parseInt(entityId) }, update: { isConvertingFiles: false } }) as { data: Project };
  emitter.emit("CONVERT_FILES", { projectId: parseInt(entityId), progress: 100, status: 'DONE' });

}