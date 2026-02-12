import { describe, expect, it } from "vitest";
import type { RunSession } from "~/modules/runs/runs.types";
import paginateSessions from "../paginateSessions.server";

const createSession = (
  index: number,
  overrides: Partial<RunSession> = {},
): RunSession => ({
  sessionId: `session-${index}`,
  name: `Session ${String(index).padStart(3, "0")}`,
  status: "DONE",
  fileType: "txt",
  startedAt: new Date("2025-01-01"),
  finishedAt: new Date("2025-01-02"),
  ...overrides,
});

const buildSessions = (count: number) =>
  Array.from({ length: count }, (_, i) => createSession(i + 1));

describe("paginateSessions", () => {
  it("returns all sessions when under page size", () => {
    const sessions = buildSessions(5);
    const result = paginateSessions(sessions);

    expect(result.data).toHaveLength(5);
    expect(result.count).toBe(5);
    expect(result.totalPages).toBe(1);
  });

  it("paginates with default page size of 20", () => {
    const sessions = buildSessions(50);
    const result = paginateSessions(sessions, { page: 1 });

    expect(result.data).toHaveLength(20);
    expect(result.count).toBe(50);
    expect(result.totalPages).toBe(3);
  });

  it("returns the correct page", () => {
    const sessions = buildSessions(50);
    const result = paginateSessions(sessions, { page: 3 });

    expect(result.data).toHaveLength(10);
    expect(result.data[0].sessionId).toBe("session-41");
  });

  it("filters by search value", () => {
    const sessions = [
      createSession(1, { name: "Alpha session" }),
      createSession(2, { name: "Beta session" }),
      createSession(3, { name: "Alpha run" }),
    ];
    const result = paginateSessions(sessions, { searchValue: "alpha" });

    expect(result.data).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it("filters by status", () => {
    const sessions = [
      createSession(1, { status: "DONE" }),
      createSession(2, { status: "RUNNING" }),
      createSession(3, { status: "ERRORED" }),
      createSession(4, { status: "NOT_STARTED" }),
      createSession(5, { status: "DONE" }),
    ];
    const result = paginateSessions(sessions, {
      filters: { status: "DONE" },
    });

    expect(result.data).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it("sorts ascending by default", () => {
    const sessions = [
      createSession(1, { name: "Charlie" }),
      createSession(2, { name: "Alpha" }),
      createSession(3, { name: "Bravo" }),
    ];
    const result = paginateSessions(sessions, { sort: "name" });

    expect(result.data.map((s) => s.name)).toEqual([
      "Alpha",
      "Bravo",
      "Charlie",
    ]);
  });

  it("sorts descending with - prefix", () => {
    const sessions = [
      createSession(1, { name: "Charlie" }),
      createSession(2, { name: "Alpha" }),
      createSession(3, { name: "Bravo" }),
    ];
    const result = paginateSessions(sessions, { sort: "-name" });

    expect(result.data.map((s) => s.name)).toEqual([
      "Charlie",
      "Bravo",
      "Alpha",
    ]);
  });

  it("combines search, filter, and pagination", () => {
    const sessions = Array.from({ length: 40 }, (_, i) =>
      createSession(i + 1, {
        name: `Session ${i % 2 === 0 ? "Alpha" : "Beta"} ${i + 1}`,
        status: i % 3 === 0 ? "ERRORED" : "DONE",
      }),
    );
    const result = paginateSessions(sessions, {
      searchValue: "Alpha",
      filters: { status: "DONE" },
      page: 1,
    });

    expect(result.data.every((s) => s.name.includes("Alpha"))).toBe(true);
    expect(result.data.every((s) => s.status === "DONE")).toBe(true);
    expect(result.count).toBeLessThan(40);
  });

  it("returns empty result for no matches", () => {
    const sessions = buildSessions(5);
    const result = paginateSessions(sessions, { searchValue: "nonexistent" });

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
