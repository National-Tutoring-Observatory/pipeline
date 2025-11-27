import type { File } from "~/modules/files/files.types";
import type { Project } from "~/modules/projects/projects.types";
import type { Session } from "~/modules/sessions/sessions.types";
import { handler as convertSessionDataToJSON } from '../../../functions/convertSessionDataToJSON/app';
import getDocumentsAdapter from '../../documents/helpers/getDocumentsAdapter';
import { emitter } from "../../events/emitter";

export default async function convertFilesToSessions({ entityId }: { entityId: string }) {

  const documents = getDocumentsAdapter();

  const projectFiles = await documents.getDocuments<File>({ collection: 'files', match: { project: entityId }, sort: {} });

  const project = await documents.getDocument<Project>({ collection: 'projects', match: { _id: entityId } });
  if (!project.data) throw new Error('Project not found');

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

  const projectSessions = await documents.getDocuments<Session>({ collection: 'sessions', match: { project: entityId }, sort: {} });

  let completedFiles = 0;

  for (const projectFile of projectSessions.data) {
    let hasErrored;
    let hasConverted;
    const file = await documents.getDocument<File>({ collection: 'files', match: { _id: projectFile.file } });
    if (!file.data) throw new Error('File not found');
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
