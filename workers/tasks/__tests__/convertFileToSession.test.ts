import { ProjectService } from "app/modules/projects/project";
import { SessionService } from "app/modules/sessions/session";
import { TeamService } from "app/modules/teams/team";
import type { Job } from "bullmq";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import convertFileToSession from "../convertFileToSession";

vi.mock("../../helpers/emitFromJob");
vi.mock("app/modules/storage/helpers/getStorageAdapter", () => ({
  default: () => ({
    download: vi.fn().mockResolvedValue("/tmp/test-file.json"),
    upload: vi.fn().mockResolvedValue(undefined),
  }),
}));
vi.mock("fs-extra", () => ({
  default: {
    readJSON: vi.fn(),
    outputJSON: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(Buffer.from("")),
  },
}));

const standardMapping = {
  role: "role",
  content: "content",
  session_id: "session_id",
  sequence_id: "sequence_id",
  leadRole: "Tutor",
};

const validJsonFile = [
  { role: "Tutor", content: "Hello", session_id: "s1", sequence_id: 1 },
  { role: "Student", content: "Hi", session_id: "s1", sequence_id: 2 },
];

async function makeJob(
  sessionId: string,
  projectId: string,
  jsonFile: any[],
  attributesMapping = standardMapping,
) {
  const fse = await import("fs-extra");
  vi.mocked(fse.default.readJSON).mockResolvedValue(jsonFile);

  return {
    id: "job-1",
    data: {
      projectId,
      sessionId,
      inputFile: "uploads/test-file.json",
      outputFolder: "output",
      attributesMapping,
    },
  } as any as Job;
}

describe("convertFileToSession worker", () => {
  let projectId: string;
  let sessionId: string;

  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();

    const team = await TeamService.create({ name: "Test Team" });
    const project = await ProjectService.create({
      name: "Test Project",
      team: team._id,
      createdBy: new Types.ObjectId().toString(),
    });
    projectId = project._id;

    const session = await SessionService.create({
      name: "test-file.json",
      project: projectId,
      hasConverted: false,
      hasErrored: false,
    });
    sessionId = session._id;
  });

  it("marks session as converted on a valid transcript", async () => {
    const job = await makeJob(sessionId, projectId, validJsonFile);

    await convertFileToSession(job);

    const session = await SessionService.findById(sessionId);
    expect(session?.hasConverted).toBe(true);
    expect(session?.hasErrored).toBe(false);
  });

  it("uses attributesMapping to read session_id from non-standard column name", async () => {
    const jsonFile = [
      { role: "Tutor", content: "Hello", sid: "s42", sequence_id: 1 },
      { role: "Student", content: "Hi", sid: "s42", sequence_id: 2 },
    ];
    const job = await makeJob(sessionId, projectId, jsonFile, {
      ...standardMapping,
      session_id: "sid",
    });

    await convertFileToSession(job);

    const session = await SessionService.findById(sessionId);
    expect(session?.hasConverted).toBe(true);
    expect(session?.hasErrored).toBe(false);
  });

  it("marks session as errored when an utterance is missing role", async () => {
    const jsonFile = [
      { content: "Hello", session_id: "s1", sequence_id: 1 },
      { role: "Student", content: "Hi", session_id: "s1", sequence_id: 2 },
    ];
    const job = await makeJob(sessionId, projectId, jsonFile);

    await convertFileToSession(job);

    const session = await SessionService.findById(sessionId);
    expect(session?.hasErrored).toBe(true);
    expect(session?.hasConverted).toBe(false);
    expect(session?.error).toMatch(/role/i);
  });

  it("marks session as errored when an utterance is missing content", async () => {
    const jsonFile = [
      { role: "Tutor", session_id: "s1", sequence_id: 1 },
      { role: "Student", content: "Hi", session_id: "s1", sequence_id: 2 },
    ];
    const job = await makeJob(sessionId, projectId, jsonFile);

    await convertFileToSession(job);

    const session = await SessionService.findById(sessionId);
    expect(session?.hasErrored).toBe(true);
    expect(session?.hasConverted).toBe(false);
    expect(session?.error).toMatch(/content/i);
  });

  it("marks session as errored when attributesMapping does not match file columns", async () => {
    const jsonFile = [
      { speaker: "Tutor", text: "Hello", session_id: "s1", sequence_id: 1 },
    ];
    const job = await makeJob(sessionId, projectId, jsonFile);

    await convertFileToSession(job);

    const session = await SessionService.findById(sessionId);
    expect(session?.hasErrored).toBe(true);
    expect(session?.hasConverted).toBe(false);
  });

  it("marks session as errored when attributesMapping is incomplete", async () => {
    const job = await makeJob(sessionId, projectId, validJsonFile, {
      ...standardMapping,
      role: "",
    });

    await convertFileToSession(job);

    const session = await SessionService.findById(sessionId);
    expect(session?.hasErrored).toBe(true);
    expect(session?.hasConverted).toBe(false);
  });
});
