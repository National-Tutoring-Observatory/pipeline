import { describe, expect, it } from "vitest";
import type { Run } from "~/modules/runs/runs.types";
import type { Evaluation } from "../evaluations.types";
import buildEvaluationReport, {
  type SessionFileCache,
} from "../helpers/buildEvaluationReport";

function makeRun(
  id: string,
  name: string,
  opts: { isHuman?: boolean; isAdjudication?: boolean } = {},
): Run {
  return {
    _id: id,
    name,
    isHuman: opts.isHuman ?? false,
    isAdjudication: opts.isAdjudication ?? false,
    snapshot: {
      prompt: {
        annotationType: "PER_SESSION",
        name: "",
        userPrompt: "",
        annotationSchema: [],
        version: 1,
      },
      model: { code: "gpt-4", provider: "openai", name: "GPT-4" },
    },
  } as unknown as Run;
}

function makeEvaluation(
  baseRun: string,
  runs: string[],
  annotationFields: string[],
): Evaluation {
  return {
    _id: "eval-1",
    name: "Test Eval",
    project: "proj-1",
    runSet: "rs-1",
    baseRun,
    runs,
    annotationFields,
  };
}

describe("buildEvaluationReport", () => {
  it("returns zero-filled reports when no common sessions", async () => {
    const runs = [makeRun("r1", "Run 1"), makeRun("r2", "Run 2")];
    const evaluation = makeEvaluation("r1", ["r1", "r2"], ["quality"]);

    const reports = await buildEvaluationReport(evaluation, runs, {}, []);

    expect(reports).toHaveLength(1);
    expect(reports[0].fieldKey).toBe("quality");
    expect(reports[0].meanKappa).toBe(0);
    expect(reports[0].pairwise).toEqual([]);
    expect(reports[0].runSummaries).toEqual([]);
  });

  it("returns one report per annotation field", async () => {
    const runs = [makeRun("r1", "Run 1"), makeRun("r2", "Run 2")];
    const evaluation = makeEvaluation("r1", ["r1", "r2"], ["quality", "tone"]);

    const reports = await buildEvaluationReport(evaluation, runs, {}, []);

    expect(reports).toHaveLength(2);
    expect(reports.map((r) => r.fieldKey)).toEqual(["quality", "tone"]);
  });

  it("computes perfect agreement (kappa=1) when labels match", async () => {
    const session = "sess-1";
    const cache: SessionFileCache = {
      r1: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a1", identifiedBy: "model", quality: "good" }],
        },
      },
      r2: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a2", identifiedBy: "model", quality: "good" }],
        },
      },
    };
    const runs = [makeRun("r1", "Run 1"), makeRun("r2", "Run 2")];
    const evaluation = makeEvaluation("r1", ["r1", "r2"], ["quality"]);

    const reports = await buildEvaluationReport(evaluation, runs, cache, [
      session,
    ]);

    expect(reports[0].pairwise[0].kappa).toBe(1);
    expect(reports[0].meanKappa).toBe(1);
  });

  it("includes precision/recall/f1 when one run is the base run", async () => {
    const session = "sess-1";
    const cache: SessionFileCache = {
      base: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a1", identifiedBy: "model", quality: "good" }],
        },
      },
      other: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a2", identifiedBy: "model", quality: "good" }],
        },
      },
    };
    const runs = [makeRun("base", "Base Run"), makeRun("other", "Other Run")];
    const evaluation = makeEvaluation("base", ["base", "other"], ["quality"]);

    const reports = await buildEvaluationReport(evaluation, runs, cache, [
      session,
    ]);

    const pairwiseResult = reports[0].pairwise[0];
    expect(pairwiseResult.precision).toBeDefined();
    expect(pairwiseResult.recall).toBeDefined();
    expect(pairwiseResult.f1).toBeDefined();
  });

  it("does not include precision/recall/f1 for pairs not involving the base run", async () => {
    const session = "sess-1";
    const cache: SessionFileCache = {
      base: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a1", identifiedBy: "model", quality: "good" }],
        },
      },
      r2: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a2", identifiedBy: "model", quality: "good" }],
        },
      },
      r3: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a3", identifiedBy: "model", quality: "good" }],
        },
      },
    };
    const runs = [
      makeRun("base", "Base"),
      makeRun("r2", "R2"),
      makeRun("r3", "R3"),
    ];
    const evaluation = makeEvaluation(
      "base",
      ["base", "r2", "r3"],
      ["quality"],
    );

    const reports = await buildEvaluationReport(evaluation, runs, cache, [
      session,
    ]);

    const r2r3Pair = reports[0].pairwise.find(
      (p) => p.runA === "r2" && p.runB === "r3",
    );
    expect(r2r3Pair).toBeDefined();
    expect(r2r3Pair!.precision).toBeUndefined();
    expect(r2r3Pair!.recall).toBeUndefined();
    expect(r2r3Pair!.f1).toBeUndefined();
  });

  it("generates all pairwise combinations for N runs", async () => {
    const session = "sess-1";
    const makeEntry = (label: string) => ({
      transcript: [] as never[],
      leadRole: "tutor",
      annotations: [{ _id: "a", identifiedBy: "model", quality: label }],
    });
    const cache: SessionFileCache = {
      r1: { [session]: makeEntry("good") },
      r2: { [session]: makeEntry("good") },
      r3: { [session]: makeEntry("good") },
    };
    const runs = [
      makeRun("r1", "R1"),
      makeRun("r2", "R2"),
      makeRun("r3", "R3"),
    ];
    const evaluation = makeEvaluation("r1", ["r1", "r2", "r3"], ["quality"]);

    const reports = await buildEvaluationReport(evaluation, runs, cache, [
      session,
    ]);

    expect(reports[0].pairwise).toHaveLength(3);
  });

  it("carries isHuman and isAdjudication flags in run summaries", async () => {
    const session = "sess-1";
    const cache: SessionFileCache = {
      human: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a1", identifiedBy: "model", quality: "good" }],
        },
      },
      adj: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a2", identifiedBy: "model", quality: "good" }],
        },
      },
    };
    const runs = [
      makeRun("human", "Human Run", { isHuman: true }),
      makeRun("adj", "Adj Run", { isAdjudication: true }),
    ];
    const evaluation = makeEvaluation("human", ["human", "adj"], ["quality"]);

    const reports = await buildEvaluationReport(evaluation, runs, cache, [
      session,
    ]);

    const humanSummary = reports[0].runSummaries.find(
      (s) => s.runId === "human",
    );
    const adjSummary = reports[0].runSummaries.find((s) => s.runId === "adj");
    expect(humanSummary!.isHuman).toBe(true);
    expect(adjSummary!.isAdjudication).toBe(true);
  });

  it("skips sessions missing from the cache", async () => {
    const session = "sess-present";
    const cache: SessionFileCache = {
      r1: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a1", identifiedBy: "model", quality: "good" }],
        },
      },
      r2: {
        [session]: {
          transcript: [],
          leadRole: "tutor",
          annotations: [{ _id: "a2", identifiedBy: "model", quality: "good" }],
        },
      },
    };
    const runs = [makeRun("r1", "Run 1"), makeRun("r2", "Run 2")];
    const evaluation = makeEvaluation("r1", ["r1", "r2"], ["quality"]);

    const reports = await buildEvaluationReport(evaluation, runs, cache, [
      session,
      "sess-missing",
    ]);

    expect(reports[0].pairwise[0].sampleSize).toBe(1);
  });
});
