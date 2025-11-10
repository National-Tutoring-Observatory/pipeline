import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { File } from "~/modules/files/files.types";
import createTaskJob from "~/modules/queues/helpers/createTaskJob";
import type { Session } from "~/modules/sessions/sessions.types";
import type { Project } from "../projects.types";

export default async function createSessionsFromFiles({ projectId }: { projectId: string }, { request }: { request: Request }) {

  const documents = getDocumentsAdapter();

  const projectFiles = await documents.getDocuments({ collection: 'files', match: { project: projectId }, sort: {} }) as { data: Array<File> };

  const project = await documents.getDocument({ collection: 'projects', match: { _id: projectId } }) as { data: Project };

  const inputDirectory = `storage/${projectId}/files`;

  const outputDirectory = `storage/${projectId}/preAnalysis`;

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

  const projectSessions = await documents.getDocuments({ collection: 'sessions', match: { project: projectId }, sort: {} }) as { data: Array<Session> };
  const childrenJobs = [];

  childrenJobs.push({
    name: 'START_CONVERT_FILES_TO_SESSIONS',
    data: {
      projectId,
    },
  })

  for (const projectSession of projectSessions.data) {
    const file = await documents.getDocument({ collection: 'files', match: { _id: projectSession.file } }) as { data: { name: string } };
    childrenJobs.push({
      name: 'CONVERT_FILE_TO_SESSION',
      data: {
        projectId,
        sessionId: projectSession._id,
        inputFile: `${inputDirectory}/${projectSession.file}/${file.data.name}`,
        outputFolder: `${outputDirectory}/${projectSession._id}`,
        team: project.data.team
      }
    })
  }

  childrenJobs.push({
    name: 'FINISH_CONVERT_FILES_TO_SESSIONS',
    data: {
      projectId,
    }
  });

  createTaskJob({
    name: 'CONVERT_FILES_TO_SESSIONS',
    data: {
      projectId,
    },
    children: childrenJobs
  });

}
