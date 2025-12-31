import { beforeEach, describe, expect, it, vi } from "vitest";
import "~/modules/documents/documents";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { action, loader } from "../containers/featureFlag.route";
import type { FeatureFlag } from "../featureFlags.types";

vi.mock("~/modules/queues/helpers/getQueue", () => ({
  default: vi.fn(() => ({
    add: vi.fn().mockResolvedValue({}),
  })),
}));

const documents = getDocumentsAdapter();

describe("featureFlag.route", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("loader", () => {
    it("redirects to / when there is no session cookie", async () => {
      const res = await loader({
        request: new Request("http://localhost/"),
        params: { id: "test-id" },
        unstable_pattern: "",
        context: {},
      } as any);
      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });

    it("returns feature flag with users that have it", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        githubId: 1,
        featureFlags: [],
        teams: [],
      });

      const featureFlag = (
        await documents.createDocument<FeatureFlag>({
          collection: "featureFlags",
          update: { name: "test-flag" },
        })
      ).data;

      await UserService.create({
        username: "user1",
        featureFlags: ["test-flag"],
        githubId: 2,
      });

      await UserService.create({
        username: "user2",
        featureFlags: [],
        githubId: 3,
      });

      const cookieHeader = await loginUser(admin._id);

      const result = await loader({
        request: new Request("http://localhost/", {
          headers: { cookie: cookieHeader },
        }),
        params: { id: featureFlag._id },
        unstable_pattern: "",
        context: {},
      } as any);

      if (result instanceof Response) throw new Error("Expected data, got Response");
      expect(result.featureFlag.data?.name).toBe("test-flag");
      expect(result.users.data).toHaveLength(1);
      expect(result.users.data[0].username).toBe("user1");
    });
  });

  describe("action - ADD_USERS_TO_FEATURE_FLAG", () => {
    it("adds feature flag to multiple users atomically", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        githubId: 1,
        featureFlags: [],
      });

      const featureFlag = (
        await documents.createDocument<FeatureFlag>({
          collection: "featureFlags",
          update: { name: "beta-feature" },
        })
      ).data;

      const user1 = await UserService.create({
        username: "user1",
        githubId: 2,
      });

      const user2 = await UserService.create({
        username: "user2",
        githubId: 3,
      });

      const cookieHeader = await loginUser(admin._id);

      const body = JSON.stringify({
        intent: "ADD_USERS_TO_FEATURE_FLAG",
        payload: { userIds: [user1._id, user2._id] },
      });

      await action({
        request: new Request("http://localhost/", {
          method: "PUT",
          headers: { cookie: cookieHeader },
          body,
        }),
        params: { id: featureFlag._id },
        unstable_pattern: "",
        context: {},
      } as any);

      const updatedUser1 = await UserService.findById(user1._id);
      const updatedUser2 = await UserService.findById(user2._id);

      expect(updatedUser1?.featureFlags).toContain("beta-feature");
      expect(updatedUser2?.featureFlags).toContain("beta-feature");
    });
  });

  describe("action - REMOVE_USER_FROM_FEATURE_FLAG", () => {
    it("removes feature flag from user atomically", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        githubId: 1,
        featureFlags: [],
      });

      const featureFlag = (
        await documents.createDocument<FeatureFlag>({
          collection: "featureFlags",
          update: { name: "beta-feature" },
        })
      ).data;

      const user = await UserService.create({
        username: "user1",
        featureFlags: ["beta-feature"],
        githubId: 2,
      });

      const cookieHeader = await loginUser(admin._id);

      const body = JSON.stringify({
        intent: "REMOVE_USER_FROM_FEATURE_FLAG",
        payload: { userId: user._id },
      });

      await action({
        request: new Request("http://localhost/", {
          method: "PUT",
          headers: { cookie: cookieHeader },
          body,
        }),
        params: { id: featureFlag._id },
        unstable_pattern: "",
        context: {},
      } as any);

      const updatedUser = await UserService.findById(user._id);
      expect(updatedUser?.featureFlags).not.toContain("beta-feature");
    });
  });

  describe("action - DELETE_FEATURE_FLAG", () => {
    it("deletes feature flag", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        githubId: 1,
        featureFlags: [],
      });

      const featureFlag = (
        await documents.createDocument<FeatureFlag>({
          collection: "featureFlags",
          update: { name: "deprecated-flag" },
        })
      ).data;

      const cookieHeader = await loginUser(admin._id);

      const body = JSON.stringify({
        intent: "DELETE_FEATURE_FLAG",
      });

      const result = await action({
        request: new Request("http://localhost/", {
          method: "DELETE",
          headers: { cookie: cookieHeader },
          body,
        }),
        params: { id: featureFlag._id },
        unstable_pattern: "",
        context: {},
      } as any);

      expect(result).not.toBeInstanceOf(Response);
      if (result instanceof Response) throw new Error("Expected data, got Response");
      expect(result.intent).toBe("DELETE_FEATURE_FLAG");
      expect(result.success).toBe(true);

      // Verify the feature flag was deleted
      const deletedFlag = await documents.getDocument<FeatureFlag>({
        collection: "featureFlags",
        match: { _id: featureFlag._id },
      });
      expect(deletedFlag.data).toBeNull();
    });
  });
});
