import { beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import "~/modules/documents/documents";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { UserService } from "../user";
import type { User } from "../users.types";
import type { FeatureFlag } from "~/modules/featureFlags/featureFlags.types";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/availableFeatureFlagUsers.route";

const generateObjectId = () => new mongoose.Types.ObjectId().toString();

const documents = getDocumentsAdapter();

describe("availableFeatureFlagUsers.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({
      request: new Request("http://localhost/available-feature-flag-users?featureFlagId=123"),
      params: {},
    } as any);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("throws error when featureFlagId is not provided", async () => {
    const superAdmin = (await documents.createDocument<User>({
      collection: "users",
      update: { username: "admin", role: "SUPER_ADMIN" },
    })).data;

    const cookieHeader = await loginUser(superAdmin._id);

    await expect(
      loader({
        request: new Request("http://localhost/available-feature-flag-users", {
          headers: { cookie: cookieHeader },
        }),
        params: {},
      } as any)
    ).rejects.toThrow("Feature flag id is not defined");
  });

  it("throws error when user cannot manage feature flags", async () => {
    const featureFlag = (await documents.createDocument<FeatureFlag>({
      collection: "featureFlags",
      update: { name: "beta_feature" },
    })).data;

    const regularUser = (await documents.createDocument<User>({
      collection: "users",
      update: { username: "user", role: "USER" },
    })).data;

    const cookieHeader = await loginUser(regularUser._id);

    await expect(
      loader({
        request: new Request(
          `http://localhost/available-feature-flag-users?featureFlagId=${featureFlag._id}`,
          { headers: { cookie: cookieHeader } }
        ),
        params: {},
      } as any)
    ).rejects.toThrow("Access denied");
  });

  it("throws error when feature flag not found", async () => {
    const superAdmin = (await documents.createDocument<User>({
      collection: "users",
      update: { username: "admin", role: "SUPER_ADMIN" },
    })).data;

    const cookieHeader = await loginUser(superAdmin._id);

    await expect(
      loader({
        request: new Request(
          `http://localhost/available-feature-flag-users?featureFlagId=${generateObjectId()}`,
          { headers: { cookie: cookieHeader } }
        ),
        params: {},
      } as any)
    ).rejects.toThrow("Feature flag not found");
  });

  it("returns users without the feature flag", async () => {
    const featureFlag = (await documents.createDocument<FeatureFlag>({
      collection: "featureFlags",
      update: { name: "beta_feature" },
    })).data;

    const superAdmin = (await documents.createDocument<User>({
      collection: "users",
      update: { username: "admin", role: "SUPER_ADMIN" },
    })).data;

    // Create a user with the feature flag
    const userWithFlag = await UserService.create({
      username: "with_flag",
      role: "USER",
      githubId: 100001,
      hasGithubSSO: true,
      isRegistered: true,
      featureFlags: ["beta_feature"],
    });

    // Create a user without the feature flag
    const userWithoutFlag = await UserService.create({
      username: "without_flag",
      role: "USER",
      githubId: 100002,
      hasGithubSSO: true,
      isRegistered: true,
      featureFlags: [],
    });

    const cookieHeader = await loginUser(superAdmin._id);

    const result = (await loader({
      request: new Request(
        `http://localhost/available-feature-flag-users?featureFlagId=${featureFlag._id}`,
        { headers: { cookie: cookieHeader } }
      ),
      params: {},
    } as any)) as any;

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(userWithoutFlag._id);
  });

  it("returns only registered users", async () => {
    const featureFlag = (await documents.createDocument<FeatureFlag>({
      collection: "featureFlags",
      update: { name: "beta_feature" },
    })).data;

    const superAdmin = (await documents.createDocument<User>({
      collection: "users",
      update: { username: "admin", role: "SUPER_ADMIN" },
    })).data;

    // Create a registered user
    const registeredUser = await UserService.create({
      username: "registered",
      role: "USER",
      githubId: 100001,
      hasGithubSSO: true,
      isRegistered: true,
      featureFlags: [],
    });

    // Create an unregistered user
    const unregisteredUser = await UserService.create({
      username: "unregistered",
      role: "USER",
      githubId: 100002,
      hasGithubSSO: true,
      isRegistered: false,
      featureFlags: [],
    });

    const cookieHeader = await loginUser(superAdmin._id);

    const result = (await loader({
      request: new Request(
        `http://localhost/available-feature-flag-users?featureFlagId=${featureFlag._id}`,
        { headers: { cookie: cookieHeader } }
      ),
      params: {},
    } as any)) as any;

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(registeredUser._id);
  });
});
