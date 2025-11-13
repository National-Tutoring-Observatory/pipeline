import getDocumentsAdapter from "../../app/modules/documents/helpers/getDocumentsAdapter";
import emitFromJob from "../helpers/emitFromJob";

export default async function startConvertFilesToSessions(job: any) {

  const { projectId } = job.data;

  const documents = getDocumentsAdapter();

  await documents.updateDocument({ collection: 'projects', match: { _id: projectId }, update: { isConvertingFiles: true } });

  await emitFromJob(job, { projectId }, 'FINISHED');

  return { status: 'SUCCESS' };

}
