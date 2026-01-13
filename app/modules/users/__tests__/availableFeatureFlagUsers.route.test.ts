import { beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import "~/modules/documents/documents";
import { UserService } from "../user";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/availableFeatureFlagUsers.route";

const generateObjectId = () => new mongoose.Types.ObjectId().toString();

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
    const superAdmin = await UserService.create({
      username: "admin",
      role: "SUPER_ADMIN",
    });

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
    const featureFlag = await FeatureFlagService.create({
      name: "beta_feature",
    });

    const regularUser = await UserService.create({
      username: "user",
      role: "USER",
      githubId: 100001,
      hasGithubSSO: true,
      isRegistered: true,
    });

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
    const superAdmin = await UserService.create({
      username: "admin",
      role: "SUPER_ADMIN",
      isRegistered: true,
    });

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
    const featureFlag = await FeatureFlagService.create({
      name: "beta_feature",
    });

    const superAdmin = await UserService.create({
      username: "admin",
      role: "SUPER_ADMIN",
      isRegistered: true,
    });

    // Create a user with the feature flag
    const userWithFlag = await UserService.create({
      username: "with_flag",
      isRegistered: true,
      featureFlags: ["beta_feature"],
    });

    // Create a user without the feature flag
    const userWithoutFlag = await UserService.create({
      username: "without_flag",
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

    expect(result.data).toHaveLength(2);
    expect(result.data.some((u: any) => u._id === userWithoutFlag._id)).toBe(true);
    expect(result.data.some((u: any) => u._id === superAdmin._id)).toBe(true);
  });

  it("returns only registered users", async () => {
    const featureFlag = await FeatureFlagService.create({
      name: "beta_feature",
    });

    const superAdmin = await UserService.create({
      username: "admin",
      role: "SUPER_ADMIN",
      isRegistered: true,
    });

    // Create a registered user
    const registeredUser = await UserService.create({
      username: "registered",
      isRegistered: true,
      featureFlags: [],
    });

    // Create an unregistered user
    const unregisteredUser = await UserService.create({
      username: "unregistered",
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

    expect(result.data).toHaveLength(2);
    expect(result.data.some((u: any) => u._id === registeredUser._id)).toBe(true);
    expect(result.data.some((u: any) => u._id === superAdmin._id)).toBe(true);
    expect(result.data.some((u: any) => u._id === unregisteredUser._id)).toBe(false);
  });
});
