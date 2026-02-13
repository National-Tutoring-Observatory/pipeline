import { describe, expect, it } from "vitest";
import buildRunStatusMatch from "../helpers/buildRunStatusMatch";

describe("buildRunStatusMatch", () => {
  it("returns { isRunning: true } for RUNNING", () => {
    expect(buildRunStatusMatch("RUNNING")).toEqual({ isRunning: true });
  });

  it("returns stoppedAt exists for STOPPED", () => {
    expect(buildRunStatusMatch("STOPPED")).toEqual({
      stoppedAt: { $exists: true },
    });
  });

  it("returns { hasErrored: true } for FAILED", () => {
    expect(buildRunStatusMatch("FAILED")).toEqual({ hasErrored: true });
  });

  it("returns { isComplete: true, hasErrored: false } for COMPLETE", () => {
    expect(buildRunStatusMatch("COMPLETE")).toEqual({
      isComplete: true,
      hasErrored: false,
    });
  });

  it("returns negated conditions for QUEUED", () => {
    expect(buildRunStatusMatch("QUEUED")).toEqual({
      isRunning: false,
      isComplete: false,
      hasErrored: false,
      stoppedAt: { $exists: false },
    });
  });

  it("returns null for invalid status", () => {
    expect(buildRunStatusMatch("INVALID")).toBeNull();
  });
});
