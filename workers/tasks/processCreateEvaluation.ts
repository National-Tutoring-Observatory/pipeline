import type { Job } from "bullmq";
import emitFromJob from "../helpers/emitFromJob";

export default async function processCreateEvaluation(job: Job) {
  const { evaluationId } = job.data;

  if (!evaluationId) {
    throw new Error("processCreateEvaluation: evaluationId is required");
  }

  await emitFromJob(job, { evaluationId, progress: 0, step: "0/1" }, "STARTED");

  await new Promise((resolve) => setTimeout(resolve, 15000));

  await emitFromJob(
    job,
    { evaluationId, progress: 100, step: "1/1" },
    "FINISHED",
  );

  return {
    status: "SUCCESS",
  };
}
