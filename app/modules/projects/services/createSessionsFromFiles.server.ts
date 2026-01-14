import type { File } from "~/modules/files/files.types";
import { FileService } from "~/modules/files/file";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import TaskSequencer from "~/modules/queues/helpers/taskSequencer";
import type { Session } from "~/modules/sessions/sessions.types";
import { getProjectFileStoragePath } from "~/modules/uploads/helpers/projectFileStorage";
import { getProjectSessionStorageDir } from "~/modules/uploads/helpers/projectSessionStorage";
import { ProjectService } from "../project";
import type { Project } from "../projects.types";

export default async function createSessionsFromFiles({
  projectId,
  shouldCreateSessionModels = true,
  attributesMapping,
}: { projectId: string, shouldCreateSessionModels: boolean, attributesMapping?: any }) {
  const documents = getDocumentsAdapter();
  const projectFiles = await FileService.findByProject(projectId);

  const project = await ProjectService.findById(projectId);
  if (!project) throw new Error('Project not found');

  if (shouldCreateSessionModels) {
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
  }

  const projectSessions = await documents.getDocuments<Session>({ collection: 'sessions', match: { project: projectId }, sort: {} });

  const taskSequencer = new TaskSequencer('CONVERT_FILES_TO_SESSIONS');

  taskSequencer.addTask('START', {
    projectId,
  });

  for (const projectSession of projectSessions.data) {
    if (projectSession.hasConverted) {
      continue;
    }
    const file = await FileService.findById(projectSession.file as string);
    if (!file) throw new Error('File not found');
    taskSequencer.addTask('PROCESS', {
      projectId,
      sessionId: projectSession._id,
      inputFile: getProjectFileStoragePath(projectId, String(projectSession.file), file.name),
      outputFolder: getProjectSessionStorageDir(projectId, projectSession._id),
      team: project.team,
      attributesMapping
    });
  }

  taskSequencer.addTask('FINISH', {
    projectId,
  });

  await taskSequencer.run();
}

