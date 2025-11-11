import type { Job } from "bullmq";
import find from 'lodash/find.js';
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export default async function handleAnnotateRun(job: Job) {
  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = find(jobResults, { status: "ERRORED" });
  if (hasFailedTasks) {
    const { runId } = job.data;

    const documents = getDocumentsAdapter();

    await documents.updateDocument({
      collection: 'runs',
      match: { _id: runId },
      update: {
        hasErrored: true,
        finishedAt: new Date()
      }
    });
  }
  return { status: 'SUCCESS' };
}
