import { describe, expect, it } from "vitest";
import aiGatewayConfig from "~/config/ai_gateway.json";
import { calculateEstimates } from "../helpers/calculateEstimates";

const allModels = aiGatewayConfig.providers.flatMap((p) =>
  p.models.map((m) => m.code),
);

const allModelPricing = aiGatewayConfig.providers.flatMap((p) =>
  p.models.map((m) => ({
    inputCostPer1M: m.inputCostPer1M,
    outputCostPer1M: m.outputCostPer1M,
  })),
);

function expectedCost(
  numPrompts: number,
  modelIndices: number[],
  numSessions: number,
) {
  const inputTokens = 250;
  const outputTokens = 250;
  return modelIndices.reduce((sum, i) => {
    const pricing = allModelPricing[i];
    return (
      sum +
      numPrompts *
        numSessions *
        ((inputTokens / 1_000_000) * pricing.inputCostPer1M +
          (outputTokens / 1_000_000) * pricing.outputCostPer1M)
    );
  }, 0);
}

function expectedTime(
  numPrompts: number,
  numModels: number,
  numSessions: number,
) {
  return (numPrompts * numModels * numSessions * 2) / 3;
}

describe("calculateEstimates", () => {
  it("calculates cost and time for single model", () => {
    const result = calculateEstimates([{}], [allModels[0]], Array(10).fill({}));

    expect(result.estimatedCost).toBeCloseTo(expectedCost(1, [0], 10), 5);
    expect(result.estimatedTimeSeconds).toBeCloseTo(expectedTime(1, 1, 10), 1);
  });

  it("calculates cost and time for multiple models", () => {
    const result = calculateEstimates(
      [{}, {}],
      [allModels[0], allModels[2]],
      Array(10).fill({}),
    );

    expect(result.estimatedCost).toBeCloseTo(expectedCost(2, [0, 2], 10), 5);
    expect(result.estimatedTimeSeconds).toBeCloseTo(expectedTime(2, 2, 10), 1);
  });

  it("returns zero when no selections", () => {
    const result = calculateEstimates([], [], []);

    expect(result.estimatedCost).toBe(0);
    expect(result.estimatedTimeSeconds).toBe(0);
  });
});
