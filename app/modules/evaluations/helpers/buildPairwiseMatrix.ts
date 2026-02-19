import type { EvaluationReport } from "../evaluations.types";

export interface PairwiseMatrixRun {
  runId: string;
  runName: string;
}

export interface PairwiseMatrixCell {
  kappa: number | null;
  sampleSize: number;
}

export interface PairwiseMatrix {
  runs: PairwiseMatrixRun[];
  cells: PairwiseMatrixCell[][];
}

export default function buildPairwiseMatrix(
  report: EvaluationReport,
): PairwiseMatrix {
  const runs: PairwiseMatrixRun[] = report.runSummaries.map((summary) => ({
    runId: summary.runId,
    runName: summary.runName,
  }));

  const kappaLookup = new Map<string, PairwiseMatrixCell>();
  for (const pair of report.pairwise) {
    const key = `${pair.runA}:${pair.runB}`;
    const reverseKey = `${pair.runB}:${pair.runA}`;
    const cell = { kappa: pair.kappa, sampleSize: pair.sampleSize };
    kappaLookup.set(key, cell);
    kappaLookup.set(reverseKey, cell);
  }

  const cells: PairwiseMatrixCell[][] = runs.map((rowRun) =>
    runs.map((colRun) => {
      if (rowRun.runId === colRun.runId) {
        return { kappa: null, sampleSize: 0 };
      }
      const cell = kappaLookup.get(`${rowRun.runId}:${colRun.runId}`);
      return cell || { kappa: null, sampleSize: 0 };
    }),
  );

  return { runs, cells };
}
