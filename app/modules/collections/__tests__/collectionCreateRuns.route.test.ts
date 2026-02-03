import { beforeEach, describe, expect, it, vi } from "vitest";
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
import { CollectionService } from "../collection";
import type { Collection } from "../collections.types";
import { action, loader } from "../containers/collectionCreateRuns.route";

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

describe("collectionCreateRuns.route", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let session: Session;
  let prompt: Prompt;
  let collection: Collection;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    await FeatureFlagService.create({ name: "HAS_PROJECT_COLLECTIONS" });
    team = await TeamService.create({ name: "Test Team" });
    user = await UserService.create({
      username: "test_user",
      teams: [{ team: team._id, role: "ADMIN" }],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
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
    collection = await CollectionService.create({
      name: "Test Collection",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    cookieHeader = await loginUser(user._id);
  });

  describe("loader", () => {
    it("redirects to / when there is no session", async () => {
      const res = await loader({
        request: new Request("http://localhost/"),
        params: { projectId: project._id, collectionId: collection._id },
      } as any);

      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });

    it("redirects to / when user cannot view project", async () => {
      const otherUser = await UserService.create({
        username: "other_user",
        teams: [],
        featureFlags: ["HAS_PROJECT_COLLECTIONS"],
      });
      const otherCookie = await loginUser(otherUser._id);

      const res = await loader({
        request: new Request("http://localhost/", {
          headers: { cookie: otherCookie },
        }),
        params: { projectId: project._id, collectionId: collection._id },
      } as any);

      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });

    it("returns collection, project, and usedPromptModels", async () => {
      const res = await loader({
        request: new Request("http://localhost/", {
          headers: { cookie: cookieHeader },
        }),
        params: { projectId: project._id, collectionId: collection._id },
      } as any);

      expect(res).not.toBeInstanceOf(Response);
      const data = res as any;
      expect(data.collection._id).toBe(collection._id);
      expect(data.project._id).toBe(project._id);
      expect(Array.isArray(data.usedPromptModels)).toBe(true);
      expect(data.usedPromptModels).toHaveLength(0);
    });
  });

  describe("action - CREATE_RUNS", () => {
    it("returns 403 when user cannot manage runs", async () => {
      const otherUser = await UserService.create({
        username: "other_user",
        teams: [],
      });
      const otherCookie = await loginUser(otherUser._id);

      const req = new Request("http://localhost/", {
        method: "POST",
        headers: { cookie: otherCookie, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_RUNS",
          payload: {
            prompts: [
              { promptId: prompt._id, promptName: "Test Prompt", version: 1 },
            ],
            models: ["gpt-4"],
          },
        }),
      });

      const resp = (await action({
        request: req,
        params: { projectId: project._id, collectionId: collection._id },
      } as any)) as any;

      expect(resp.init?.status).toBe(403);
    });

    it("returns 400 when prompts array is empty", async () => {
      const req = new Request("http://localhost/", {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_RUNS",
          payload: {
            prompts: [],
            models: ["gpt-4"],
          },
        }),
      });

      const resp = (await action({
        request: req,
        params: { projectId: project._id, collectionId: collection._id },
      } as any)) as any;

      expect(resp.init?.status).toBe(400);
    });

    it("returns 400 when models array is empty", async () => {
      const req = new Request("http://localhost/", {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_RUNS",
          payload: {
            prompts: [
              { promptId: prompt._id, promptName: "Test Prompt", version: 1 },
            ],
            models: [],
          },
        }),
      });

      const resp = (await action({
        request: req,
        params: { projectId: project._id, collectionId: collection._id },
      } as any)) as any;

      expect(resp.init?.status).toBe(400);
    });

    it("successfully creates runs and returns intent + data", async () => {
      const req = new Request("http://localhost/", {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_RUNS",
          payload: {
            prompts: [
              { promptId: prompt._id, promptName: "Test Prompt", version: 1 },
            ],
            models: ["gpt-4"],
          },
        }),
      });

      const res = await action({
        request: req,
        params: { projectId: project._id, collectionId: collection._id },
      } as any);

      expect(res).not.toBeInstanceOf(Response);
      const result = res as any;
      expect(result.intent).toBe("CREATE_RUNS");
      expect(result.data.collectionId).toBe(collection._id);
      expect(result.data.projectId).toBe(project._id);
      expect(result.data.createdCount).toBe(1);

      const updatedCollection = await CollectionService.findById(
        collection._id,
      );
      expect(updatedCollection!.runs!.length).toBe(1);
    });
  });
});
