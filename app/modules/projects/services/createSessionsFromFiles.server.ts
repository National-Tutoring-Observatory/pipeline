import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { File } from "~/modules/files/files.types";
import TaskSequencer from "~/modules/queues/helpers/taskSequencer";
import type { Session } from "~/modules/sessions/sessions.types";
import type { Project } from "../projects.types";

export default async function createSessionsFromFiles({
  projectId,
  shouldCreateSessionModels = true
}: { projectId: string, shouldCreateSessionModels: boolean }, { request }: { request: Request }) {


  const documents = getDocumentsAdapter();

  const projectFiles = await documents.getDocuments({ collection: 'files', match: { project: projectId }, sort: {} }) as { data: Array<File> };

  const project = await documents.getDocument({ collection: 'projects', match: { _id: projectId } }) as { data: Project };

  const inputDirectory = `storage/${projectId}/files`;

  const outputDirectory = `storage/${projectId}/preAnalysis`;

  if (shouldCreateSessionModels) {
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
  }

  const projectSessions = await documents.getDocuments({ collection: 'sessions', match: { project: projectId }, sort: {} }) as { data: Array<Session> };

  const taskSequencer = new TaskSequencer('CONVERT_FILES_TO_SESSIONS');

  taskSequencer.addTask('START', {
    projectId,
  });

  for (const projectSession of projectSessions.data) {
    if (projectSession.hasConverted) {
      continue;
    }
    const file = await documents.getDocument({ collection: 'files', match: { _id: projectSession.file } }) as { data: { name: string } };
    taskSequencer.addTask('PROCESS', {
      projectId,
      sessionId: projectSession._id,
      inputFile: `${inputDirectory}/${projectSession.file}/${file.data.name}`,
      outputFolder: `${outputDirectory}/${projectSession._id}`,
      team: project.data.team
    });
  }

  taskSequencer.addTask('FINISH', {
    projectId,
  });

  taskSequencer.run();


}
