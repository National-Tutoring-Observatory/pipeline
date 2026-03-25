import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action } from "../../teams/containers/teamBilling.route";
import { BillingPlanService } from "../billingPlan";
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

  describe("GET_TEAM_MEMBERS", () => {
    it("returns team members for super admin", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      await UserService.create({
        username: "member1",
        role: "USER",
        teams: [{ team: team._id, role: "ADMIN" }],
      });
      const cookie = await loginUser(admin._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "GET_TEAM_MEMBERS",
        }),
      );

      expect(result.success).toBe(true);
      expect(result.intent).toBe("GET_TEAM_MEMBERS");
      expect(result.members).toHaveLength(1);
      expect(result.members[0].username).toBe("member1");
    });

    it("denies non-super-admin from fetching members", async () => {
      const regular = await UserService.create({
        username: "regular",
        role: "USER",
        teams: [],
      });
      const team = await TeamService.create({ name: "Test Team" });
      const cookie = await loginUser(regular._id);

      const result: any = await action(
        buildActionRequest(cookie, team._id, {
          intent: "GET_TEAM_MEMBERS",
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
