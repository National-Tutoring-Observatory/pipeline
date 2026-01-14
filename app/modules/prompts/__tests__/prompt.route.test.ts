import { beforeEach, describe, expect, it } from "vitest";
import { PromptService } from "../prompt";
import { PromptVersionService } from "../promptVersion";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { action } from "../containers/prompt.route";

describe("prompt.route action", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  describe("CREATE_PROMPT_VERSION", () => {
    it("creates a new prompt version when user is authorized", async () => {
      const team = await TeamService.create({ name: "team 1" });
      const user = await UserService.create({
        username: "test_admin",
        teams: [{ team: team._id, role: "ADMIN" }]
      });

      const prompt = await PromptService.create({
        name: "Test Prompt",
        annotationType: "PER_UTTERANCE",
        team: team._id,
        createdBy: user._id
      });

      const promptVersion = await PromptVersionService.create({
        name: "Version 1",
        prompt: prompt._id,
        version: 1,
        userPrompt: "Test prompt text",
        annotationSchema: [],
        hasBeenSaved: true,
        updatedAt: new Date().toISOString()
      });

      const cookieHeader = await loginUser(user._id);

      const response = await action({
        request: new Request("http://localhost/", {
          method: "POST",
          headers: { cookie: cookieHeader },
          body: JSON.stringify({
            intent: "CREATE_PROMPT_VERSION",
            entityId: prompt._id,
            payload: { version: 1 }
          })
        }),
        params: { id: prompt._id },
        context: {},
        unstable_pattern: ""
      } as any) as any;

      expect(response.data?.success).toBe(true);
      expect(response.data?.intent).toBe("CREATE_PROMPT_VERSION");
      expect(response.data?.data?.prompt).toBe(prompt._id);
      expect(response.data?.data?.version).toBe(2);
      expect(response.data?.data?.name).toContain("Version 1 #2");
    });

    it("denies prompt version creation when user is not authenticated", async () => {
      const team = await TeamService.create({ name: "team 1" });
      const user = await UserService.create({
        username: "test_user",
        teams: [{ team: team._id, role: "ADMIN" }]
      });

      const prompt = await PromptService.create({
        name: "Test Prompt",
        annotationType: "PER_UTTERANCE",
        team: team._id,
        createdBy: user._id
      });

      const response = await action({
        request: new Request("http://localhost/", {
          method: "POST",
          body: JSON.stringify({
            intent: "CREATE_PROMPT_VERSION",
            entityId: prompt._id,
            payload: { version: 1 }
          })
        }),
        params: { id: prompt._id },
        context: {},
        unstable_pattern: ""
      } as any);

      expect(response).toBeInstanceOf(Response);
      expect((response as Response).headers.get("Location")).toBe("/");
    });

    it("throws when prompt does not exist", async () => {
      const team = await TeamService.create({ name: "team 1" });
      const user = await UserService.create({
        username: "test_admin",
        teams: [{ team: team._id, role: "ADMIN" }]
      });

      const cookieHeader = await loginUser(user._id);
      const fakeId = new (require('mongodb')).ObjectId().toString();

      await expect(action({
        request: new Request("http://localhost/", {
          method: "POST",
          headers: { cookie: cookieHeader },
          body: JSON.stringify({
            intent: "CREATE_PROMPT_VERSION",
            entityId: fakeId,
            payload: { version: 1 }
          })
        }),
        params: { id: fakeId },
        context: {},
        unstable_pattern: ""
      } as any)).rejects.toThrow("Prompt not found");
    });

    it("returns error when previous version does not exist", async () => {
      const team = await TeamService.create({ name: "team 1" });
      const user = await UserService.create({
        username: "test_admin",
        teams: [{ team: team._id, role: "ADMIN" }]
      });

      const prompt = await PromptService.create({
        name: "Test Prompt",
        annotationType: "PER_UTTERANCE",
        team: team._id,
        createdBy: user._id
      });

      const cookieHeader = await loginUser(user._id);

      const response = await action({
        request: new Request("http://localhost/", {
          method: "POST",
          headers: { cookie: cookieHeader },
          body: JSON.stringify({
            intent: "CREATE_PROMPT_VERSION",
            entityId: prompt._id,
            payload: { version: 999 }
          })
        }),
        params: { id: prompt._id },
        context: {},
        unstable_pattern: ""
      } as any) as any;

      expect(response.init?.status).toBe(400);
      expect(response.data?.errors?.general).toContain("Previous prompt version not found");
    });
  });
});
