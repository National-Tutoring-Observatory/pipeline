import { describe, expect, it } from "vitest";
import { formatCost, formatTime } from "../helpers/formatEstimates";

describe("formatCost", () => {
  it("formats zero cost", () => {
    expect(formatCost(0)).toBe("0.00");
  });

  it("formats cost less than 0.01", () => {
    expect(formatCost(0.005)).toBe("< 0.01");
    expect(formatCost(0.001)).toBe("< 0.01");
    expect(formatCost(0.0099)).toBe("< 0.01");
  });

  it("formats normal cost", () => {
    expect(formatCost(0.01)).toBe("0.01");
    expect(formatCost(0.23)).toBe("0.23");
    expect(formatCost(1.5)).toBe("1.50");
    expect(formatCost(12.345)).toBe("12.35");
  });
});

describe("formatTime", () => {
  it("shows < 30s for values under 30 seconds", () => {
    expect(formatTime(0)).toBe("< 30s");
    expect(formatTime(15)).toBe("< 30s");
    expect(formatTime(29)).toBe("< 30s");
  });

  it("shows ~ 1 min for values between 30 and 59 seconds", () => {
    expect(formatTime(30)).toBe("~ 1 min");
    expect(formatTime(45)).toBe("~ 1 min");
    expect(formatTime(59)).toBe("~ 1 min");
  });

  it("rounds to nearest minute", () => {
    expect(formatTime(60)).toBe("~ 1 min");
    expect(formatTime(70)).toBe("~ 1 min");
    expect(formatTime(90)).toBe("~ 2 min");
    expect(formatTime(120)).toBe("~ 2 min");
    expect(formatTime(150)).toBe("~ 3 min");
  });

  it("formats hours and minutes", () => {
    expect(formatTime(3600)).toBe("~ 1h");
    expect(formatTime(3660)).toBe("~ 1h 1 min");
    expect(formatTime(5400)).toBe("~ 1h 30 min");
    expect(formatTime(7200)).toBe("~ 2h");
  });
});
