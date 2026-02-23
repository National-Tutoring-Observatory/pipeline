import { describe, expect, it } from "vitest";
import type { Run } from "../../runs.types";
import { getRunStatusKey } from "../statusMeta";

const base: Pick<Run, "isRunning" | "isComplete" | "hasErrored" | "stoppedAt"> =
  {
    isRunning: false,
    isComplete: false,
    hasErrored: false,
    stoppedAt: null,
  };

describe("getRunStatusKey", () => {
  it("returns QUEUED when no flags are set", () => {
    expect(getRunStatusKey(base as Run)).toBe("QUEUED");
  });

  it("returns RUNNING when isRunning is true", () => {
    expect(getRunStatusKey({ ...base, isRunning: true } as Run)).toBe(
      "RUNNING",
    );
  });

  it("returns COMPLETE when isComplete is true", () => {
    expect(getRunStatusKey({ ...base, isComplete: true } as Run)).toBe(
      "COMPLETE",
    );
  });

  it("returns FAILED when hasErrored is true", () => {
    expect(getRunStatusKey({ ...base, hasErrored: true } as Run)).toBe(
      "FAILED",
    );
  });

  it("returns STOPPED when stoppedAt is set", () => {
    expect(getRunStatusKey({ ...base, stoppedAt: new Date() } as Run)).toBe(
      "STOPPED",
    );
  });

  it("prioritizes RUNNING over other flags", () => {
    expect(
      getRunStatusKey({
        ...base,
        isRunning: true,
        hasErrored: true,
        stoppedAt: new Date(),
      } as Run),
    ).toBe("RUNNING");
  });

  it("prioritizes STOPPED over FAILED and COMPLETE", () => {
    expect(
      getRunStatusKey({
        ...base,
        stoppedAt: new Date(),
        hasErrored: true,
        isComplete: true,
      } as Run),
    ).toBe("STOPPED");
  });
});
