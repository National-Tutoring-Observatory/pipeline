import { beforeEach, describe, expect, it, vi } from "vitest";
import aiGatewayConfig from "~/config/ai_gateway.json";
import { ProjectService } from "~/modules/projects/project";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { SessionService } from "~/modules/sessions/session";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import createCollectionWithRuns from "../services/createCollectionWithRuns.server";

const testModel = aiGatewayConfig.providers[0].models[0].code;

vi.mock("~/modules/runs/services/createRunAnnotations.server", () => ({
  default: vi.fn(async () => {}),
}));

describe("createCollectionWithRuns", () => {
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

  it("creates collection with runs", async () => {
    const result = await createCollectionWithRuns({
      project: projectId,
      name: "Test Collection",
      sessions,
      prompts: [{ promptId: prompt1._id, promptName: "Prompt 1", version: 1 }],
      models: [testModel],
      annotationType: "PER_UTTERANCE",
    });

    expect(result).toHaveProperty("collection");
    expect(result).toHaveProperty("errors");
    expect(result.collection.name).toBe("Test Collection");
    expect(result.collection.project).toBe(projectId);
    expect(result.collection.annotationType).toBe("PER_UTTERANCE");
    expect(Array.isArray(result.collection.runs)).toBe(true);
  });
});
