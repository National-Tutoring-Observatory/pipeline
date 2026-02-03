import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { CollectionService } from "../collection";
import createRunsForCollection from "../services/createRunsForCollection.server";

vi.mock("~/modules/runs/helpers/buildRunSessions.server", () => ({
  default: vi.fn(async (sessionIds: string[]) =>
    sessionIds.map((id) => ({
      sessionId: id,
      name: "Mock Session",
      fileType: "",
      status: "RUNNING",
      startedAt: new Date(),
      finishedAt: new Date(),
    })),
  ),
}));

vi.mock("~/modules/runs/services/buildRunSnapshot.server", () => ({
  default: vi.fn(async ({ promptId, promptVersionNumber, modelCode }: any) => ({
    prompt: {
      name: "Mock Prompt",
      userPrompt: "Mock",
      annotationSchema: [],
      annotationType: "PER_UTTERANCE",
      version: promptVersionNumber,
    },
    model: { code: modelCode, provider: "openai", name: modelCode },
  })),
  buildRunSnapshot: vi.fn(),
}));

vi.mock("~/modules/projects/services/createRunAnnotations.server", () => ({
  default: vi.fn(async () => {}),
}));

describe("createRunsForCollection", () => {
  let projectId: string;
  let sessions: string[];
  let prompt1: any;
  let collectionId: string;

  beforeEach(async () => {
    await clearDocumentDB();

    const team = await TeamService.create({ name: "Test Team" });
    const user = await UserService.create({
      username: "test_user",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    projectId = project._id;

    const session1 = await SessionService.create({
      name: "Session 1",
      project: projectId,
    });
    const session2 = await SessionService.create({
      name: "Session 2",
      project: projectId,
    });
    sessions = [session1._id, session2._id];

    prompt1 = await PromptService.create({
      name: "Prompt 1",
      annotationType: "PER_UTTERANCE",
    });
    await PromptVersionService.create({
      prompt: prompt1._id,
      version: 1,
      userPrompt: "Test prompt 1",
      annotationSchema: [],
    });

    const collection = await CollectionService.create({
      name: "Test Collection",
      project: projectId,
      sessions,
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    collectionId = collection._id;
  });

  it("returns null collection when collection not found", async () => {
    const result = await createRunsForCollection({
      collectionId: "000000000000000000000000",
      prompts: [{ promptId: prompt1._id, promptName: "Prompt 1", version: 1 }],
      models: ["gpt-4"],
    });

    expect(result.collection).toBeNull();
    expect(result.errors).toContain("Collection not found");
    expect(result.createdRunIds).toEqual([]);
  });

  it("creates runs for new prompt/model combinations", async () => {
    const result = await createRunsForCollection({
      collectionId,
      prompts: [{ promptId: prompt1._id, promptName: "Prompt 1", version: 1 }],
      models: ["gpt-4"],
    });

    expect(result.collection).not.toBeNull();
    expect(result.createdRunIds).toHaveLength(1);
    expect(result.errors).toEqual([]);

    const updatedCollection = await CollectionService.findById(collectionId);
    expect(updatedCollection!.runs).toContain(result.createdRunIds[0]);
  });

  it("skips duplicate prompt/model combinations", async () => {
    const existingRun = await RunService.create({
      project: projectId,
      name: "Existing Run",
      sessions,
      annotationType: "PER_UTTERANCE",
      prompt: prompt1._id,
      promptVersion: 1,
      modelCode: "gpt-4",
    });

    await CollectionService.updateById(collectionId, {
      runs: [existingRun._id],
    });

    const result = await createRunsForCollection({
      collectionId,
      prompts: [{ promptId: prompt1._id, promptName: "Prompt 1", version: 1 }],
      models: ["gpt-4"],
    });

    expect(result.collection).not.toBeNull();
    expect(result.createdRunIds).toEqual([]);
  });

  it("creates only new combinations when mix of new and duplicate", async () => {
    const existingRun = await RunService.create({
      project: projectId,
      name: "Existing Run",
      sessions,
      annotationType: "PER_UTTERANCE",
      prompt: prompt1._id,
      promptVersion: 1,
      modelCode: "gpt-4",
    });

    await CollectionService.updateById(collectionId, {
      runs: [existingRun._id],
    });

    const result = await createRunsForCollection({
      collectionId,
      prompts: [{ promptId: prompt1._id, promptName: "Prompt 1", version: 1 }],
      models: ["gpt-4", "gpt-3.5-turbo"],
    });

    expect(result.collection).not.toBeNull();
    expect(result.createdRunIds).toHaveLength(1);

    const updatedCollection = await CollectionService.findById(collectionId);
    expect(updatedCollection!.runs).toContain(existingRun._id);
    expect(updatedCollection!.runs).toContain(result.createdRunIds[0]);
  });

  it("adds created run IDs to collection", async () => {
    const result = await createRunsForCollection({
      collectionId,
      prompts: [{ promptId: prompt1._id, promptName: "Prompt 1", version: 1 }],
      models: ["gpt-4", "gpt-3.5-turbo"],
    });

    expect(result.createdRunIds).toHaveLength(2);

    const updatedCollection = await CollectionService.findById(collectionId);
    for (const runId of result.createdRunIds) {
      expect(updatedCollection!.runs).toContain(runId);
    }
  });

  it("resets hasExportedCSV and hasExportedJSONL flags", async () => {
    await CollectionService.updateById(collectionId, {
      hasExportedCSV: true,
      hasExportedJSONL: true,
    });

    await createRunsForCollection({
      collectionId,
      prompts: [{ promptId: prompt1._id, promptName: "Prompt 1", version: 1 }],
      models: ["gpt-4"],
    });

    const updatedCollection = await CollectionService.findById(collectionId);
    expect(updatedCollection!.hasExportedCSV).toBe(false);
    expect(updatedCollection!.hasExportedJSONL).toBe(false);
  });
});
