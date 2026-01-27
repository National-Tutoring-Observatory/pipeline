import { describe, expect, it } from "vitest";
import { calculateEstimates } from "../helpers/calculateEstimates";

describe("calculateEstimates", () => {
  it("calculates cost and time for single model", () => {
    const result = calculateEstimates(
      [{}],
      ["openai.gpt-4.1-mini"],
      Array(10).fill({}),
    );

    expect(result.estimatedCost).toBeCloseTo(0.005, 5);
    expect(result.estimatedTimeSeconds).toBeCloseTo(6.67, 1);
  });

  it("calculates cost and time for multiple models", () => {
    const result = calculateEstimates(
      [{}, {}],
      ["openai.gpt-4.1-mini", "google.gemini-2.5-flash"],
      Array(10).fill({}),
    );

    expect(result.estimatedCost).toBeCloseTo(0.024, 5);
    expect(result.estimatedTimeSeconds).toBeCloseTo(26.67, 1);
  });

  it("returns zero when no selections", () => {
    const result = calculateEstimates([], [], []);

    expect(result.estimatedCost).toBe(0);
    expect(result.estimatedTimeSeconds).toBe(0);
  });
});
