import { ProjectService } from "../../app/modules/projects/project";
import emitFromJob from "../helpers/emitFromJob";

export default async function startConvertFilesToSessions(job: any) {
  const { projectId } = job.data;

  await ProjectService.updateById(projectId, { isConvertingFiles: true });

  await emitFromJob(job, { projectId }, "FINISHED");

  return { status: "SUCCESS" };
}
