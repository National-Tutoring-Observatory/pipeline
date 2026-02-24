import { beforeEach, describe, expect, it, vi } from "vitest";
import aiGatewayConfig from "~/config/ai_gateway.json";
import { ProjectService } from "~/modules/projects/project";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { SessionService } from "~/modules/sessions/session";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { buildUsedPromptModelKey } from "../helpers/getUsedPromptModels";
import { RunSetService } from "../runSet";
import type { RunDefinition } from "../runSets.types";

const testModel = aiGatewayConfig.providers[0].models[0].code;

vi.mock("~/modules/runs/services/createRunAnnotations.server", () => ({
  default: vi.fn(async () => {}),
}));

function buildDefinition(
  promptId: string,
  promptName: string,
  version: number,
  modelCode: string,
): RunDefinition {
  return {
    key: buildUsedPromptModelKey(promptId, version, modelCode),
    prompt: { promptId, promptName, version },
    modelCode,
  };
}

describe("RunSetService.createWithRuns", () => {
  let projectId: string;
  let sessions: string[];
  let prompt1: any;

  beforeEach(async () => {
    await clearDocumentDB();

    const user = await UserService.create({ username: "test_user", teams: [] });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
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
  });

  it("creates runSet with runs from explicit definitions", async () => {
    const result = await RunSetService.createWithRuns({
      project: projectId,
      name: "Test Run Set",
      sessions,
      definitions: [buildDefinition(prompt1._id, "Prompt 1", 1, testModel)],
      annotationType: "PER_UTTERANCE",
    });

    expect(result).toHaveProperty("runSet");
    expect(result).toHaveProperty("errors");
    expect(result.runSet.name).toBe("Test Run Set");
    expect(result.runSet.project).toBe(projectId);
    expect(result.runSet.annotationType).toBe("PER_UTTERANCE");
    expect(Array.isArray(result.runSet.runs)).toBe(true);
    expect(result.runSet.runs).toHaveLength(1);
  });

  it("creates only runs for provided definitions", async () => {
    const result = await RunSetService.createWithRuns({
      project: projectId,
      name: "Test Run Set",
      sessions,
      definitions: [buildDefinition(prompt1._id, "Prompt 1", 1, testModel)],
      annotationType: "PER_UTTERANCE",
    });

    expect(result.runSet.runs).toHaveLength(1);
    expect(result.errors).toEqual([]);
  });
});
