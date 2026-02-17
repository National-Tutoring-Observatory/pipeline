import type { Job } from "bullmq";
import { EvaluationService } from "../../app/modules/evaluations/evaluation";
import emitFromJob from "../helpers/emitFromJob";

export default async function startCreateEvaluation(job: Job) {
  const { evaluationId } = job.data;

  if (!evaluationId) {
    throw new Error("startCreateEvaluation: evaluationId is required");
  }

  const result = await EvaluationService.updateById(evaluationId, {
    isRunning: true,
    isComplete: false,
    hasErrored: false,
    startedAt: new Date().toISOString(),
  });

  if (!result) {
    throw new Error(
      `startCreateEvaluation: Evaluation not found: ${evaluationId}`,
    );
  }

  await emitFromJob(job, { evaluationId }, "FINISHED");

  return {
    status: "SUCCESS",
  };
}
