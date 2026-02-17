import { describe, expect, it } from "vitest";
import calculateMeanKappa from "../helpers/calculateMeanKappa";

describe("calculateMeanKappa", () => {
  it("calculates average kappa across valid pairs", () => {
    const pairs = [
      { kappa: 0.6, sampleSize: 10 },
      { kappa: 0.8, sampleSize: 10 },
      { kappa: 0.4, sampleSize: 10 },
    ];

    const meanKappa = calculateMeanKappa(pairs);

    expect(meanKappa).toBe(0.6);
  });

  it("excludes pairs with zero sample size", () => {
    const pairs = [
      { kappa: 0.6, sampleSize: 10 },
      { kappa: 0.0, sampleSize: 0 },
      { kappa: 0.8, sampleSize: 10 },
    ];

    const meanKappa = calculateMeanKappa(pairs);

    expect(meanKappa).toBe(0.7);
  });

  it("returns 0 for empty array", () => {
    const meanKappa = calculateMeanKappa([]);

    expect(meanKappa).toBe(0);
  });

  it("returns 0 when all pairs have zero sample size", () => {
    const pairs = [
      { kappa: 0.5, sampleSize: 0 },
      { kappa: 0.3, sampleSize: 0 },
    ];

    const meanKappa = calculateMeanKappa(pairs);

    expect(meanKappa).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    const pairs = [
      { kappa: 0.333, sampleSize: 5 },
      { kappa: 0.666, sampleSize: 5 },
    ];

    const meanKappa = calculateMeanKappa(pairs);

    expect(meanKappa).toBe(0.5);
  });
});
