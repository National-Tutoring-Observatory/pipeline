import type { Job } from "bullmq";
import { ProjectService } from "~/modules/projects/project";
import emitFromJob from "../helpers/emitFromJob";

export default async function deleteProjectProcess(job: Job) {
  const { projectId } = job.data || {};
  if (!projectId) {
    throw new Error('missing projectId');
  }

  await ProjectService.deleteById(projectId);

  await emitFromJob(job as any, { projectId }, 'FINISHED');

  return { status: 'DELETED', projectId };
}
