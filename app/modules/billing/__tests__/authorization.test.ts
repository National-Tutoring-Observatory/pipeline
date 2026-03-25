import { describe, expect, it } from "vitest";
import type { Team } from "../../teams/teams.types";
import type { User } from "../../users/users.types";
import BillingAuthorization from "../authorization";

describe("BillingAuthorization", () => {
  const superAdminUser = {
    _id: "super-admin-1",
    username: "super_admin",
    role: "SUPER_ADMIN",
    teams: [] as any,
  } as User;

  const billingUser = {
    _id: "billing-user-1",
    username: "billing_user",
    role: "USER",
    teams: [{ team: "team-1", role: "ADMIN" }],
  } as User;

  const teamAdminUser = {
    _id: "team-admin-1",
    username: "team_admin",
    role: "USER",
    teams: [{ team: "team-1", role: "ADMIN" }],
  } as User;

  const teamMemberUser = {
    _id: "team-member-1",
    username: "team_member",
    role: "USER",
    teams: [{ team: "team-1", role: "MEMBER" }],
  } as User;

  const nonTeamUser = {
    _id: "non-team-1",
    username: "non_team",
    role: "USER",
    teams: [] as any,
  } as User;

  const team: Team = {
    _id: "team-1",
    name: "Test Team",
    createdAt: new Date().toISOString(),
    billingUser: "billing-user-1",
  };

  const teamWithoutBillingUser: Team = {
    _id: "team-1",
    name: "Test Team",
    createdAt: new Date().toISOString(),
  };

  describe("canViewBilling", () => {
    it("allows team members to view billing", () => {
      expect(BillingAuthorization.canViewBilling(billingUser, "team-1")).toBe(
        true,
      );
      expect(BillingAuthorization.canViewBilling(teamAdminUser, "team-1")).toBe(
        true,
      );
      expect(
        BillingAuthorization.canViewBilling(teamMemberUser, "team-1"),
      ).toBe(true);
    });

    it("denies non-members from viewing billing", () => {
      expect(BillingAuthorization.canViewBilling(nonTeamUser, "team-1")).toBe(
        false,
      );
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canViewBilling(null, "team-1")).toBe(false);
    });
  });

  describe("canManageBilling", () => {
    it("allows super admins", () => {
      expect(BillingAuthorization.canManageBilling(superAdminUser, team)).toBe(
        true,
      );
    });

    it("allows the billing user", () => {
      expect(BillingAuthorization.canManageBilling(billingUser, team)).toBe(
        true,
      );
    });

    it("denies team admins", () => {
      expect(BillingAuthorization.canManageBilling(teamAdminUser, team)).toBe(
        false,
      );
    });

    it("denies team members", () => {
      expect(BillingAuthorization.canManageBilling(teamMemberUser, team)).toBe(
        false,
      );
    });

    it("denies when no billing user is set", () => {
      expect(
        BillingAuthorization.canManageBilling(
          billingUser,
          teamWithoutBillingUser,
        ),
      ).toBe(false);
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canManageBilling(null, team)).toBe(false);
    });
  });

  describe("canSetBillingUser", () => {
    it("allows super admins only", () => {
      expect(BillingAuthorization.canSetBillingUser(superAdminUser)).toBe(true);
    });

    it("denies billing user", () => {
      expect(BillingAuthorization.canSetBillingUser(billingUser)).toBe(false);
    });

    it("denies team admins", () => {
      expect(BillingAuthorization.canSetBillingUser(teamAdminUser)).toBe(false);
    });

    it("denies team members", () => {
      expect(BillingAuthorization.canSetBillingUser(teamMemberUser)).toBe(
        false,
      );
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canSetBillingUser(null)).toBe(false);
    });
  });

  describe("canAddCredits", () => {
    it("allows super admins", () => {
      expect(BillingAuthorization.canAddCredits(superAdminUser, team)).toBe(
        true,
      );
    });

    it("allows the billing user", () => {
      expect(BillingAuthorization.canAddCredits(billingUser, team)).toBe(true);
    });

    it("denies team admins", () => {
      expect(BillingAuthorization.canAddCredits(teamAdminUser, team)).toBe(
        false,
      );
    });

    it("denies team members", () => {
      expect(BillingAuthorization.canAddCredits(teamMemberUser, team)).toBe(
        false,
      );
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canAddCredits(null, team)).toBe(false);
    });
  });
});
