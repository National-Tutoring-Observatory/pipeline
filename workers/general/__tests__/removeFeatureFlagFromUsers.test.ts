import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "~/modules/users/user";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import removeFeatureFlagFromUsers from "../removeFeatureFlagFromUsers";

vi.mock("../../helpers/emitFromJob", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

describe("removeFeatureFlagFromUsers worker", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("removes feature flag from all users who have it", async () => {
    const featureFlag = await FeatureFlagService.create({
      name: "deprecated-flag",
    });

    const user1 = await UserService.create({
      username: "user1",
      githubId: 1,
      featureFlags: ["deprecated-flag", "other-flag"],
    });

    const user2 = await UserService.create({
      username: "user2",
      githubId: 2,
      featureFlags: ["deprecated-flag"],
    });

    const user3 = await UserService.create({
      username: "user3",
      githubId: 3,
      featureFlags: ["other-flag"],
    });

    const result = await removeFeatureFlagFromUsers({
      data: { featureFlagName: "deprecated-flag", featureFlagId: featureFlag._id },
    } as any);

    expect(result.status).toBe("DELETED");
    expect(result.featureFlagId).toBe(featureFlag._id);

    const updatedUser1 = await UserService.findById(user1._id);
    const updatedUser2 = await UserService.findById(user2._id);
    const updatedUser3 = await UserService.findById(user3._id);

    expect(updatedUser1?.featureFlags).toContain("other-flag");
    expect(updatedUser1?.featureFlags).not.toContain("deprecated-flag");

    expect(updatedUser2?.featureFlags).not.toContain("deprecated-flag");

    expect(updatedUser3?.featureFlags).toContain("other-flag");
  });

  it("returns ERRORED when featureFlagName is missing", async () => {
    const result = await removeFeatureFlagFromUsers({
      data: { featureFlagId: "some-id" },
    } as any);

    expect(result.status).toBe("ERRORED");
    expect(result.message).toBe("missing featureFlagName");
  });

  it("returns ERRORED when job.data is missing", async () => {
    const result = await removeFeatureFlagFromUsers({
      data: undefined,
    } as any);

    expect(result.status).toBe("ERRORED");
    expect(result.message).toBe("missing featureFlagName");
  });
});
