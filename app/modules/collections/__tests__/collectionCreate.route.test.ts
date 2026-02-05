import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import aiGatewayConfig from "~/config/ai_gateway.json";
import { CollectionService } from "~/modules/collections/collection";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import { ProjectService } from "~/modules/projects/project";
import type { Project } from "~/modules/projects/projects.types";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import type { Prompt } from "~/modules/prompts/prompts.types";
import { SessionService } from "~/modules/sessions/session";
import type { Session } from "~/modules/sessions/sessions.types";
import { TeamService } from "~/modules/teams/team";
import type { Team } from "~/modules/teams/teams.types";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action, loader } from "../containers/collectionCreate.route";

const testModel = aiGatewayConfig.providers[0].models[0].code;

vi.mock("~/modules/runs/services/createRunAnnotations.server", () => ({
  default: vi.fn(async () => {}),
}));

describe("collectionCreate.route", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let session: Session;
  let prompt: Prompt;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    await FeatureFlagService.create({ name: "HAS_PROJECT_COLLECTIONS" });
    user = await UserService.create({
      username: "test_user",
      teams: [],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
    });
    team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    session = await SessionService.create({
      name: "Test Session",
      project: project._id,
    });
    prompt = await PromptService.create({
      name: "Test Prompt",
      annotationType: "PER_UTTERANCE",
    });
    await PromptVersionService.create({
      prompt: prompt._id,
      version: 1,
      userPrompt: "Test prompt content",
      annotationSchema: [],
    });

    cookieHeader = await loginUser(user._id);
  });

  describe("loader", () => {
    it("redirects to / when there is no session", async () => {
      const res = await loader({
        request: new Request("http://localhost/"),
        params: { projectId: project._id },
        unstable_pattern: "",
        context: {},
      } as any);

      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });

    it("redirects to / when project not found", async () => {
      const fakeId = new Types.ObjectId().toString();
      const res = await loader({
        request: new Request("http://localhost/", {
          headers: { cookie: cookieHeader },
        }),
        params: { projectId: fakeId },
        unstable_pattern: "",
        context: {},
      } as any);

      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });

    it("redirects to / when user cannot view project", async () => {
      const otherUser = await UserService.create({
        username: "other_user",
        teams: [],
      });
      const otherCookie = await loginUser(otherUser._id);

      const res = await loader({
        request: new Request("http://localhost/", {
          headers: { cookie: otherCookie },
        }),
        params: { projectId: project._id },
        unstable_pattern: "",
        context: {},
      } as any);

      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });

    it("returns project for authenticated user with view access", async () => {
      const res = await loader({
        request: new Request("http://localhost/", {
          headers: { cookie: cookieHeader },
        }),
        params: { projectId: project._id },
        unstable_pattern: "",
        context: {},
      } as any);

      expect(res).not.toBeInstanceOf(Response);
      const data = res as { project: Project };
      expect(data.project._id).toBe(project._id);
      expect(data.project.name).toBe("Test Project");
    });
  });

  describe("action - CREATE_COLLECTION", () => {
    it("successfully creates collection", async () => {
      const body = JSON.stringify({
        intent: "CREATE_COLLECTION",
        payload: {
          name: "Test Collection",
          annotationType: "PER_UTTERANCE",
          prompts: [
            { promptId: prompt._id, promptName: "Prompt 1", version: 1 },
          ],
          models: [testModel],
          sessions: [session._id],
        },
      });

      const res = await action({
        request: new Request("http://localhost/", {
          method: "POST",
          headers: { cookie: cookieHeader },
          body,
        }),
        params: { projectId: project._id },
        context: {},
      } as any);

      expect(res).not.toBeInstanceOf(Response);
      const result = res as {
        intent: string;
        data: { collectionId: string; projectId: string; errors: string[] };
      };
      expect(result.intent).toBe("CREATE_COLLECTION");
      expect(result.data.collectionId).toBeDefined();
      expect(result.data.projectId).toBe(project._id);

      const collection = await CollectionService.findById(
        result.data.collectionId,
      );
      expect(collection?.name).toBe("Test Collection");
      expect(collection?.sessions).toEqual([session._id]);
    });

    it("returns unauthenticated when no user session", async () => {
      const body = JSON.stringify({
        intent: "CREATE_COLLECTION",
        payload: {
          name: "Test Collection",
          annotationType: "PER_UTTERANCE",
          prompts: [{ promptId: prompt._id, version: 1 }],
          models: [testModel],
          sessions: [session._id],
        },
      });

      const res = await action({
        request: new Request("http://localhost/", {
          method: "POST",
          body,
        }),
        params: { projectId: project._id },
        context: {},
      } as any);

      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });
  });
});
