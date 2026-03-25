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

  await emitFromJob(job, { evaluationId, progress: 0, step: "0/1" }, "STARTED");

  const evaluation = await EvaluationService.findById(evaluationId);
  if (!evaluation) {
    throw new Error(
      `processCreateEvaluation: Evaluation not found: ${evaluationId}`,
    );
  }

  const runs = await RunService.find({
    match: { _id: { $in: evaluation.runs } },
  });

  const cache = await loadAllSessionFiles(evaluation, runs);
  const commonSessionIds = getCommonSessionIds(runs);

  const report = await buildEvaluationReport(
    evaluation,
    runs,
    cache,
    commonSessionIds,
  );
  const verificationReport = buildVerificationReport(
    evaluation,
    runs,
    cache,
    commonSessionIds,
  );

  await EvaluationService.updateById(evaluationId, {
    report,
    verificationReport,
  });

  await emitFromJob(
    job,
    { evaluationId, progress: 100, step: "1/1" },
    "FINISHED",
  );

  return {
    status: "SUCCESS",
  };
}
