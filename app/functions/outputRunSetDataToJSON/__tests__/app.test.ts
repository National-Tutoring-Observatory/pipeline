import fse from "fs-extra";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "../app";

vi.mock("fs-extra", () => ({
  default: {
    readJSON: vi.fn(),
    outputFile: vi.fn(),
    readFile: vi.fn().mockResolvedValue(Buffer.from("")),
    ensureDir: vi.fn(),
  },
}));

vi.mock("~/modules/storage/helpers/getStorageAdapter", () => ({
  default: () => ({
    download: vi.fn().mockResolvedValue("/tmp/fake-path.json"),
    upload: vi.fn().mockResolvedValue(undefined),
  }),
}));

const makeRun = (index: number, overrides: Record<string, any> = {}) => ({
  _id: `run${index}`,
  project: "proj1",
  name: `Test Run ${index}`,
  annotationType: "PER_SESSION",
  prompt: `prompt${index}`,
  promptVersion: 1,
  sessions: [
    { sessionId: "session-abc", name: "session-abc.json" },
    { sessionId: "session-def", name: "session-def.json" },
  ],
  snapshot: {
    prompt: {
      name: "Test Prompt",
      userPrompt: "Annotate this",
      annotationType: "PER_SESSION",
      version: 1,
    },
    model: { code: "gpt-4", name: "GPT-4", provider: "openai" },
  },
  ...overrides,
});

const makeRunSet = (overrides: Record<string, any> = {}) => ({
  _id: "runset1",
  project: "proj1",
  name: "Test Run Set",
  annotationType: "PER_SESSION",
  runs: ["run1", "run2"],
  sessions: [],
  ...overrides,
});

const makeTranscript = (
  sessionId: string,
  opts: { utteranceAnnotations?: boolean; sessionAnnotations?: boolean } = {},
) => {
  const transcript = [
    {
      _id: `${sessionId}-u1`,
      session_id: sessionId,
      role: "Tutor",
      content: "Hello",
    },
    {
      _id: `${sessionId}-u2`,
      session_id: sessionId,
      role: "Student",
      content: "Hi there",
    },
  ];

  if (opts.utteranceAnnotations) {
    (transcript[0] as any).annotations = [{ _id: `${sessionId}-u1`, score: 5 }];
    (transcript[1] as any).annotations = [{ _id: `${sessionId}-u2`, score: 3 }];
  }

  const result: any = { transcript };

  if (opts.sessionAnnotations) {
    result.annotations = [{ _id: sessionId, quality: "high" }];
  }

  return result;
};

describe("outputRunSetDataToJSON", () => {
  let capturedFiles: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedFiles = {};

    vi.mocked(fse.outputFile).mockImplementation(
      async (path: any, content: any) => {
        capturedFiles[path] = content;
      },
    );
  });

  it("includes session ID (_id) in each JSONL session line", async () => {
    const runs = [makeRun(1), makeRun(2)];
    const runSet = makeRunSet({ annotationType: "PER_SESSION" });

    let callIndex = 0;
    const sessionOrder = runs.flatMap((r) =>
      r.sessions.map((s) => s.sessionId),
    );
    vi.mocked(fse.readJSON).mockImplementation(async () => {
      const sessionId = sessionOrder[callIndex++];
      return makeTranscript(sessionId, { sessionAnnotations: true });
    });

    await handler({
      body: {
        runSet: runSet as any,
        runs: runs as any,
        teamId: "team1",
        inputFolder: "storage/proj1/runs",
        outputFolder: "storage/proj1/run-sets/runset1/exports",
      },
    });

    const sessionsPath = Object.keys(capturedFiles).find((p) =>
      p.includes("sessions.jsonl"),
    );
    expect(sessionsPath).toBeDefined();

    const lines = capturedFiles[sessionsPath!].split("\n");
    expect(lines).toHaveLength(2);

    const session1 = JSON.parse(lines[0]);
    const session2 = JSON.parse(lines[1]);
    expect(session1._id).toBe("session-abc");
    expect(session2._id).toBe("session-def");
  });

  it("includes annotations from all runs in PER_SESSION", async () => {
    const runs = [makeRun(1), makeRun(2)];
    const runSet = makeRunSet({ annotationType: "PER_SESSION" });

    let callIndex = 0;
    const sessionOrder = runs.flatMap((r) =>
      r.sessions.map((s) => s.sessionId),
    );
    vi.mocked(fse.readJSON).mockImplementation(async () => {
      const sessionId = sessionOrder[callIndex++];
      return makeTranscript(sessionId, { sessionAnnotations: true });
    });

    await handler({
      body: {
        runSet: runSet as any,
        runs: runs as any,
        teamId: "team1",
        inputFolder: "storage/proj1/runs",
        outputFolder: "storage/proj1/run-sets/runset1/exports",
      },
    });

    const sessionsPath = Object.keys(capturedFiles).find((p) =>
      p.includes("sessions.jsonl"),
    );
    const session1 = JSON.parse(capturedFiles[sessionsPath!].split("\n")[0]);

    expect(session1.annotations).toHaveLength(2);
    expect(session1.annotations[0]._metadata.runId).toBe("run1");
    expect(session1.annotations[1]._metadata.runId).toBe("run2");
  });

  it("includes annotations from all runs in PER_UTTERANCE", async () => {
    const runs = [
      makeRun(1, { annotationType: "PER_UTTERANCE" }),
      makeRun(2, { annotationType: "PER_UTTERANCE" }),
    ];
    const runSet = makeRunSet({ annotationType: "PER_UTTERANCE" });

    let callIndex = 0;
    const sessionOrder = runs.flatMap((r) =>
      r.sessions.map((s) => s.sessionId),
    );
    vi.mocked(fse.readJSON).mockImplementation(async () => {
      const sessionId = sessionOrder[callIndex++];
      return makeTranscript(sessionId, { utteranceAnnotations: true });
    });

    await handler({
      body: {
        runSet: runSet as any,
        runs: runs as any,
        teamId: "team1",
        inputFolder: "storage/proj1/runs",
        outputFolder: "storage/proj1/run-sets/runset1/exports",
      },
    });

    const sessionsPath = Object.keys(capturedFiles).find((p) =>
      p.includes("sessions.jsonl"),
    );
    const session1 = JSON.parse(capturedFiles[sessionsPath!].split("\n")[0]);

    expect(session1.transcript[0].annotations).toHaveLength(2);
    expect(session1.transcript[0].annotations[0]._metadata.runId).toBe("run1");
    expect(session1.transcript[0].annotations[1]._metadata.runId).toBe("run2");
  });

  it("generates meta JSONL with all runs", async () => {
    const runs = [makeRun(1), makeRun(2)];
    const runSet = makeRunSet({ annotationType: "PER_SESSION" });

    let callIndex = 0;
    const sessionOrder = runs.flatMap((r) =>
      r.sessions.map((s) => s.sessionId),
    );
    vi.mocked(fse.readJSON).mockImplementation(async () => {
      const sessionId = sessionOrder[callIndex++];
      return makeTranscript(sessionId, { sessionAnnotations: true });
    });

    await handler({
      body: {
        runSet: runSet as any,
        runs: runs as any,
        teamId: "team1",
        inputFolder: "storage/proj1/runs",
        outputFolder: "storage/proj1/run-sets/runset1/exports",
      },
    });

    const metaPath = Object.keys(capturedFiles).find((p) =>
      p.includes("meta.jsonl"),
    );
    expect(metaPath).toBeDefined();

    const lines = capturedFiles[metaPath!].split("\n");
    expect(lines).toHaveLength(2);

    const meta1 = JSON.parse(lines[0]);
    const meta2 = JSON.parse(lines[1]);
    expect(meta1.runId).toBe("run1");
    expect(meta2.runId).toBe("run2");
  });
});
