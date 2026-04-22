import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { BillingPlanService } from "../billingPlan";
import { TeamBillingPlanService } from "../teamBillingPlan";

describe("TeamBillingPlanService", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  const teamId = new Types.ObjectId().toString();

  async function createPlan(name = "Standard", markupRate = 1.5) {
    return BillingPlanService.create({ name, markupRate, isDefault: false });
  }

  function startOfMonth(date: Date = new Date()): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  function startOfNextMonth(date: Date = new Date()): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  }

  describe("assignPlan", () => {
    it("first assignment has effectiveFrom at start of current month", async () => {
      const plan = await createPlan();
      const assignment = await TeamBillingPlanService.assignPlan(
        teamId,
        plan._id,
      );

      expect(new Date(assignment.effectiveFrom).getTime()).toBe(
        startOfMonth().getTime(),
      );
      expect(assignment.team).toBe(teamId);
      expect(assignment.plan).toBe(plan._id);
    });

    it("reassignment has effectiveFrom at start of next month", async () => {
      const plan1 = await createPlan("Standard");
      const plan2 = await createPlan("Premium", 2.0);

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      const second = await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      expect(new Date(second.effectiveFrom).getTime()).toBe(
        startOfNextMonth().getTime(),
      );
      expect(second.plan).toBe(plan2._id);
    });

    it("reassignment does not remove the current active assignment", async () => {
      const plan1 = await createPlan("Standard");
      const plan2 = await createPlan("Premium", 2.0);

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      const effective = await TeamBillingPlanService.getEffectivePlan(teamId);
      expect(effective?.name).toBe("Standard");
    });

    it("re-assigning the same pending plan does not create a duplicate record", async () => {
      const plan1 = await createPlan("Standard");
      const plan2 = await createPlan("Premium", 2.0);

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);
      // Assign plan2 again to the same next-month slot — should upsert, not insert
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      const assignments = await TeamBillingPlanService.findAllByTeam(teamId);
      expect(assignments).toHaveLength(2);
    });

    it("replaces an existing pending change scheduled for the same month", async () => {
      const plan1 = await createPlan("Standard");
      const plan2 = await createPlan("Premium", 2.0);
      const plan3 = await createPlan("Enterprise", 3.0);

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);
      await TeamBillingPlanService.assignPlan(teamId, plan3._id);

      const pending = await TeamBillingPlanService.getPendingPlanChange(teamId);
      expect(pending?.plan.name).toBe("Enterprise");
    });
  });

  describe("getEffectivePlan", () => {
    it("returns null when no records exist", async () => {
      const result = await TeamBillingPlanService.getEffectivePlan(teamId);
      expect(result).toBeNull();
    });

    it("returns the assigned plan", async () => {
      const plan = await createPlan();
      await TeamBillingPlanService.assignPlan(teamId, plan._id);

      const result = await TeamBillingPlanService.getEffectivePlan(teamId);
      expect(result?.name).toBe("Standard");
      expect(result?.markupRate).toBe(1.5);
    });

    it("returns null when queried before the effectiveFrom date", async () => {
      const plan = await createPlan();
      await TeamBillingPlanService.assignPlan(teamId, plan._id);

      const now = new Date();
      const beforeCurrentMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
      );

      const result = await TeamBillingPlanService.getEffectivePlan(
        teamId,
        beforeCurrentMonth,
      );
      expect(result).toBeNull();
    });

    it("returns the plan active at a historical date, not the current plan", async () => {
      const plan1 = await createPlan("Standard");
      const plan2 = await createPlan("Premium", 2.0);

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      const result = await TeamBillingPlanService.getEffectivePlan(
        teamId,
        new Date(),
      );
      expect(result?.name).toBe("Standard");
    });

    it("does not return a pending future plan as the current plan", async () => {
      const plan1 = await createPlan("Standard");
      const plan2 = await createPlan("Premium", 2.0);

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      const current = await TeamBillingPlanService.getEffectivePlan(teamId);
      expect(current?.name).toBe("Standard");
    });
  });

  describe("getPendingPlanChange", () => {
    it("returns null when no records exist", async () => {
      const result = await TeamBillingPlanService.getPendingPlanChange(teamId);
      expect(result).toBeNull();
    });

    it("returns null when only a current assignment exists", async () => {
      const plan = await createPlan();
      await TeamBillingPlanService.assignPlan(teamId, plan._id);

      const result = await TeamBillingPlanService.getPendingPlanChange(teamId);
      expect(result).toBeNull();
    });

    it("returns the pending plan change", async () => {
      const plan1 = await createPlan("Standard");
      const plan2 = await createPlan("Premium", 2.0);

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      const pending = await TeamBillingPlanService.getPendingPlanChange(teamId);
      expect(pending?.plan.name).toBe("Premium");
      expect(pending?.effectiveFrom).toBeDefined();
    });
  });
});
