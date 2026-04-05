import find from "lodash/find.js";
import createHumanAnnotationsFromProjectUpload from "../../app/modules/humanAnnotations/services/createHumanAnnotationsFromProjectUpload.server";
import { ProjectService } from "../../app/modules/projects/project";
import emitFromJob from "../helpers/emitFromJob";

export default async function finishConvertedFilesToSessions(job: any) {
  const { projectId, annotatorMeta } = job.data;

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  await ProjectService.updateById(projectId, {
    isConvertingFiles: false,
    hasErrored: hasFailedTasks,
  });

  await emitFromJob(job, { projectId }, "FINISHED");

  if (annotatorMeta) {
    try {
      await createHumanAnnotationsFromProjectUpload({
        projectId,
        annotatorMeta,
      });
    } catch (error) {
      console.error(
        "[finishConvertedFilesToSessions] Failed to create human annotations from upload:",
        error,
      );
    }
  }

  return { status: "SUCCESS" };
}
