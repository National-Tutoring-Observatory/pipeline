import type { EvaluationReport } from "../evaluations.types";

export interface TopPerformer {
  rank: number;
  runId: string;
  runName: string;
  isHuman: boolean;
  kappa: number;
  sampleSize: number;
}

export default function getTopPerformersVsGoldLabel(
  report: EvaluationReport,
  baseRunId: string,
): TopPerformer[] {
  const runNameMap = new Map(
    report.runSummaries.map((s) => [s.runId, s.runName]),
  );
  const runIsHumanMap = new Map(
    report.runSummaries.map((s) => [s.runId, s.isHuman]),
  );

  const baseRunPairs = report.pairwise.filter(
    (pair) => pair.runA === baseRunId || pair.runB === baseRunId,
  );

  const performers = baseRunPairs.map((pair) => {
    const otherRunId = pair.runA === baseRunId ? pair.runB : pair.runA;

    return {
      rank: 0,
      runId: otherRunId,
      runName: runNameMap.get(otherRunId) || otherRunId,
      isHuman: runIsHumanMap.get(otherRunId) || false,
      kappa: pair.kappa,
      sampleSize: pair.sampleSize,
    };
  });

  performers.sort((a, b) => b.kappa - a.kappa);

  return performers.map((performer, index) => ({
    ...performer,
    rank: index + 1,
  }));
}
