import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { File } from "~/modules/files/files.types";
import TaskSequencer from "~/modules/queues/helpers/taskSequencer";
import type { Session } from "~/modules/sessions/sessions.types";
import { getProjectFileStoragePath } from "~/modules/uploads/helpers/projectFileStorage";
import { getProjectSessionStorageDir } from "~/modules/uploads/helpers/projectSessionStorage";
import type { Project } from "../projects.types";

export default async function createSessionsFromFiles({
  projectId,
  shouldCreateSessionModels = true,
  attributesMapping,
}: { projectId: string, shouldCreateSessionModels: boolean, attributesMapping?: any }) {
  const documents = getDocumentsAdapter();

  const projectFiles = await documents.getDocuments<File>({ collection: 'files', match: { project: projectId }, sort: {} });

  const project = await documents.getDocument<Project>({ collection: 'projects', match: { _id: projectId } });
  if (!project.data) throw new Error('Project not found');

  if (shouldCreateSessionModels) {
    for (const projectFile of projectFiles.data) {
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
    const file = await documents.getDocument<File>({ collection: 'files', match: { _id: projectSession.file } });
    if (!file.data) throw new Error('File not found');
    taskSequencer.addTask('PROCESS', {
      projectId,
      sessionId: projectSession._id,
      inputFile: getProjectFileStoragePath(projectId, String(projectSession.file), file.data.name),
      outputFolder: getProjectSessionStorageDir(projectId, projectSession._id),
      team: project.data.team,
      attributesMapping
    });
  }

  taskSequencer.addTask('FINISH', {
    projectId,
  });

  taskSequencer.run();


}
