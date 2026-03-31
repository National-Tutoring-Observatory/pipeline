import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Team } from "../../teams/teams.types";
import type { User } from "../../users/users.types";
import BillingAuthorization from "../authorization";

vi.mock("~/modules/billing/helpers/isBillingEnabled.server", () => ({
  default: vi.fn().mockReturnValue(false),
}));

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
    describe("when billing is disabled (default)", () => {
      it("allows super admins", () => {
        expect(BillingAuthorization.canViewBilling(superAdminUser, team)).toBe(
          true,
        );
      });

      it("denies team admins", () => {
        expect(BillingAuthorization.canViewBilling(teamAdminUser, team)).toBe(
          false,
        );
      });

      it("denies billing users", () => {
        expect(BillingAuthorization.canViewBilling(billingUser, team)).toBe(
          false,
        );
      });

      it("denies team members", () => {
        expect(BillingAuthorization.canViewBilling(teamMemberUser, team)).toBe(
          false,
        );
      });

      it("denies null users", () => {
        expect(BillingAuthorization.canViewBilling(null, team)).toBe(false);
      });
    });

    describe("when billing is enabled", () => {
      beforeEach(async () => {
        const mod =
          await import("~/modules/billing/helpers/isBillingEnabled.server");
        vi.mocked(mod.default).mockReturnValue(true);
      });

      afterEach(() => {
        vi.resetAllMocks();
      });

      it("allows super admins", () => {
        expect(BillingAuthorization.canViewBilling(superAdminUser, team)).toBe(
          true,
        );
      });

      it("allows team admins", () => {
        expect(BillingAuthorization.canViewBilling(teamAdminUser, team)).toBe(
          true,
        );
      });

      it("allows billing users", () => {
        expect(BillingAuthorization.canViewBilling(billingUser, team)).toBe(
          true,
        );
      });

      it("denies team members", () => {
        expect(BillingAuthorization.canViewBilling(teamMemberUser, team)).toBe(
          false,
        );
      });

      it("denies null users", () => {
        expect(BillingAuthorization.canViewBilling(null, team)).toBe(false);
      });
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

  describe("canAssignPlan", () => {
    it("allows super admins only", () => {
      expect(BillingAuthorization.canAssignPlan(superAdminUser)).toBe(true);
    });

    it("denies billing user", () => {
      expect(BillingAuthorization.canAssignPlan(billingUser)).toBe(false);
    });

    it("denies team admins", () => {
      expect(BillingAuthorization.canAssignPlan(teamAdminUser)).toBe(false);
    });

    it("denies team members", () => {
      expect(BillingAuthorization.canAssignPlan(teamMemberUser)).toBe(false);
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canAssignPlan(null)).toBe(false);
    });
  });

  describe("canSetBillingUser", () => {
    it("allows super admins", () => {
      expect(
        BillingAuthorization.canSetBillingUser(superAdminUser, "team-1"),
      ).toBe(true);
    });

    it("allows team admins for their team", () => {
      expect(
        BillingAuthorization.canSetBillingUser(teamAdminUser, "team-1"),
      ).toBe(true);
    });

    it("denies team admins for other teams", () => {
      expect(
        BillingAuthorization.canSetBillingUser(teamAdminUser, "team-999"),
      ).toBe(false);
    });

    it("denies team members", () => {
      expect(
        BillingAuthorization.canSetBillingUser(teamMemberUser, "team-1"),
      ).toBe(false);
    });

    it("denies non-team users", () => {
      expect(
        BillingAuthorization.canSetBillingUser(nonTeamUser, "team-1"),
      ).toBe(false);
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canSetBillingUser(null, "team-1")).toBe(
        false,
      );
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
