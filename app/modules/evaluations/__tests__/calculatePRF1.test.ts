import { describe, expect, it } from "vitest";
import calculatePRF1 from "../helpers/calculatePRF1";

describe("calculatePRF1", () => {
  it("returns perfect scores when predictions match gold labels exactly", () => {
    const gold = [
      "CREATIVE",
      "NOT_CREATIVE",
      "CREATIVE",
      "CREATIVE",
      "NOT_CREATIVE",
    ];
    const predictions = [
      "CREATIVE",
      "NOT_CREATIVE",
      "CREATIVE",
      "CREATIVE",
      "NOT_CREATIVE",
    ];

    const result = calculatePRF1(predictions, gold);

    expect(result.precision).toBe(1);
    expect(result.recall).toBe(1);
    expect(result.f1).toBe(1);
  });

  it("returns zeros for empty arrays", () => {
    const result = calculatePRF1([], []);

    expect(result.precision).toBe(0);
    expect(result.recall).toBe(0);
    expect(result.f1).toBe(0);
  });

  it("returns zeros for mismatched array lengths", () => {
    const result = calculatePRF1(["A", "B"], ["A"]);

    expect(result.precision).toBe(0);
    expect(result.recall).toBe(0);
    expect(result.f1).toBe(0);
  });

  it("calculates partial agreement for binary classification", () => {
    const gold = ["YES", "YES", "NO", "NO", "YES"];
    const predictions = ["YES", "NO", "NO", "YES", "YES"];

    const result = calculatePRF1(predictions, gold);

    // YES: TP=2, FP=1, FN=1 → precision=2/3, recall=2/3
    // NO:  TP=1, FP=1, FN=1 → precision=1/2, recall=1/2
    // Macro precision = (2/3 + 1/2) / 2 = 7/12 ≈ 0.58
    // Macro recall    = (2/3 + 1/2) / 2 = 7/12 ≈ 0.58
    // F1 = 2 * 0.58 * 0.58 / (0.58 + 0.58) ≈ 0.58
    expect(result.precision).toBeCloseTo(0.58, 2);
    expect(result.recall).toBeCloseTo(0.58, 2);
    expect(result.f1).toBeCloseTo(0.58, 2);
  });

  it("handles multi-class scenario", () => {
    const gold = ["HIGH", "MEDIUM", "LOW", "HIGH", "MEDIUM", "LOW"];
    const predictions = ["HIGH", "MEDIUM", "LOW", "HIGH", "LOW", "MEDIUM"];

    const result = calculatePRF1(predictions, gold);

    // HIGH: TP=2, FP=0, FN=0 → P=1, R=1
    // MEDIUM: TP=1, FP=1, FN=1 → P=0.5, R=0.5
    // LOW: TP=1, FP=1, FN=1 → P=0.5, R=0.5
    // Macro P = (1 + 0.5 + 0.5) / 3 = 2/3 ≈ 0.67
    // Macro R = (1 + 0.5 + 0.5) / 3 = 2/3 ≈ 0.67
    expect(result.precision).toBeCloseTo(0.67, 2);
    expect(result.recall).toBeCloseTo(0.67, 2);
    expect(result.f1).toBeCloseTo(0.67, 2);
  });

  it("handles complete disagreement", () => {
    const gold = ["A", "A", "A"];
    const predictions = ["B", "B", "B"];

    const result = calculatePRF1(predictions, gold);

    // A: TP=0, FP=0, FN=3 → P=0, R=0
    // B: TP=0, FP=3, FN=0 → P=0, R=0
    expect(result.precision).toBe(0);
    expect(result.recall).toBe(0);
    expect(result.f1).toBe(0);
  });

  it("rounds results to 2 decimal places", () => {
    const gold = ["A", "A", "B", "B", "B", "B"];
    const predictions = ["A", "B", "B", "B", "B", "A"];

    const result = calculatePRF1(predictions, gold);

    const decimalPlaces = (n: number) => {
      const str = n.toString();
      const decimalIndex = str.indexOf(".");
      return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
    };

    expect(decimalPlaces(result.precision)).toBeLessThanOrEqual(2);
    expect(decimalPlaces(result.recall)).toBeLessThanOrEqual(2);
    expect(decimalPlaces(result.f1)).toBeLessThanOrEqual(2);
  });
});
