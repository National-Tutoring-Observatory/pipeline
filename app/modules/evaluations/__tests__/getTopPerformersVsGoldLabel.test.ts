import { describe, expect, it } from "vitest";
import type { EvaluationReport } from "../evaluations.types";
import getTopPerformersVsGoldLabel from "../helpers/getTopPerformersVsGoldLabel";

const BASE_RUN_ID = "base-run-1";

function buildReport(
  overrides: Partial<EvaluationReport> = {},
): EvaluationReport {
  return {
    fieldKey: "creativity",
    meanKappa: 0.7,
    pairwise: [
      { runA: BASE_RUN_ID, runB: "run-2", kappa: 0.85, sampleSize: 100 },
      { runA: "run-3", runB: BASE_RUN_ID, kappa: 0.72, sampleSize: 100 },
      { runA: BASE_RUN_ID, runB: "run-4", kappa: 0.91, sampleSize: 100 },
      { runA: "run-2", runB: "run-3", kappa: 0.65, sampleSize: 100 },
    ],
    runSummaries: [
      {
        runId: BASE_RUN_ID,
        runName: "Gold Label Run",
        isHuman: true,
        meanKappaWithOthers: 0.8,
      },
      {
        runId: "run-2",
        runName: "GPT-4 Run",
        isHuman: false,
        meanKappaWithOthers: 0.75,
      },
      {
        runId: "run-3",
        runName: "Claude Run",
        isHuman: false,
        meanKappaWithOthers: 0.68,
      },
      {
        runId: "run-4",
        runName: "Gemini Run",
        isHuman: false,
        meanKappaWithOthers: 0.82,
      },
    ],
    ...overrides,
  };
}

describe("getTopPerformersVsGoldLabel", () => {
  it("filters to only pairs involving the base run", () => {
    const report = buildReport();
    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers).toHaveLength(3);
    expect(performers.every((p) => p.runId !== BASE_RUN_ID)).toBe(true);
  });

  it("sorts by kappa descending", () => {
    const report = buildReport();
    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers[0].kappa).toBe(0.91);
    expect(performers[1].kappa).toBe(0.85);
    expect(performers[2].kappa).toBe(0.72);
  });

  it("assigns correct rank numbers", () => {
    const report = buildReport();
    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers[0].rank).toBe(1);
    expect(performers[1].rank).toBe(2);
    expect(performers[2].rank).toBe(3);
  });

  it("resolves run names from runSummaries", () => {
    const report = buildReport();
    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers[0].runName).toBe("Gemini Run");
    expect(performers[1].runName).toBe("GPT-4 Run");
    expect(performers[2].runName).toBe("Claude Run");
  });

  it("handles baseRun as runA or runB", () => {
    const report = buildReport({
      pairwise: [
        { runA: BASE_RUN_ID, runB: "run-2", kappa: 0.8, sampleSize: 50 },
        { runA: "run-3", runB: BASE_RUN_ID, kappa: 0.9, sampleSize: 50 },
      ],
    });

    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers).toHaveLength(2);
    expect(performers[0].runId).toBe("run-3");
    expect(performers[1].runId).toBe("run-2");
  });

  it("returns empty array when no pairs involve the base run", () => {
    const report = buildReport({
      pairwise: [
        { runA: "run-2", runB: "run-3", kappa: 0.65, sampleSize: 100 },
      ],
    });

    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers).toHaveLength(0);
  });

  it("returns empty array for empty pairwise data", () => {
    const report = buildReport({ pairwise: [] });

    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers).toHaveLength(0);
  });

  it("falls back to runId when run name is not in summaries", () => {
    const report = buildReport({
      pairwise: [
        { runA: BASE_RUN_ID, runB: "unknown-run", kappa: 0.5, sampleSize: 50 },
      ],
      runSummaries: [
        {
          runId: BASE_RUN_ID,
          runName: "Gold Label Run",
          isHuman: true,
          meanKappaWithOthers: 0.5,
        },
      ],
    });

    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers[0].runName).toBe("unknown-run");
  });

  it("includes sampleSize in results", () => {
    const report = buildReport({
      pairwise: [
        { runA: BASE_RUN_ID, runB: "run-2", kappa: 0.8, sampleSize: 250 },
      ],
    });

    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers[0].sampleSize).toBe(250);
  });

  it("handles negative kappa values", () => {
    const report = buildReport({
      pairwise: [
        { runA: BASE_RUN_ID, runB: "run-2", kappa: 0.8, sampleSize: 100 },
        { runA: BASE_RUN_ID, runB: "run-3", kappa: -0.1, sampleSize: 100 },
      ],
    });

    const performers = getTopPerformersVsGoldLabel(report, BASE_RUN_ID);

    expect(performers[0].kappa).toBe(0.8);
    expect(performers[1].kappa).toBe(-0.1);
    expect(performers[1].rank).toBe(2);
  });
});
