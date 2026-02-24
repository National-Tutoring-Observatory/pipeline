import { beforeEach, describe, expect, it, vi } from "vitest";
import aiGatewayConfig from "~/config/ai_gateway.json";
import { ProjectService } from "~/modules/projects/project";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { buildUsedPromptModelKey } from "../helpers/getUsedPromptModels";
import { RunSetService } from "../runSet";
import type { RunDefinition } from "../runSets.types";

const testModel1 = aiGatewayConfig.providers[0].models[0].code;
const testModel2 = aiGatewayConfig.providers[0].models[1].code;

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

describe("RunSetService.createRunsForRunSet", () => {
  let projectId: string;
  let sessions: string[];
  let prompt1: any;
  let runSetId: string;

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

    const runSet = await RunSetService.create({
      name: "Test Run Set",
      project: projectId,
      sessions,
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    runSetId = runSet._id;
  });

  it("returns null runSet when runSet not found", async () => {
    const result = await RunSetService.createRunsForRunSet({
      runSetId: "000000000000000000000000",
      definitions: [buildDefinition(prompt1._id, "Prompt 1", 1, testModel1)],
    });

    expect(result.runSet).toBeNull();
    expect(result.errors).toContain("Run set not found");
    expect(result.createdRunIds).toEqual([]);
  });

  it("creates runs from explicit definitions", async () => {
    const result = await RunSetService.createRunsForRunSet({
      runSetId,
      definitions: [buildDefinition(prompt1._id, "Prompt 1", 1, testModel1)],
    });

    expect(result.runSet).not.toBeNull();
    expect(result.createdRunIds).toHaveLength(1);
    expect(result.errors).toEqual([]);

    const updatedRunSet = await RunSetService.findById(runSetId);
    expect(updatedRunSet!.runs).toContain(result.createdRunIds[0]);
  });

  it("only creates runs for provided definitions, not full Cartesian product", async () => {
    const result = await RunSetService.createRunsForRunSet({
      runSetId,
      definitions: [buildDefinition(prompt1._id, "Prompt 1", 1, testModel1)],
    });

    expect(result.createdRunIds).toHaveLength(1);
  });

  it("skips duplicate prompt/model combinations", async () => {
    const existingRun = await RunService.create({
      project: projectId,
      name: "Existing Run",
      sessions,
      annotationType: "PER_UTTERANCE",
      prompt: prompt1._id,
      promptVersion: 1,
      modelCode: testModel1,
    });

    await RunSetService.updateById(runSetId, {
      runs: [existingRun._id],
    });

    const result = await RunSetService.createRunsForRunSet({
      runSetId,
      definitions: [buildDefinition(prompt1._id, "Prompt 1", 1, testModel1)],
    });

    expect(result.runSet).not.toBeNull();
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
      modelCode: testModel1,
    });

    await RunSetService.updateById(runSetId, {
      runs: [existingRun._id],
    });

    const result = await RunSetService.createRunsForRunSet({
      runSetId,
      definitions: [
        buildDefinition(prompt1._id, "Prompt 1", 1, testModel1),
        buildDefinition(prompt1._id, "Prompt 1", 1, testModel2),
      ],
    });

    expect(result.runSet).not.toBeNull();
    expect(result.createdRunIds).toHaveLength(1);

    const updatedRunSet = await RunSetService.findById(runSetId);
    expect(updatedRunSet!.runs).toContain(existingRun._id);
    expect(updatedRunSet!.runs).toContain(result.createdRunIds[0]);
  });

  it("adds created run IDs to runSet", async () => {
    const result = await RunSetService.createRunsForRunSet({
      runSetId,
      definitions: [
        buildDefinition(prompt1._id, "Prompt 1", 1, testModel1),
        buildDefinition(prompt1._id, "Prompt 1", 1, testModel2),
      ],
    });

    expect(result.createdRunIds).toHaveLength(2);

    const updatedRunSet = await RunSetService.findById(runSetId);
    for (const runId of result.createdRunIds) {
      expect(updatedRunSet!.runs).toContain(runId);
    }
  });

  it("resets hasExportedCSV and hasExportedJSONL flags", async () => {
    await RunSetService.updateById(runSetId, {
      hasExportedCSV: true,
      hasExportedJSONL: true,
    });

    await RunSetService.createRunsForRunSet({
      runSetId,
      definitions: [buildDefinition(prompt1._id, "Prompt 1", 1, testModel1)],
    });

    const updatedRunSet = await RunSetService.findById(runSetId);
    expect(updatedRunSet!.hasExportedCSV).toBe(false);
    expect(updatedRunSet!.hasExportedJSONL).toBe(false);
  });
});
