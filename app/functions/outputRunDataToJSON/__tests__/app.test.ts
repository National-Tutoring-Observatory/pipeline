import fse from "fs-extra";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "../app";

vi.mock("fs-extra", () => ({
  default: {
    readJSON: vi.fn(),
    outputFile: vi.fn(),
    readFile: vi.fn().mockResolvedValue(Buffer.from("")),
  },
}));

vi.mock("~/modules/storage/helpers/getStorageAdapter", () => ({
  default: () => ({
    download: vi.fn().mockResolvedValue("/tmp/fake-path.json"),
    upload: vi.fn().mockResolvedValue(undefined),
  }),
}));

const makeRun = (overrides: Record<string, any> = {}) => ({
  _id: "run1",
  project: "proj1",
  name: "Test Run",
  annotationType: "PER_UTTERANCE",
  prompt: "prompt1",
  promptVersion: 1,
  sessions: [
    { sessionId: "session-abc", name: "session-abc.json" },
    { sessionId: "session-def", name: "session-def.json" },
  ],
  snapshot: {
    prompt: {
      name: "Test Prompt",
      userPrompt: "Annotate this",
      annotationType: "PER_UTTERANCE",
      annotationSchema: [],
      version: 1,
    },
    model: { code: "gpt-4", name: "GPT-4", provider: "openai" },
  },
  ...overrides,
});

const makeTranscript = (sessionId: string) => ({
  transcript: [
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
  ],
  annotations: [{ _id: sessionId, quality: "high" }],
});

describe("outputRunDataToJSON", () => {
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
    const run = makeRun();

    let callIndex = 0;
    vi.mocked(fse.readJSON).mockImplementation(async () => {
      const sessionId = run.sessions[callIndex].sessionId;
      callIndex++;
      return makeTranscript(sessionId);
    });

    await handler({
      body: {
        run: run as any,
        teamId: "team1",
        inputFolder: "storage/proj1/runs/run1",
        outputFolder: "storage/proj1/runs/run1/exports",
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

  it("generates meta JSONL with run info", async () => {
    const run = makeRun();

    let callIndex = 0;
    vi.mocked(fse.readJSON).mockImplementation(async () => {
      const sessionId = run.sessions[callIndex].sessionId;
      callIndex++;
      return makeTranscript(sessionId);
    });

    await handler({
      body: {
        run: run as any,
        teamId: "team1",
        inputFolder: "storage/proj1/runs/run1",
        outputFolder: "storage/proj1/runs/run1/exports",
      },
    });

    const metaPath = Object.keys(capturedFiles).find((p) =>
      p.includes("meta.jsonl"),
    );
    expect(metaPath).toBeDefined();

    const meta = JSON.parse(capturedFiles[metaPath!]);
    expect(meta.runId).toBe("run1");
    expect(meta.runName).toBe("Test Run");
    expect(meta.promptName).toBe("Test Prompt");
  });
});
