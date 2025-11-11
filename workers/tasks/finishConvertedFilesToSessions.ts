import find from 'lodash/find.js';
import emitFromJob from "workers/helpers/emitFromJob";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export default async function finishConvertedFilesToSessions(job: any) {

  const { projectId } = job.data;

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  const documents = getDocumentsAdapter();

  await documents.updateDocument({ collection: 'projects', match: { _id: projectId }, update: { isConvertingFiles: false, hasErrored: hasFailedTasks } });

  await emitFromJob(job, { projectId }, 'FINISHED');

  return { status: 'SUCCESS' };

}
