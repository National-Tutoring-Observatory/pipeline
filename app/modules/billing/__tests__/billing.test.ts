import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { LlmCostService } from "~/modules/llmCosts/llmCost";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { TeamBillingService } from "../billing";
import { BillingPlanService } from "../billingPlan";
import { TeamBillingPlanService } from "../teamBillingPlan";
import { TeamCreditService } from "../teamCredit";

describe("Billing", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  const teamId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  async function seedDefaultPlan() {
    const plan = await BillingPlanService.create({
      name: "Standard",
      markupRate: 1.5,
      isDefault: true,
    });
    await TeamBillingPlanService.assignPlan(teamId, plan._id);
    return plan;
  }

  describe("BillingPlanService", () => {
    it("creates and finds a billing plan", async () => {
      const plan = await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });

      expect(plan._id).toBeDefined();
      expect(plan.name).toBe("Standard");
      expect(plan.markupRate).toBe(1.5);
      expect(plan.isDefault).toBe(true);
    });

    it("finds default plan", async () => {
      await BillingPlanService.create({
        name: "Custom",
        markupRate: 2.0,
        isDefault: false,
      });
      await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });

      const defaultPlan = await BillingPlanService.findDefault();
      expect(defaultPlan?.name).toBe("Standard");
      expect(defaultPlan?.isDefault).toBe(true);
    });
  });

  describe("TeamBillingPlanService", () => {
    it("assigns a plan to a team", async () => {
      const plan = await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });

      const assignment = await TeamBillingPlanService.assignPlan(
        teamId,
        plan._id,
      );
      expect(assignment.team).toBe(teamId);
      expect(assignment.plan).toBe(plan._id);
    });

    it("upserts on reassignment", async () => {
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

      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      const updated = await TeamBillingPlanService.assignPlan(
        teamId,
        plan2._id,
      );

      expect(updated.plan).toBe(plan2._id);

      const found = await TeamBillingPlanService.findByTeam(teamId);
      expect(found?.plan).toBe(plan2._id);
    });

    it("returns effective plan for team", async () => {
      const plan = await seedDefaultPlan();

      const effective = await TeamBillingPlanService.getEffectivePlan(teamId);
      expect(effective?.name).toBe(plan.name);
      expect(effective?.markupRate).toBe(1.5);
    });

    it("returns null when no plan assigned", async () => {
      const effective = await TeamBillingPlanService.getEffectivePlan(teamId);
      expect(effective).toBeNull();
    });
  });

  describe("TeamCreditService", () => {
    it("creates a credit record", async () => {
      const credit = await TeamCreditService.create({
        team: teamId,
        amount: 50,
        addedBy: userId,
        note: "Initial top-up",
      });

      expect(credit._id).toBeDefined();
      expect(credit.team).toBe(teamId);
      expect(credit.amount).toBe(50);
      expect(credit.addedBy).toBe(userId);
      expect(credit.note).toBe("Initial top-up");
    });

    it("sums credits by team", async () => {
      const otherTeam = new Types.ObjectId().toString();

      await TeamCreditService.create({
        team: teamId,
        amount: 50,
        addedBy: userId,
      });
      await TeamCreditService.create({
        team: teamId,
        amount: 25,
        addedBy: userId,
      });
      await TeamCreditService.create({
        team: otherTeam,
        amount: 100,
        addedBy: userId,
      });

      const total = await TeamCreditService.sumByTeam(teamId);
      expect(total).toBe(75);
    });

    it("returns 0 when no credits exist", async () => {
      const total = await TeamCreditService.sumByTeam(teamId);
      expect(total).toBe(0);
    });
  });

  describe("LlmCostService.sumCostByTeam", () => {
    it("sums costs by team", async () => {
      const otherTeam = new Types.ObjectId().toString();

      await LlmCostService.create({
        team: teamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 500,
        outputTokens: 100,
        cost: 0.01,
        providerCost: 0.008,
      });
      await LlmCostService.create({
        team: teamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 300,
        outputTokens: 50,
        cost: 0.005,
        providerCost: 0.004,
      });
      await LlmCostService.create({
        team: otherTeam,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 1000,
        outputTokens: 200,
        cost: 1.0,
        providerCost: 0.8,
      });

      const total = await LlmCostService.sumCostByTeam(teamId);
      expect(total).toBeCloseTo(0.015);
    });

    it("returns 0 when no costs exist", async () => {
      const total = await LlmCostService.sumCostByTeam(teamId);
      expect(total).toBe(0);
    });
  });

  describe("TeamBillingService", () => {
    it("calculates balance with markup", async () => {
      await seedDefaultPlan();

      await TeamCreditService.create({
        team: teamId,
        amount: 100,
        addedBy: userId,
      });

      await LlmCostService.create({
        team: teamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 500,
        outputTokens: 100,
        cost: 10,
        providerCost: 8,
      });

      // balance = 100 - (10 * 1.5) = 85
      const balance = await TeamBillingService.getBalance(teamId);
      expect(balance).toBe(85);
    });

    it("returns 0 when no plan assigned", async () => {
      await TeamCreditService.create({
        team: teamId,
        amount: 100,
        addedBy: userId,
      });

      const balance = await TeamBillingService.getBalance(teamId);
      expect(balance).toBe(0);
    });

    it("returns negative balance when costs exceed credits", async () => {
      await seedDefaultPlan();

      await TeamCreditService.create({
        team: teamId,
        amount: 10,
        addedBy: userId,
      });

      await LlmCostService.create({
        team: teamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 500,
        outputTokens: 100,
        cost: 20,
        providerCost: 16,
      });

      // balance = 10 - (20 * 1.5) = -20
      const balance = await TeamBillingService.getBalance(teamId);
      expect(balance).toBe(-20);
    });

    it("returns full balance summary", async () => {
      await seedDefaultPlan();

      await TeamCreditService.create({
        team: teamId,
        amount: 100,
        addedBy: userId,
      });

      await LlmCostService.create({
        team: teamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 500,
        outputTokens: 100,
        cost: 10,
        providerCost: 8,
      });

      const summary = await TeamBillingService.getBalanceSummary(teamId);
      expect(summary).not.toBeNull();
      expect(summary!.balance).toBe(85);
      expect(summary!.credits).toBe(100);
      expect(summary!.costs).toBe(10);
      expect(summary!.markedUpCosts).toBe(15);
      expect(summary!.plan.name).toBe("Standard");
    });

    it("returns null summary when no plan assigned", async () => {
      const summary = await TeamBillingService.getBalanceSummary(teamId);
      expect(summary).toBeNull();
    });
  });
});
