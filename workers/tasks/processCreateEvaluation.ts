import type { Job } from "bullmq";
import { EvaluationService } from "../../app/modules/evaluations/evaluation";
import buildEvaluationReport, {
  getCommonSessionIds,
  loadAllSessionFiles,
} from "../../app/modules/evaluations/helpers/buildEvaluationReport";
import buildVerificationReport from "../../app/modules/evaluations/helpers/buildVerificationReport";
import { RunService } from "../../app/modules/runs/run";
import emitFromJob from "../helpers/emitFromJob";

export default async function processCreateEvaluation(job: Job) {
  const { evaluationId } = job.data;

  if (!evaluationId) {
    throw new Error("processCreateEvaluation: evaluationId is required");
  }

  await emitFromJob(job, { evaluationId, progress: 0, step: "0/5" }, "STARTED");

  const evaluation = await EvaluationService.findById(evaluationId);
  if (!evaluation) {
    throw new Error(
      `processCreateEvaluation: Evaluation not found: ${evaluationId}`,
    );
  }

  const runs = await RunService.find({
    match: { _id: { $in: evaluation.runs } },
  });

  await emitFromJob(
    job,
    { evaluationId, progress: 10, step: "1/5" },
    "UPDATED",
  );

  const cache = await loadAllSessionFiles(evaluation, runs);
  const commonSessionIds = getCommonSessionIds(runs);

  await emitFromJob(
    job,
    { evaluationId, progress: 50, step: "2/5" },
    "UPDATED",
  );

  const report = await buildEvaluationReport(
    evaluation,
    runs,
    cache,
    commonSessionIds,
  );

  await emitFromJob(
    job,
    { evaluationId, progress: 75, step: "3/5" },
    "UPDATED",
  );

  const verificationReport = buildVerificationReport(
    evaluation,
    runs,
    cache,
    commonSessionIds,
  );

  await emitFromJob(
    job,
    { evaluationId, progress: 90, step: "4/5" },
    "UPDATED",
  );

  await EvaluationService.updateById(evaluationId, {
    report,
    verificationReport,
  });

  await emitFromJob(
    job,
    { evaluationId, progress: 100, step: "5/5" },
    "FINISHED",
  );

  return {
    status: "SUCCESS",
  };
}
