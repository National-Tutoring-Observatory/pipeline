import find from 'lodash/find.js';
import getDocumentsAdapter from "../../app/modules/documents/helpers/getDocumentsAdapter";
import type { Project } from '../../app/modules/projects/projects.types';
import emitFromJob from "../helpers/emitFromJob";

export default async function finishConvertedFilesToSessions(job: any) {

  const { projectId } = job.data;

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  const documents = getDocumentsAdapter();

  await documents.updateDocument<Project>({ collection: 'projects', match: { _id: projectId }, update: { isConvertingFiles: false, hasErrored: hasFailedTasks } });

  await emitFromJob(job, { projectId }, 'FINISHED');

  return { status: 'SUCCESS' };

}
