import { describe, expect, it } from "vitest";
import calculateCohensKappa from "../helpers/calculateCohensKappa";

describe("calculateCohensKappa", () => {
  it("calculates kappa for the example from evaluation-equations.md", () => {
    const runA = [
      "CREATIVE",
      "NOT_CREATIVE",
      "CREATIVE",
      "CREATIVE",
      "NOT_CREATIVE",
    ];
    const runB = [
      "CREATIVE",
      "NOT_CREATIVE",
      "NOT_CREATIVE",
      "CREATIVE",
      "NOT_CREATIVE",
    ];

    const kappa = calculateCohensKappa(runA, runB);

    expect(kappa).toBeCloseTo(0.58, 1);
  });

  it("returns 1 for perfect agreement", () => {
    const labels = ["A", "B", "C", "A", "B"];

    const kappa = calculateCohensKappa(labels, labels);

    expect(kappa).toBe(1);
  });

  it("returns 0 for empty arrays", () => {
    const kappa = calculateCohensKappa([], []);

    expect(kappa).toBe(0);
  });

  it("returns 0 for agreement equal to chance", () => {
    const labelsA = ["A", "B", "A", "B"];
    const labelsB = ["B", "A", "B", "A"];

    const kappa = calculateCohensKappa(labelsA, labelsB);

    expect(kappa).toBeLessThanOrEqual(0);
  });

  it("handles single category where both raters always agree", () => {
    const labels = ["SAME", "SAME", "SAME"];

    const kappa = calculateCohensKappa(labels, labels);

    expect(kappa).toBe(1);
  });

  it("handles three categories", () => {
    const labelsA = ["HIGH", "MEDIUM", "LOW", "HIGH", "MEDIUM", "LOW"];
    const labelsB = ["HIGH", "MEDIUM", "LOW", "HIGH", "LOW", "MEDIUM"];

    const kappa = calculateCohensKappa(labelsA, labelsB);

    expect(kappa).toBeGreaterThan(0);
    expect(kappa).toBeLessThan(1);
  });
});
