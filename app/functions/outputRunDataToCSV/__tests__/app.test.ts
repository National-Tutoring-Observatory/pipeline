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
    },
    {
      _id: `${sessionId}-u2`,
      session_id: sessionId,
      role: "Student",
      content: "Hi there",
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

describe("outputRunDataToCSV", () => {
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

  describe("PER_UTTERANCE", () => {
    it("preserves original session_id from transcript data", async () => {
      const run = makeRun({ annotationType: "PER_UTTERANCE" });

      const transcripts = [
        makeTranscript("ORIGINAL_S1", { utteranceAnnotations: true }),
        makeTranscript("ORIGINAL_S2", { utteranceAnnotations: true }),
      ];
      let callIndex = 0;
      vi.mocked(fse.readJSON).mockImplementation(
        async () => transcripts[callIndex++],
      );

      await handler({
        body: {
          run: run as any,
          inputFolder: "storage/proj1/runs/run1",
          outputFolder: "storage/proj1/runs/run1/exports",
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
      expect(lines[1].split(",")[sessionIdIndex]).toBe("ORIGINAL_S1");
      expect(lines[3].split(",")[sessionIdIndex]).toBe("ORIGINAL_S2");
    });

    it("includes annotation columns", async () => {
      const run = makeRun({ annotationType: "PER_UTTERANCE" });

      const transcripts = [
        makeTranscript("S1", { utteranceAnnotations: true }),
        makeTranscript("S2", { utteranceAnnotations: true }),
      ];
      let callIndex = 0;
      vi.mocked(fse.readJSON).mockImplementation(
        async () => transcripts[callIndex++],
      );

      await handler({
        body: {
          run: run as any,
          inputFolder: "storage/proj1/runs/run1",
          outputFolder: "storage/proj1/runs/run1/exports",
        },
      });

      const csvPath = Object.keys(capturedCsvFiles).find((p) =>
        p.includes("utterances.csv"),
      );
      const csv = capturedCsvFiles[csvPath!];
      const headers = csv.split("\n")[0].split(",");

      expect(headers).toContain("score-0");
      expect(headers).toContain("label-0");
    });
  });

  describe("PER_SESSION", () => {
    it("includes _id and session_id columns in sessions CSV", async () => {
      const run = makeRun({ annotationType: "PER_SESSION" });

      const transcripts = [
        makeTranscript("S1", { sessionAnnotations: true }),
        makeTranscript("S2", { sessionAnnotations: true }),
      ];
      let callIndex = 0;
      vi.mocked(fse.readJSON).mockImplementation(
        async () => transcripts[callIndex++],
      );

      await handler({
        body: {
          run: run as any,
          inputFolder: "storage/proj1/runs/run1",
          outputFolder: "storage/proj1/runs/run1/exports",
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
      expect(lines[1].split(",")[sessionIdIndex]).toBe("S1");
      expect(lines[2].split(",")[sessionIdIndex]).toBe("S2");
    });

    it("includes annotation columns", async () => {
      const run = makeRun({ annotationType: "PER_SESSION" });

      const transcripts = [
        makeTranscript("S1", { sessionAnnotations: true }),
        makeTranscript("S2", { sessionAnnotations: true }),
      ];
      let callIndex = 0;
      vi.mocked(fse.readJSON).mockImplementation(
        async () => transcripts[callIndex++],
      );

      await handler({
        body: {
          run: run as any,
          inputFolder: "storage/proj1/runs/run1",
          outputFolder: "storage/proj1/runs/run1/exports",
        },
      });

      const csvPath = Object.keys(capturedCsvFiles).find((p) =>
        p.includes("sessions.csv"),
      );
      const csv = capturedCsvFiles[csvPath!];
      const headers = csv.split("\n")[0].split(",");

      expect(headers).toContain("quality-0");
      expect(headers).toContain("rating-0");
    });
  });

  it("always generates meta CSV", async () => {
    const run = makeRun({ annotationType: "PER_SESSION" });

    const transcripts = [
      makeTranscript("S1", { sessionAnnotations: true }),
      makeTranscript("S2", { sessionAnnotations: true }),
    ];
    let callIndex = 0;
    vi.mocked(fse.readJSON).mockImplementation(
      async () => transcripts[callIndex++],
    );

    await handler({
      body: {
        run: run as any,
        inputFolder: "storage/proj1/runs/run1",
        outputFolder: "storage/proj1/runs/run1/exports",
      },
    });

    const csvPath = Object.keys(capturedCsvFiles).find((p) =>
      p.includes("meta.csv"),
    );
    expect(csvPath).toBeDefined();

    const csv = capturedCsvFiles[csvPath!];
    const headers = csv.split("\n")[0].split(",");
    expect(headers).toContain("_id");
    expect(headers).toContain("name");
    expect(headers).toContain("annotationType");
  });
});
