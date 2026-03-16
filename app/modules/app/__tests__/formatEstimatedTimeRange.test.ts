import { describe, expect, it } from "vitest";
import formatEstimatedTimeRange from "../helpers/formatEstimatedTimeRange";

describe("formatEstimatedTimeRange", () => {
  it("shows under a minute for short durations", () => {
    expect(formatEstimatedTimeRange(20)).toBe("< 1 min");
  });

  it("formats minute-only ranges", () => {
    expect(formatEstimatedTimeRange(180)).toBe("1-6 min");
  });

  it("formats ranges that include hours", () => {
    expect(formatEstimatedTimeRange(3600)).toBe("30 min - 2h");
  });

  it("appends suffix when provided", () => {
    expect(formatEstimatedTimeRange(180, { suffix: " remaining" })).toBe(
      "1-6 min remaining",
    );
  });
});
