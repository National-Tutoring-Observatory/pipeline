import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../../test/helpers/clearDocumentDB";
import createTestRun from "../../../../../test/helpers/createTestRun";
import type { RunSession } from "../../runs.types";
import aggregateProgress from "../aggregateProgress.server";

const projectId = new Types.ObjectId().toString();
const sessionId = () => new Types.ObjectId().toString();

const buildSessions = (statuses: RunSession["status"][]) =>
  statuses.map((status) => ({
    sessionId: sessionId(),
    name: `Session ${status}`,
    status,
    fileType: "txt",
    startedAt: new Date(),
    finishedAt: new Date(),
  }));

describe("aggregateProgress", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("returns zeros for empty run list", async () => {
    const result = await aggregateProgress([]);
    expect(result).toEqual({
      completedRuns: 0,
      erroredRuns: 0,
      totalSessions: 0,
      completedSessions: 0,
      processing: 0,
      startedAt: null,
    });
  });

  it("counts sessions by status across runs", async () => {
    const run1 = await createTestRun({
      name: "Run 1",
      project: projectId as any,
      sessions: buildSessions(["DONE", "DONE", "NOT_STARTED"]),
    });
    const run2 = await createTestRun({
      name: "Run 2",
      project: projectId as any,
      sessions: buildSessions(["RUNNING", "NOT_STARTED"]),
    });

    const result = await aggregateProgress([run1._id, run2._id]);

    expect(result.totalSessions).toBe(5);
    expect(result.completedSessions).toBe(2);
  });

  it("counts ERRORED and STOPPED as completed", async () => {
    const run = await createTestRun({
      name: "Run",
      project: projectId as any,
      sessions: buildSessions(["DONE", "ERRORED", "STOPPED", "NOT_STARTED"]),
    });

    const result = await aggregateProgress([run._id]);

    expect(result.completedSessions).toBe(3);
    expect(result.totalSessions).toBe(4);
  });

  it("counts completed and processing runs", async () => {
    const run1 = await createTestRun({
      name: "Complete",
      project: projectId as any,
      isComplete: true,
      isRunning: false,
      sessions: buildSessions(["DONE"]),
    });
    const run2 = await createTestRun({
      name: "Running",
      project: projectId as any,
      isComplete: false,
      isRunning: true,
      sessions: buildSessions(["RUNNING"]),
    });
    const run3 = await createTestRun({
      name: "Queued",
      project: projectId as any,
      isComplete: false,
      isRunning: false,
      sessions: buildSessions(["NOT_STARTED"]),
    });

    const result = await aggregateProgress([run1._id, run2._id, run3._id]);

    expect(result.completedRuns).toBe(1);
    expect(result.processing).toBe(2);
  });

  it("counts runs with hasErrored set", async () => {
    const run1 = await createTestRun({
      name: "Errored",
      project: projectId as any,
      isComplete: true,
      hasErrored: true,
      sessions: buildSessions(["DONE"]),
    });
    const run2 = await createTestRun({
      name: "Clean",
      project: projectId as any,
      isComplete: true,
      hasErrored: false,
      sessions: buildSessions(["DONE"]),
    });

    const result = await aggregateProgress([run1._id, run2._id]);

    expect(result.erroredRuns).toBe(1);
    expect(result.completedRuns).toBe(2);
  });

  it("returns the earliest startedAt", async () => {
    const early = new Date("2025-01-01");
    const late = new Date("2025-06-01");

    const run1 = await createTestRun({
      name: "Late",
      project: projectId as any,
      startedAt: late,
      sessions: [],
    });
    const run2 = await createTestRun({
      name: "Early",
      project: projectId as any,
      startedAt: early,
      sessions: [],
    });

    const result = await aggregateProgress([run1._id, run2._id]);

    expect(result.startedAt).toBe(String(early));
  });

  it("returns null startedAt when no runs have started", async () => {
    const run = await createTestRun({
      name: "Not started",
      project: projectId as any,
      sessions: buildSessions(["NOT_STARTED"]),
    });

    const result = await aggregateProgress([run._id]);

    expect(result.startedAt).toBeNull();
  });
});
