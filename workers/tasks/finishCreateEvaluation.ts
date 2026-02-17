import type { Job } from "bullmq";
import find from "lodash/find.js";
import { EvaluationService } from "../../app/modules/evaluations/evaluation";
import emitFromJob from "../helpers/emitFromJob";

export default async function finishCreateEvaluation(job: Job) {
  const { evaluationId } = job.data;

  if (!evaluationId) {
    throw new Error("finishCreateEvaluation: evaluationId is required");
  }

  const evaluation = await EvaluationService.findById(evaluationId);
  if (!evaluation) {
    throw new Error(
      `finishCreateEvaluation: Evaluation not found: ${evaluationId}`,
    );
  }

  const jobResults = await job.getChildrenValues();
  const hasFailedTasks = !!find(jobResults, { status: "ERRORED" });

  await EvaluationService.updateById(evaluationId, {
    isRunning: false,
    isComplete: true,
    hasErrored: hasFailedTasks,
    finishedAt: new Date().toISOString(),
  });

  await emitFromJob(job, { evaluationId }, "FINISHED");

  return { status: "SUCCESS" };
}
