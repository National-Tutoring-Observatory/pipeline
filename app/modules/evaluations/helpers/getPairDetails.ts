import type { EvaluationReport } from "../evaluations.types";

export interface PairDetail {
  runAId: string;
  runAName: string;
  runBId: string;
  runBName: string;
  kappa: number;
  sampleSize: number;
}

export default function getPairDetails(report: EvaluationReport): PairDetail[] {
  const runNameMap = new Map(
    report.runSummaries.map((summary) => [summary.runId, summary.runName]),
  );

  return report.pairwise.map((pair) => ({
    runAId: pair.runA,
    runAName: runNameMap.get(pair.runA) || pair.runA,
    runBId: pair.runB,
    runBName: runNameMap.get(pair.runB) || pair.runB,
    kappa: pair.kappa,
    sampleSize: pair.sampleSize,
  }));
}
