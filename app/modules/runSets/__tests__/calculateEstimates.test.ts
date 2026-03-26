import { describe, expect, it } from "vitest";
import calculateCost from "~/modules/llm/helpers/calculateCost";
import { getAvailableModels } from "~/modules/llm/modelRegistry";
import { calculateEstimates } from "../helpers/calculateEstimates";
import { buildUsedPromptModelKey } from "../helpers/getUsedPromptModels";
import type { RunDefinition } from "../runSets.types";

const allModels = getAvailableModels().map((m) => m.code);

function makeDefinition(
  promptId: string,
  version: number,
  modelCode: string,
): RunDefinition {
  return {
    key: buildUsedPromptModelKey(promptId, version, modelCode),
    prompt: { promptId, promptName: promptId, version },
    modelCode,
  };
}

function expectedCost(
  numPrompts: number,
  modelIndices: number[],
  numSessions: number,
  verificationMultiplier = 1,
) {
  const totalInputTokens = numSessions * 250;
  const totalOutputTokens = numSessions * 250;
  return modelIndices.reduce((sum, i) => {
    return (
      sum +
      numPrompts *
        verificationMultiplier *
        calculateCost({
          modelCode: allModels[i],
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
        })
    );
  }, 0);
}

function expectedTime(numDefinitions: number, numSessions: number) {
  return (numDefinitions * numSessions * 10) / 5;
}

describe("calculateEstimates", () => {
  it("calculates cost and time for single model", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const result = calculateEstimates(definitions, Array(10).fill({}));

    expect(result.estimatedCost).toBe(expectedCost(1, [0], 10));
    expect(result.estimatedTimeSeconds).toBe(expectedTime(1, 10));
  });

  it("calculates cost and time for multiple models", () => {
    const definitions = [
      makeDefinition("promptA", 1, allModels[0]),
      makeDefinition("promptA", 1, allModels[2]),
      makeDefinition("promptB", 3, allModels[0]),
      makeDefinition("promptB", 3, allModels[2]),
    ];
    const result = calculateEstimates(definitions, Array(10).fill({}));

    expect(result.estimatedCost).toBe(expectedCost(2, [0, 2], 10));
    expect(result.estimatedTimeSeconds).toBe(expectedTime(4, 10));
  });

  it("returns zero when no selections", () => {
    const result = calculateEstimates([], []);

    expect(result.estimatedCost).toBe(0);
    expect(result.estimatedTimeSeconds).toBe(0);
  });

  it("doubles time and cost when verification is enabled", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const result = calculateEstimates(definitions, Array(10).fill({}), {
      shouldRunVerification: true,
    });

    expect(result.estimatedCost).toBe(expectedCost(1, [0], 10, 2));
    expect(result.estimatedTimeSeconds).toBe(expectedTime(1, 10) * 2);
  });

  it("uses historical avgSecondsPerSession when provided", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const result = calculateEstimates(definitions, Array(10).fill({}), {
      avgSecondsPerSession: 8,
    });

    expect(result.estimatedTimeSeconds).toBe(1 * 10 * 8);
  });

  it("uses historical avgSecondsPerSession with verification", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const result = calculateEstimates(definitions, Array(10).fill({}), {
      avgSecondsPerSession: 8,
      shouldRunVerification: true,
    });

    expect(result.estimatedTimeSeconds).toBe(1 * 10 * 8 * 2);
  });

  it("falls back to default when avgSecondsPerSession is null", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const result = calculateEstimates(definitions, Array(10).fill({}), {
      avgSecondsPerSession: null,
    });

    expect(result.estimatedTimeSeconds).toBe(expectedTime(1, 10));
  });

  it("falls back to default when avgSecondsPerSession is 0", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const result = calculateEstimates(definitions, Array(10).fill({}), {
      avgSecondsPerSession: 0,
    });

    expect(result.estimatedTimeSeconds).toBe(expectedTime(1, 10));
  });

  it("uses real session inputTokens for cost", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const sessions = Array(10).fill({ inputTokens: 1000 });
    const result = calculateEstimates(definitions, sessions);

    const totalInputTokens = 10 * 1000;
    const expected = calculateCost({
      modelCode: allModels[0],
      inputTokens: totalInputTokens,
      outputTokens: totalInputTokens,
    });
    expect(result.estimatedCost).toBe(expected);
  });

  it("uses per-session fallback for sessions without inputTokens", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const withDefault = calculateEstimates(definitions, Array(10).fill({}));
    const withUndefined = calculateEstimates(
      definitions,
      Array(10).fill({ inputTokens: undefined }),
    );

    expect(withUndefined.estimatedCost).toBe(withDefault.estimatedCost);
  });

  it("mixes real tokens and fallback for sessions without inputTokens", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const sessions = [{ inputTokens: 1000 }, { inputTokens: 2000 }, {}];
    const result = calculateEstimates(definitions, sessions);

    const totalInputTokens = 1000 + 2000 + 250;
    const expected = calculateCost({
      modelCode: allModels[0],
      inputTokens: totalInputTokens,
      outputTokens: totalInputTokens,
    });
    expect(result.estimatedCost).toBe(expected);
  });

  it("uses outputToInputRatio for output tokens", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const sessions = Array(10).fill({ inputTokens: 1000 });
    const outputToInputRatio = 2.5;
    const result = calculateEstimates(definitions, sessions, {
      outputToInputRatio,
    });

    const totalInputTokens = 10 * 1000;
    const expected = calculateCost({
      modelCode: allModels[0],
      inputTokens: totalInputTokens,
      outputTokens: totalInputTokens * outputToInputRatio,
    });
    expect(result.estimatedCost).toBe(expected);
  });

  it("falls back to default ratio when outputToInputRatio is null", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const sessions = Array(10).fill({ inputTokens: 1000 });
    const withNull = calculateEstimates(definitions, sessions, {
      outputToInputRatio: null,
    });
    const withDefault = calculateEstimates(definitions, sessions);

    expect(withNull.estimatedCost).toBe(withDefault.estimatedCost);
  });

  it("falls back to default ratio when outputToInputRatio is 0", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const sessions = Array(10).fill({ inputTokens: 1000 });
    const withZero = calculateEstimates(definitions, sessions, {
      outputToInputRatio: 0,
    });
    const withDefault = calculateEstimates(definitions, sessions);

    expect(withZero.estimatedCost).toBe(withDefault.estimatedCost);
  });
});
