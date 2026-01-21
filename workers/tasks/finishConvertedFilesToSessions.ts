import find from "lodash/find.js";
import { ProjectService } from "../../app/modules/projects/project";
import emitFromJob from "../helpers/emitFromJob";

export default async function finishConvertedFilesToSessions(job: any) {
  const { projectId } = job.data;

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  await ProjectService.updateById(projectId, {
    isConvertingFiles: false,
    hasErrored: hasFailedTasks,
  });

  await emitFromJob(job, { projectId }, "FINISHED");

  return { status: "SUCCESS" };
}
