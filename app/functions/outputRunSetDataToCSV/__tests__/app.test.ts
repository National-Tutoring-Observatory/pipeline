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
  annotationType: "PER_UTTERANCE",
  prompt: `prompt${index}`,
  promptVersion: 1,
  sessions: [
    { sessionId: "mongo-id-abc", name: "session-abc.json" },
    { sessionId: "mongo-id-def", name: "session-def.json" },
  ],
  snapshot: {
    prompt: {
      name: "Test Prompt",
      userPrompt: "Annotate this",
      annotationType: "PER_UTTERANCE",
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
  annotationType: "PER_UTTERANCE",
  runs: ["run1", "run2"],
  sessions: [],
  ...overrides,
});

const makeTranscript = (
  sessionId: string,
  opts: { utteranceAnnotations?: boolean; sessionAnnotations?: boolean } = {},
) => {
  const transcript: any[] = [
    {
      _id: `${sessionId}-u1`,
      session_id: sessionId,
      role: "Tutor",
      content: "Hello",
      sequence_id: "1",
    },
    {
      _id: `${sessionId}-u2`,
      session_id: sessionId,
      role: "Student",
      content: "Hi there",
      sequence_id: "2",
    },
  ];

  if (opts.utteranceAnnotations) {
    transcript[0].annotations = [
      { _id: `${sessionId}-u1`, score: 5, label: "greeting" },
    ];
    transcript[1].annotations = [
      { _id: `${sessionId}-u2`, score: 3, label: "response" },
    ];
  }

  const result: any = { transcript };

  if (opts.sessionAnnotations) {
    result.annotations = [{ _id: sessionId, quality: "high", rating: 4 }];
  }

  return result;
};

describe("outputRunSetDataToCSV", () => {
  let capturedCsvFiles: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCsvFiles = {};

    vi.mocked(fse.outputFile).mockImplementation(
      async (path: any, content: any) => {
        capturedCsvFiles[path] = content;
      },
    );
  });

  function setupTranscripts(
    runs: ReturnType<typeof makeRun>[],
    opts: { utteranceAnnotations?: boolean; sessionAnnotations?: boolean },
  ) {
    const sessionIds: Record<string, string> = {
      "mongo-id-abc": "ORIGINAL_S1",
      "mongo-id-def": "ORIGINAL_S2",
    };

    let callIndex = 0;
    const sessionOrder = runs.flatMap((r) =>
      r.sessions.map((s) => s.sessionId),
    );

    vi.mocked(fse.readJSON).mockImplementation(async () => {
      const mongoId = sessionOrder[callIndex++];
      return makeTranscript(sessionIds[mongoId], opts);
    });
  }

  describe("PER_UTTERANCE", () => {
    it("preserves original session_id from transcript data", async () => {
      const runs = [makeRun(1), makeRun(2)];
      const runSet = makeRunSet({ annotationType: "PER_UTTERANCE" });
      setupTranscripts(runs, { utteranceAnnotations: true });

      await handler({
        body: {
          runSet: runSet as any,
          runs: runs as any,
          inputFolder: "storage/proj1/runs",
          outputFolder: "storage/proj1/run-sets/runset1/exports",
        },
      });

      const csvPath = Object.keys(capturedCsvFiles).find((p) =>
        p.includes("utterances.csv"),
      );
      const csv = capturedCsvFiles[csvPath!];
      const lines = csv.split("\n");
      const headers = lines[0].split(",");
      const sessionIdIndex = headers.indexOf("session_id");

      expect(headers).toContain("session_id");
      expect(headers).toContain("sequence_id");
      expect(lines[1].split(",")[sessionIdIndex]).toBe("ORIGINAL_S1");
      expect(lines[3].split(",")[sessionIdIndex]).toBe("ORIGINAL_S2");
    });

    it("includes annotation and metadata columns from multiple runs", async () => {
      const runs = [makeRun(1), makeRun(2)];
      const runSet = makeRunSet({ annotationType: "PER_UTTERANCE" });
      setupTranscripts(runs, { utteranceAnnotations: true });

      await handler({
        body: {
          runSet: runSet as any,
          runs: runs as any,
          inputFolder: "storage/proj1/runs",
          outputFolder: "storage/proj1/run-sets/runset1/exports",
        },
      });

      const csvPath = Object.keys(capturedCsvFiles).find((p) =>
        p.includes("utterances.csv"),
      );
      const csv = capturedCsvFiles[csvPath!];
      const headers = csv.split("\n")[0].split(",");

      expect(headers).toContain("score-1");
      expect(headers).toContain("label-1");
      expect(headers).toContain("model-0");
      expect(headers).toContain("model-1");
    });

    it("does not include _sessionRef in CSV output", async () => {
      const runs = [makeRun(1), makeRun(2)];
      const runSet = makeRunSet({ annotationType: "PER_UTTERANCE" });
      setupTranscripts(runs, { utteranceAnnotations: true });

      await handler({
        body: {
          runSet: runSet as any,
          runs: runs as any,
          inputFolder: "storage/proj1/runs",
          outputFolder: "storage/proj1/run-sets/runset1/exports",
        },
      });

      const csvPath = Object.keys(capturedCsvFiles).find((p) =>
        p.includes("utterances.csv"),
      );
      const csv = capturedCsvFiles[csvPath!];
      const headers = csv.split("\n")[0].split(",");

      expect(headers).not.toContain("_sessionRef");
    });
  });

  describe("PER_SESSION", () => {
    it("includes _id and session_id columns in sessions CSV", async () => {
      const runs = [
        makeRun(1, { annotationType: "PER_SESSION" }),
        makeRun(2, { annotationType: "PER_SESSION" }),
      ];
      const runSet = makeRunSet({ annotationType: "PER_SESSION" });
      setupTranscripts(runs, { sessionAnnotations: true });

      await handler({
        body: {
          runSet: runSet as any,
          runs: runs as any,
          inputFolder: "storage/proj1/runs",
          outputFolder: "storage/proj1/run-sets/runset1/exports",
        },
      });

      const csvPath = Object.keys(capturedCsvFiles).find((p) =>
        p.includes("sessions.csv"),
      );
      expect(csvPath).toBeDefined();

      const csv = capturedCsvFiles[csvPath!];
      const lines = csv.split("\n");
      const headers = lines[0].split(",");

      expect(headers).toContain("_id");
      expect(headers).toContain("session_id");

      const idIndex = headers.indexOf("_id");
      expect(lines[1].split(",")[idIndex]).toBe("mongo-id-abc");
      expect(lines[2].split(",")[idIndex]).toBe("mongo-id-def");

      const sessionIdIndex = headers.indexOf("session_id");
      expect(lines[1].split(",")[sessionIdIndex]).toBe("ORIGINAL_S1");
      expect(lines[2].split(",")[sessionIdIndex]).toBe("ORIGINAL_S2");
    });

    it("includes annotation and metadata columns from multiple runs", async () => {
      const runs = [
        makeRun(1, { annotationType: "PER_SESSION" }),
        makeRun(2, { annotationType: "PER_SESSION" }),
      ];
      const runSet = makeRunSet({ annotationType: "PER_SESSION" });
      setupTranscripts(runs, { sessionAnnotations: true });

      await handler({
        body: {
          runSet: runSet as any,
          runs: runs as any,
          inputFolder: "storage/proj1/runs",
          outputFolder: "storage/proj1/run-sets/runset1/exports",
        },
      });

      const csvPath = Object.keys(capturedCsvFiles).find((p) =>
        p.includes("sessions.csv"),
      );
      const csv = capturedCsvFiles[csvPath!];
      const headers = csv.split("\n")[0].split(",");

      expect(headers).toContain("quality-0");
      expect(headers).toContain("quality-1");
      expect(headers).toContain("model-0");
      expect(headers).toContain("model-1");
    });
  });

  it("always generates meta CSV with all runs", async () => {
    const runs = [makeRun(1), makeRun(2)];
    const runSet = makeRunSet({ annotationType: "PER_UTTERANCE" });
    setupTranscripts(runs, { utteranceAnnotations: true });

    await handler({
      body: {
        runSet: runSet as any,
        runs: runs as any,
        inputFolder: "storage/proj1/runs",
        outputFolder: "storage/proj1/run-sets/runset1/exports",
      },
    });

    const csvPath = Object.keys(capturedCsvFiles).find((p) =>
      p.includes("meta.csv"),
    );
    expect(csvPath).toBeDefined();

    const csv = capturedCsvFiles[csvPath!];
    const lines = csv.split("\n");
    const headers = lines[0].split(",");

    expect(headers).toContain("runId");
    expect(headers).toContain("runName");
    expect(lines).toHaveLength(3);
  });
});
