import type { Job } from "bullmq";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Run } from "~/modules/runs/runs.types";

export default async function deleteProjectRuns(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    return { status: 'ERRORED', message: 'missing projectId' };
  }

  const documents = getDocumentsAdapter();

  const result = await documents.getDocuments({ collection: 'runs', match: { project: projectId }, sort: {} }) as { data: Run[] };
  const runs = result.data;

  for (const run of runs) {
    await documents.deleteDocument({ collection: 'runs', match: { _id: run._id } });
  }

  return { status: 'OK', projectId };
}
