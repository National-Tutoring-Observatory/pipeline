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
  it("shows < 1 min for values under 60 seconds", () => {
    expect(formatTime(0)).toBe("< 1 min");
    expect(formatTime(15)).toBe("< 1 min");
    expect(formatTime(59)).toBe("< 1 min");
  });

  it("shows a range for minute-level values", () => {
    expect(formatTime(60)).toBe("1-2 min");
    expect(formatTime(120)).toBe("1-4 min");
    expect(formatTime(180)).toBe("1-6 min");
  });

  it("formats hour ranges", () => {
    expect(formatTime(3600)).toBe("30 min - 2h");
    expect(formatTime(7200)).toBe("1h - 4h");
  });
});
