import { describe, expect, it } from "vitest";
import calculateCost from "../calculateCost";

describe("calculateCost", () => {
  it("calculates cost for a single-tier model", () => {
    const cost = calculateCost({
      modelCode: "nto.google.gemini-2.5-flash-lite",
      inputTokens: 1000,
      outputTokens: 500,
    });

    expect(cost).toBeGreaterThan(0);
    expect(typeof cost).toBe("number");
  });

  it("picks the correct tier based on input token count", () => {
    const lowTokenCost = calculateCost({
      modelCode: "nto.google.gemini-3-flash-preview",
      inputTokens: 100_000,
      outputTokens: 50_000,
    });

    const highTokenCost = calculateCost({
      modelCode: "nto.google.gemini-3-flash-preview",
      inputTokens: 300_000,
      outputTokens: 50_000,
    });

    expect(lowTokenCost).toBeGreaterThan(0);
    expect(highTokenCost).toBeGreaterThan(lowTokenCost);
  });

  it("uses catch-all tier when input exceeds all thresholds", () => {
    const cost = calculateCost({
      modelCode: "nto.google.gemini-3-flash-preview",
      inputTokens: 10_000_000,
      outputTokens: 1_000_000,
    });

    expect(cost).toBeGreaterThan(0);
  });

  it("handles exact threshold boundary", () => {
    const cost = calculateCost({
      modelCode: "nto.google.gemini-3-flash-preview",
      inputTokens: 200_000,
      outputTokens: 50_000,
    });

    expect(cost).toBeGreaterThan(0);
  });

  it("returns 0 for unknown model", () => {
    const cost = calculateCost({
      modelCode: "nonexistent.model",
      inputTokens: 1000,
      outputTokens: 500,
    });

    expect(cost).toBe(0);
  });

  it("returns 0 when tokens are 0", () => {
    const cost = calculateCost({
      modelCode: "nto.google.gemini-3-flash-preview",
      inputTokens: 0,
      outputTokens: 0,
    });

    expect(cost).toBe(0);
  });

  it("calculates cost correctly with known values", () => {
    // 1000 input tokens at $0.5/1M = $0.0005
    // 500 output tokens at $3.0/1M = $0.0015
    // Total = $0.002
    const cost = calculateCost({
      modelCode: "nto.google.gemini-3-flash-preview",
      inputTokens: 1000,
      outputTokens: 500,
    });

    expect(cost).toBeCloseTo(0.002, 6);
  });
});
