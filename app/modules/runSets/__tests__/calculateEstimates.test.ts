import { describe, expect, it } from "vitest";
import aiGatewayConfig from "~/config/ai_gateway.json";
import { calculateEstimates } from "../helpers/calculateEstimates";
import { buildUsedPromptModelKey } from "../helpers/getUsedPromptModels";
import type { RunDefinition } from "../runSets.types";

const allModels = aiGatewayConfig.providers.flatMap((p) =>
  p.models.map((m) => m.code),
);

const allModelPricing = aiGatewayConfig.providers.flatMap((p) =>
  p.models.map((m) => ({
    inputCostPer1M: m.inputCostPer1M,
    outputCostPer1M: m.outputCostPer1M,
  })),
);

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
  const inputTokens = 250;
  const outputTokens = 250;
  return modelIndices.reduce((sum, i) => {
    const pricing = allModelPricing[i];
    return (
      sum +
      numPrompts *
        numSessions *
        verificationMultiplier *
        ((inputTokens / 1_000_000) * pricing.inputCostPer1M +
          (outputTokens / 1_000_000) * pricing.outputCostPer1M)
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

    expect(result.estimatedCost).toBeCloseTo(expectedCost(1, [0], 10), 5);
    expect(result.estimatedTimeSeconds).toBeCloseTo(expectedTime(1, 10), 1);
  });

  it("calculates cost and time for multiple models", () => {
    const definitions = [
      makeDefinition("promptA", 1, allModels[0]),
      makeDefinition("promptA", 1, allModels[2]),
      makeDefinition("promptB", 3, allModels[0]),
      makeDefinition("promptB", 3, allModels[2]),
    ];
    const result = calculateEstimates(definitions, Array(10).fill({}));

    expect(result.estimatedCost).toBeCloseTo(expectedCost(2, [0, 2], 10), 5);
    expect(result.estimatedTimeSeconds).toBeCloseTo(expectedTime(4, 10), 1);
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

    expect(result.estimatedCost).toBeCloseTo(expectedCost(1, [0], 10, 2), 5);
    expect(result.estimatedTimeSeconds).toBeCloseTo(expectedTime(1, 10) * 2, 1);
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

    expect(result.estimatedTimeSeconds).toBeCloseTo(expectedTime(1, 10), 1);
  });

  it("falls back to default when avgSecondsPerSession is 0", () => {
    const definitions = [makeDefinition("promptA", 1, allModels[0])];
    const result = calculateEstimates(definitions, Array(10).fill({}), {
      avgSecondsPerSession: 0,
    });

    expect(result.estimatedTimeSeconds).toBeCloseTo(expectedTime(1, 10), 1);
  });
});
