import { describe, expect, it } from "vitest";
import type { User } from "../../users/users.types";
import SystemAdminAuthorization from "../systemAdminAuthorization";

describe("SystemAdminAuthorization", () => {
  const superAdminUser = {
    _id: "super-admin-1",
    username: "super_admin",
    role: "SUPER_ADMIN",
    teams: [] as any,
  } as User;

  const regularUser = {
    _id: "user-1",
    username: "regular_user",
    role: "USER",
    teams: [{ team: "team-1", role: "ADMIN" }],
  } as User;

  describe("FeatureFlags.canManage", () => {
    it("allows super admins to manage feature flags", () => {
      expect(
        SystemAdminAuthorization.FeatureFlags.canManage(superAdminUser),
      ).toBe(true);
    });

    it("denies regular users from managing feature flags", () => {
      expect(SystemAdminAuthorization.FeatureFlags.canManage(regularUser)).toBe(
        false,
      );
    });

    it("denies null users from managing feature flags", () => {
      expect(SystemAdminAuthorization.FeatureFlags.canManage(null)).toBe(false);
    });
  });

  describe("Queues.canManage", () => {
    it("allows super admins to manage queues", () => {
      expect(SystemAdminAuthorization.Queues.canManage(superAdminUser)).toBe(
        true,
      );
    });

    it("denies regular users from managing queues", () => {
      expect(SystemAdminAuthorization.Queues.canManage(regularUser)).toBe(
        false,
      );
    });

    it("denies null users from managing queues", () => {
      expect(SystemAdminAuthorization.Queues.canManage(null)).toBe(false);
    });
  });
});
