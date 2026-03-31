import { describe, expect, it } from "vitest";
import type { EvaluationReport } from "../evaluations.types";
import buildPairwiseMatrix from "../helpers/buildPairwiseMatrix";

function buildReport(
  overrides: Partial<EvaluationReport> = {},
): EvaluationReport {
  return {
    fieldKey: "creativity",
    meanKappa: 0.7,
    pairwise: [
      { runA: "run-1", runB: "run-2", kappa: 0.85, sampleSize: 100 },
      { runA: "run-1", runB: "run-3", kappa: 0.72, sampleSize: 100 },
      { runA: "run-2", runB: "run-3", kappa: 0.65, sampleSize: 100 },
    ],
    runSummaries: [
      {
        runId: "run-1",
        runName: "Run A",
        isHuman: false,
        isAdjudication: false,
        meanKappaWithOthers: 0.78,
      },
      {
        runId: "run-2",
        runName: "Run B",
        isHuman: false,
        isAdjudication: false,
        meanKappaWithOthers: 0.75,
      },
      {
        runId: "run-3",
        runName: "Run C",
        isHuman: false,
        isAdjudication: false,
        meanKappaWithOthers: 0.68,
      },
    ],
    ...overrides,
  };
}

describe("buildPairwiseMatrix", () => {
  it("returns runs from runSummaries", () => {
    const matrix = buildPairwiseMatrix(buildReport());

    expect(matrix.runs).toHaveLength(3);
    expect(matrix.runs[0]).toEqual({
      runId: "run-1",
      runName: "Run A",
      isHuman: false,
      isAdjudication: false,
    });
    expect(matrix.runs[1]).toEqual({
      runId: "run-2",
      runName: "Run B",
      isHuman: false,
      isAdjudication: false,
    });
    expect(matrix.runs[2]).toEqual({
      runId: "run-3",
      runName: "Run C",
      isHuman: false,
      isAdjudication: false,
    });
  });

  it("builds a square matrix matching run count", () => {
    const matrix = buildPairwiseMatrix(buildReport());

    expect(matrix.cells).toHaveLength(3);
    expect(matrix.cells[0]).toHaveLength(3);
    expect(matrix.cells[1]).toHaveLength(3);
    expect(matrix.cells[2]).toHaveLength(3);
  });

  it("sets diagonal cells to null kappa", () => {
    const matrix = buildPairwiseMatrix(buildReport());

    expect(matrix.cells[0][0].kappa).toBeNull();
    expect(matrix.cells[1][1].kappa).toBeNull();
    expect(matrix.cells[2][2].kappa).toBeNull();
  });

  it("fills cells with correct kappa values", () => {
    const matrix = buildPairwiseMatrix(buildReport());

    // run-1 vs run-2
    expect(matrix.cells[0][1].kappa).toBe(0.85);
    // run-1 vs run-3
    expect(matrix.cells[0][2].kappa).toBe(0.72);
    // run-2 vs run-3
    expect(matrix.cells[1][2].kappa).toBe(0.65);
  });

  it("is symmetric — cell [i][j] equals cell [j][i]", () => {
    const matrix = buildPairwiseMatrix(buildReport());

    expect(matrix.cells[0][1].kappa).toBe(matrix.cells[1][0].kappa);
    expect(matrix.cells[0][2].kappa).toBe(matrix.cells[2][0].kappa);
    expect(matrix.cells[1][2].kappa).toBe(matrix.cells[2][1].kappa);
  });

  it("includes sampleSize in cells", () => {
    const matrix = buildPairwiseMatrix(buildReport());

    expect(matrix.cells[0][1].sampleSize).toBe(100);
    expect(matrix.cells[1][0].sampleSize).toBe(100);
  });

  it("returns empty matrix for empty runSummaries", () => {
    const matrix = buildPairwiseMatrix(
      buildReport({ runSummaries: [], pairwise: [] }),
    );

    expect(matrix.runs).toHaveLength(0);
    expect(matrix.cells).toHaveLength(0);
  });

  it("returns null kappa when a pair is missing from pairwise", () => {
    const matrix = buildPairwiseMatrix(
      buildReport({
        pairwise: [
          { runA: "run-1", runB: "run-2", kappa: 0.85, sampleSize: 100 },
          // run-1 vs run-3 and run-2 vs run-3 are missing
        ],
      }),
    );

    expect(matrix.cells[0][1].kappa).toBe(0.85);
    expect(matrix.cells[0][2].kappa).toBeNull();
    expect(matrix.cells[1][2].kappa).toBeNull();
  });
});
