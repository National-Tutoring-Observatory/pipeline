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
    teams: [{ team: "team-1", role: "MEMBER" }],
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
    describe("when billing is disabled", () => {
      it("allows super admins", () => {
        expect(
          BillingAuthorization.canViewBilling(superAdminUser, team, false),
        ).toBe(true);
      });

      it("denies team admins", () => {
        expect(
          BillingAuthorization.canViewBilling(teamAdminUser, team, false),
        ).toBe(false);
      });

      it("denies billing users", () => {
        expect(
          BillingAuthorization.canViewBilling(billingUser, team, false),
        ).toBe(false);
      });

      it("denies team members", () => {
        expect(
          BillingAuthorization.canViewBilling(teamMemberUser, team, false),
        ).toBe(false);
      });

      it("denies null users", () => {
        expect(BillingAuthorization.canViewBilling(null, team, false)).toBe(
          false,
        );
      });
    });

    describe("when billing is enabled", () => {
      it("allows super admins", () => {
        expect(
          BillingAuthorization.canViewBilling(superAdminUser, team, true),
        ).toBe(true);
      });

      it("allows team admins", () => {
        expect(
          BillingAuthorization.canViewBilling(teamAdminUser, team, true),
        ).toBe(true);
      });

      it("allows billing users", () => {
        expect(
          BillingAuthorization.canViewBilling(billingUser, team, true),
        ).toBe(true);
      });

      it("denies team members", () => {
        expect(
          BillingAuthorization.canViewBilling(teamMemberUser, team, true),
        ).toBe(false);
      });

      it("denies null users", () => {
        expect(BillingAuthorization.canViewBilling(null, team, true)).toBe(
          false,
        );
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
      expect(BillingAuthorization.canAddCredits(superAdminUser)).toBe(true);
    });

    it("denies the billing user", () => {
      expect(BillingAuthorization.canAddCredits(billingUser)).toBe(false);
    });

    it("denies team admins", () => {
      expect(BillingAuthorization.canAddCredits(teamAdminUser)).toBe(false);
    });

    it("denies team members", () => {
      expect(BillingAuthorization.canAddCredits(teamMemberUser)).toBe(false);
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canAddCredits(null)).toBe(false);
    });
  });

  describe("canTopUp", () => {
    it("denies super admins", () => {
      expect(BillingAuthorization.canTopUp(superAdminUser, team)).toBe(false);
    });

    it("allows the billing user", () => {
      expect(BillingAuthorization.canTopUp(billingUser, team)).toBe(true);
    });

    it("allows team admins", () => {
      expect(BillingAuthorization.canTopUp(teamAdminUser, team)).toBe(true);
    });

    it("denies team members", () => {
      expect(BillingAuthorization.canTopUp(teamMemberUser, team)).toBe(false);
    });

    it("denies non-team users", () => {
      expect(BillingAuthorization.canTopUp(nonTeamUser, team)).toBe(false);
    });

    it("denies null users", () => {
      expect(BillingAuthorization.canTopUp(null, team)).toBe(false);
    });
  });
});
