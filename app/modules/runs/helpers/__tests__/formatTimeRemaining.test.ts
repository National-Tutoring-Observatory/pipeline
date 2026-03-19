import { describe, expect, it, vi } from "vitest";
import formatTimeRemaining from "../formatTimeRemaining";

describe("formatTimeRemaining", () => {
  it("returns null when startedAt is missing", () => {
    expect(formatTimeRemaining(null, 1, 5)).toBeNull();
  });

  it("returns null when fewer than 3 sessions completed", () => {
    expect(formatTimeRemaining("2026-01-01T00:00:00.000Z", 0, 5)).toBeNull();
    expect(formatTimeRemaining("2026-01-01T00:00:00.000Z", 1, 5)).toBeNull();
    expect(formatTimeRemaining("2026-01-01T00:00:00.000Z", 2, 5)).toBeNull();
  });

  it("returns null when completed is greater than or equal to total", () => {
    expect(formatTimeRemaining("2026-01-01T00:00:00.000Z", 5, 5)).toBeNull();
  });

  it("returns approximate time remaining for in-progress runs", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:01:40.000Z"));

    expect(formatTimeRemaining("2026-01-01T00:00:00.000Z", 3, 9)).toBe(
      "~4 min remaining",
    );

    vi.useRealTimers();
  });
});
