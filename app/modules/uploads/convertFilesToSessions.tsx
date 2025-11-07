import type { File } from "~/modules/files/files.types";
import type { Project } from "~/modules/projects/projects.types";
import type { Session } from "~/modules/sessions/sessions.types";
import { handler as convertSessionDataToJSON } from '../../functions/convertSessionDataToJSON/app';
import getDocumentsAdapter from '../../modules/documents/helpers/getDocumentsAdapter';
import { emitter } from "../../modules/events/emitter";

export default async function convertFilesToSessions({ entityId }: { entityId: string }) {

  const documents = getDocumentsAdapter();

  const projectFiles = await documents.getDocuments({ collection: 'files', match: { project: entityId }, sort: {} }) as { data: Array<File> };

  const project = await documents.getDocument({ collection: 'projects', match: { _id: entityId } }) as { data: Project };

  const inputDirectory = `storage/${entityId}/files`;

  const outputDirectory = `storage/${entityId}/preAnalysis`;

  for (const projectFile of projectFiles.data) {
    await documents.createDocument({
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

  emitter.emit("CONVERT_FILES", { projectId: entityId, progress: 0, status: 'STARTED' });

  const projectSessions = await documents.getDocuments({ collection: 'sessions', match: { project: entityId }, sort: {} }) as { data: Array<Session> };

  let completedFiles = 0;

  for (const projectFile of projectSessions.data) {
    let hasErrored;
    let hasConverted;
    const file = await documents.getDocument({ collection: 'files', match: { _id: projectFile.file } }) as { data: { name: string } };
    try {
      await convertSessionDataToJSON({
        body: {
          inputFile: `${inputDirectory}/${projectFile.file}/${file.data.name}`,
          outputFolder: `${outputDirectory}/${projectFile._id}`,
          team: project.data.team
        }
      });
      hasErrored = false;
      hasConverted = true;
    } catch (error) {
      hasErrored = true;
      hasConverted = false;
    }
    await documents.updateDocument({
      collection: 'sessions',
      match: {
        _id: projectFile._id
      },
      update: {
        hasConverted,
        hasErrored
      }
    });
    completedFiles++;
    emitter.emit("CONVERT_FILES", { projectId: entityId, progress: Math.round((100 / projectSessions.data.length) * completedFiles), status: 'RUNNING' });
  }

  await documents.updateDocument({ collection: 'projects', match: { _id: entityId }, update: { isConvertingFiles: false } }) as { data: Project };
  emitter.emit("CONVERT_FILES", { projectId: entityId, progress: 100, status: 'DONE' });

}
