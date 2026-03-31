import { EvaluationService } from "../evaluation";
import createEvaluationReport from "./createEvaluationReport.server";

export default async function rerunEvaluation(
  evaluationId: string,
  runId: string,
) {
  const evaluation = await EvaluationService.findById(evaluationId);
  if (!evaluation) return;
  if (evaluation.isRunning) return;

  const updatedRuns = evaluation.runs.includes(runId)
    ? evaluation.runs
    : [...evaluation.runs, runId];

  const updated = await EvaluationService.updateById(evaluationId, {
    runs: updatedRuns,
    report: [],
    verificationReport: [],
    isRunning: true,
    isComplete: false,
    hasErrored: false,
    startedAt: undefined,
    finishedAt: undefined,
  });

  if (!updated) return;

  createEvaluationReport(updated);
}
