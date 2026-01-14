import type { File } from "~/modules/files/files.types";
import type { Project } from "~/modules/projects/projects.types";
import type { Session } from "~/modules/sessions/sessions.types";
import { handler as convertSessionDataToJSON } from '../../../functions/convertSessionDataToJSON/app';
import { FileService } from "~/modules/files/file";
import { ProjectService } from "~/modules/projects/project";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { emitter } from "../../events/emitter";

export default async function convertFilesToSessions({ entityId }: { entityId: string }) {
  const documents = getDocumentsAdapter();
  const projectFiles = await FileService.findByProject(entityId);

  const project = await ProjectService.findById(entityId);
  if (!project) throw new Error('Project not found');

  const inputDirectory = `storage/${entityId}/files`;

  const outputDirectory = `storage/${entityId}/preAnalysis`;

  for (const projectFile of projectFiles) {
    await documents.createDocument<Session>({
      collection: 'sessions',
      update: {
        project: projectFile.project,
        file: projectFile._id,
        fileType: 'application/json',
        name: `${projectFile.name.replace(/\.[^.]+$/, '')}.json`,
        hasConverted: false
      }
    });
  }

  emitter.emit("CONVERT_FILES", { projectId: entityId, progress: 0, status: 'STARTED' });

  const projectSessions = await documents.getDocuments<Session>({ collection: 'sessions', match: { project: entityId }, sort: {} });

  let completedFiles = 0;

  for (const projectFile of projectSessions.data) {
    let hasErrored;
    let hasConverted;
    const file = await FileService.findById(projectFile.file as string);
    if (!file) throw new Error('File not found');
    try {
      await convertSessionDataToJSON({
        body: {
          inputFile: `${inputDirectory}/${projectFile.file}/${file.name}`,
          outputFolder: `${outputDirectory}/${projectFile._id}`,
          team: project.team
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

  await ProjectService.updateById(entityId, { isConvertingFiles: false });
  emitter.emit("CONVERT_FILES", { projectId: entityId, progress: 100, status: 'DONE' });
}

