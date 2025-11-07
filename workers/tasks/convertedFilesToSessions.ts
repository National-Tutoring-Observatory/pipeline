import getSockets from "workers/helpers/getSockets";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export default async function convertedFilesToSessions(job: any) {

  const { projectId } = job.data;

  const documents = getDocumentsAdapter();

  await documents.updateDocument({ collection: 'projects', match: { _id: projectId }, update: { isConvertingFiles: false } });

  const sockets = await getSockets();

  sockets.emit('CONVERT_FILES_TO_SESSIONS', {
    projectId,
    task: 'CONVERTED_FILES_TO_SESSIONS',
    status: 'FINISHED'
  });

}
