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
  it("formats seconds", () => {
    expect(formatTime(0)).toBe("0s");
    expect(formatTime(30)).toBe("30s");
    expect(formatTime(59)).toBe("59s");
  });

  it("formats minutes", () => {
    expect(formatTime(60)).toBe("1m");
    expect(formatTime(90)).toBe("1m 30s");
    expect(formatTime(120)).toBe("2m");
  });

  it("formats hours and minutes", () => {
    expect(formatTime(3600)).toBe("1h");
    expect(formatTime(3660)).toBe("1h 1m");
    expect(formatTime(5400)).toBe("1h 30m");
    expect(formatTime(7200)).toBe("2h");
  });
});
