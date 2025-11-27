import getDocumentsAdapter from "../../app/modules/documents/helpers/getDocumentsAdapter";
import type { Project } from '../../app/modules/projects/projects.types';
import emitFromJob from "../helpers/emitFromJob";

export default async function startConvertFilesToSessions(job: any) {

  const { projectId } = job.data;

  const documents = getDocumentsAdapter();

  await documents.updateDocument<Project>({ collection: 'projects', match: { _id: projectId }, update: { isConvertingFiles: true } });

  await emitFromJob(job, { projectId }, 'FINISHED');

  return { status: 'SUCCESS' };

}
