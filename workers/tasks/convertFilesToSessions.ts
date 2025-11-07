import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export default async function convertFilesToSessions(job: any) {
  const { projectId } = job.data;

  const documents = getDocumentsAdapter();

  await documents.updateDocument({ collection: 'projects', match: { _id: projectId }, update: { isConvertingFiles: true } });
}
