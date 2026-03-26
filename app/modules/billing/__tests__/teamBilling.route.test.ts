import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action } from "../../teams/containers/teamBilling.route";
import { BillingPlanService } from "../billingPlan";
import { TeamBillingPlanService } from "../teamBillingPlan";
import { TeamCreditService } from "../teamCredit";

function buildActionRequest(
  cookieHeader: string,
  teamId: string,
  body: object,
) {
  return {
    request: new Request(`http://localhost/teams/${teamId}/billing`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
    params: { id: teamId },
  } as any;
}

describe("teamBilling.route action", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("SET_BILLING_USER", () => {
    it("rejects non-team-member as billing user", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const outsider = await UserService.create({
        username: "outsider",
        role: "USER",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const cookie = await loginUser(admin._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "SET_BILLING_USER",
          payload: { userId: outsider._id },
        }),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("not a member");
    });

    it("allows setting a team member as billing user", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const member = await UserService.create({
        username: "member",
        role: "USER",
        teams: [{ team: team._id, role: "ADMIN" }],
      });

      const cookie = await loginUser(admin._id);

      const result = await action(
        buildActionRequest(cookie, team._id, {
          intent: "SET_BILLING_USER",
          payload: { userId: member._id },
        }),
      );

      expect(result.success).toBe(true);

      const updated = await TeamService.findById(team._id);
      expect(updated?.billingUser).toBe(member._id);
    });

    it("denies non-super-admin from setting billing user", async () => {
      const regular = await UserService.create({
        username: "regular",
        role: "USER",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const cookie = await loginUser(regular._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "SET_BILLING_USER",
          payload: { userId: regular._id },
        }),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("super admins");
    });
  });

  describe("ASSIGN_PLAN", () => {
    it("allows super admin to assign a plan", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const plan = await BillingPlanService.create({
        name: "Premium",
        markupRate: 2.0,
        isDefault: false,
      });
      const cookie = await loginUser(admin._id);

      const result = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ASSIGN_PLAN",
          payload: { planId: plan._id },
        }),
      );

      expect(result.success).toBe(true);

      const assignment = await TeamBillingPlanService.findByTeam(team._id);
      expect(assignment).not.toBeNull();
      expect(assignment!.plan).toBe(plan._id);
    });

    it("allows super admin to change an existing plan", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const plan1 = await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });
      const plan2 = await BillingPlanService.create({
        name: "Premium",
        markupRate: 2.0,
        isDefault: false,
      });
      await TeamBillingPlanService.assignPlan(team._id, plan1._id);
      const cookie = await loginUser(admin._id);

      const result = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ASSIGN_PLAN",
          payload: { planId: plan2._id },
        }),
      );

      expect(result.success).toBe(true);

      const assignment = await TeamBillingPlanService.findByTeam(team._id);
      expect(assignment!.plan).toBe(plan2._id);
    });

    it("denies non-super-admin from assigning a plan", async () => {
      const regular = await UserService.create({
        username: "regular",
        role: "USER",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const cookie = await loginUser(regular._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ASSIGN_PLAN",
          payload: { planId: "some-plan-id" },
        }),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("super admins");
    });
  });

  describe("ADD_CREDITS", () => {
    it("allows billing user to add credits", async () => {
      const team = await TeamService.create({ name: "Test Team" });
      const billingUser = await UserService.create({
        username: "billing",
        role: "USER",
        teams: [{ team: team._id, role: "ADMIN" }],
      });
      await TeamService.updateById(team._id, { billingUser: billingUser._id });
      await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });

      const cookie = await loginUser(billingUser._id);

      const result = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ADD_CREDITS",
          payload: { amount: 50, note: "Test top-up" },
        }),
      );

      expect(result.success).toBe(true);

      const credits = await TeamCreditService.findByTeam(team._id);
      expect(credits).toHaveLength(1);
      expect(credits[0].amount).toBe(50);
      expect(credits[0].note).toBe("Test top-up");
    });

    it("allows super admin to add credits", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const cookie = await loginUser(admin._id);

      const result = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ADD_CREDITS",
          payload: { amount: 100 },
        }),
      );

      expect(result.success).toBe(true);
    });

    it("denies regular members from adding credits", async () => {
      const team = await TeamService.create({ name: "Test Team" });
      const member = await UserService.create({
        username: "member",
        role: "USER",
        teams: [{ team: team._id, role: "ADMIN" }],
      });
      const cookie = await loginUser(member._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ADD_CREDITS",
          payload: { amount: 50 },
        }),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("permission");
    });

    it("rejects invalid amount", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const cookie = await loginUser(admin._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ADD_CREDITS",
          payload: { amount: "not-a-number" },
        }),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid");
    });

    it("rejects amount below minimum", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const cookie = await loginUser(admin._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "ADD_CREDITS",
          payload: { amount: 5 },
        }),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Minimum");
    });
  });
});
