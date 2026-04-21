import mongoose, { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import seedLegacyBillingBaselinesMigration from "~/migrations/20260421172000-seed-legacy-billing-baselines";
import { LlmCostService } from "~/modules/llmCosts/llmCost";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import makeDate from "../../../../test/helpers/makeDate";
import markLegacyBillingRowsMigration from "../../../migrations/20260421171000-mark-legacy-billing-rows";
import { TeamService } from "../../teams/team";
import { BillingLedgerEntryService } from "../billingLedgerEntry";
import { BillingPeriodService } from "../billingPeriod";
import { BillingPlanService } from "../billingPlan";
import { TeamBillingService } from "../teamBilling";
import { TeamBillingBalanceService } from "../teamBillingBalance";
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

    describe("setupTeamBilling", () => {
      it("assigns the default billing plan to the team", async () => {
        await BillingPlanService.create({
          name: "Standard",
          markupRate: 1.5,
          isDefault: true,
        });

        await TeamBillingService.setupTeamBilling(teamId);

        const assignment = await TeamBillingPlanService.findByTeam(teamId);
        expect(assignment).not.toBeNull();
      });

      it("does not create any credits", async () => {
        await BillingPlanService.create({
          name: "Standard",
          markupRate: 1.5,
          isDefault: true,
        });

        await TeamBillingService.setupTeamBilling(teamId);

        const credits = await TeamCreditService.sumByTeam(teamId);
        expect(credits).toBe(0);
      });

      it("does nothing when no default plan exists", async () => {
        await TeamBillingService.setupTeamBilling(teamId);

        const assignment = await TeamBillingPlanService.findByTeam(teamId);
        expect(assignment).toBeNull();
      });
    });

    describe("assignInitialCredits", () => {
      it("assigns 20 credits when billing is disabled", async () => {
        const original = process.env.BILLING_ENABLED;
        delete process.env.BILLING_ENABLED;

        await TeamBillingService.assignInitialCredits(teamId, userId);

        const credits = await TeamCreditService.sumByTeam(teamId);
        expect(credits).toBe(20);

        process.env.BILLING_ENABLED = original;
      });

      it("assigns 10 credits when billing is enabled", async () => {
        const original = process.env.BILLING_ENABLED;
        process.env.BILLING_ENABLED = "true";

        await TeamBillingService.assignInitialCredits(teamId, userId);

        const credits = await TeamCreditService.sumByTeam(teamId);
        expect(credits).toBe(10);

        process.env.BILLING_ENABLED = original;
      });

      it("records the credit with the correct note and addedBy", async () => {
        delete process.env.BILLING_ENABLED;

        await TeamBillingService.assignInitialCredits(teamId, userId);

        const all = await TeamCreditService.findByTeam(teamId);
        expect(all).toHaveLength(1);
        expect(all[0].note).toBe("Initial credits");
        expect(all[0].addedBy).toBe(userId);

        const ledger = await BillingLedgerEntryService.findByTeam(teamId);
        expect(ledger).toHaveLength(1);
        expect(ledger[0].source).toBe("initial-credit");

        const balance = await TeamBillingBalanceService.findByTeam(teamId);
        expect(balance?.availableBalance).toBeGreaterThan(0);
      });
    });
  });

  describe("TeamBillingService — period-aware balance", () => {
    async function seedPlanBackdated(markupRate = 1.5) {
      const plan = await BillingPlanService.create({
        name: "Standard",
        markupRate,
        isDefault: true,
      });
      const TeamBillingPlanModel = mongoose.model("TeamBillingPlan");
      await TeamBillingPlanModel.create({
        team: new Types.ObjectId(teamId),
        plan: plan._id,
        effectiveFrom: new Date(0),
      });
      return plan;
    }

    async function insertCredit(amount: number, createdAt: Date) {
      const TeamCreditModel = mongoose.model("TeamCredit");
      await TeamCreditModel.create({
        team: new Types.ObjectId(teamId),
        amount,
        addedBy: new Types.ObjectId(userId),
        createdAt,
      });
    }

    async function insertCost(cost: number, createdAt: Date) {
      const LlmCostModel = mongoose.model("LlmCost");
      await LlmCostModel.create({
        team: new Types.ObjectId(teamId),
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 100,
        outputTokens: 50,
        cost,
        providerCost: cost * 0.8,
        createdAt,
      });
    }

    it("no closed periods: falls back to all-time aggregation (same as original)", async () => {
      await seedPlanBackdated(1.5);

      await TeamCreditService.create({
        team: teamId,
        amount: 100,
        addedBy: userId,
      });
      await LlmCostService.create({
        team: teamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 100,
        outputTokens: 50,
        cost: 10,
        providerCost: 8,
      });

      // balance = 100 - (10 * 1.5) = 85
      const balance = await TeamBillingService.getBalance(teamId);
      expect(balance).toBe(85);
    });

    it("one closed period with no new activity: balance equals closingBalance", async () => {
      await seedPlanBackdated(1.5);

      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 15));
      await insertCost(10, makeDate(2025, 1, 20));
      await BillingPeriodService.closePeriod(period);

      const balance = await TeamBillingService.getBalance(teamId);
      // closingBalance = 100 - (10 * 1.5) = 85
      expect(balance).toBe(85);
    });

    it("one closed period + new credit added after endAt", async () => {
      await seedPlanBackdated(1.5);

      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 15));
      await BillingPeriodService.closePeriod(period);

      // Credit added after period closed (Feb 2025)
      await insertCredit(50, makeDate(2025, 2, 10));

      const balance = await TeamBillingService.getBalance(teamId);
      // 100 (closingBalance) + 50 (new credit) = 150
      expect(balance).toBe(150);
    });

    it("one closed period + new cost after endAt", async () => {
      await seedPlanBackdated(1.5);

      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 15));
      await BillingPeriodService.closePeriod(period);

      // Cost in Feb 2025 (after period1 endAt)
      await insertCost(20, makeDate(2025, 2, 10));

      const balance = await TeamBillingService.getBalance(teamId);
      // 100 (closingBalance) - (20 * 1.5) = 70
      expect(balance).toBe(70);
    });

    it("multiple closed periods: only uses the last closingBalance", async () => {
      await seedPlanBackdated(1.5);

      const period1 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 15));
      await insertCost(10, makeDate(2025, 1, 20));
      await BillingPeriodService.closePeriod(period1);

      const period2 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 2),
      );
      await insertCredit(50, makeDate(2025, 2, 15));
      await BillingPeriodService.closePeriod(period2);

      const balance = await TeamBillingService.getBalance(teamId);
      // period1.closingBalance = 100 - 15 = 85
      // period2.closingBalance = 85 + 50 - 0 = 135
      expect(balance).toBe(135);
    });

    it("historical costs are billed at the rate locked in their period, not the current rate", async () => {
      // Jan period: rate 1.5x. Cost $10 → billed $15. Balance = 100 - 15 = 85.
      const plan1 = await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });
      const TeamBillingPlanModel = mongoose.model("TeamBillingPlan");
      await TeamBillingPlanModel.create({
        team: new Types.ObjectId(teamId),
        plan: plan1._id,
        effectiveFrom: new Date(0),
      });

      const period1 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 10));
      await insertCost(10, makeDate(2025, 1, 20));
      await BillingPeriodService.closePeriod(period1);

      // After period 1 close: 100 - (10 * 1.5) = 85
      expect(await TeamBillingService.getBalance(teamId)).toBe(85);

      // Plan changes to 2.0x from Feb 2025
      const plan2 = await BillingPlanService.create({
        name: "Premium",
        markupRate: 2.0,
        isDefault: false,
      });
      await TeamBillingPlanModel.create({
        team: new Types.ObjectId(teamId),
        plan: plan2._id,
        effectiveFrom: makeDate(2025, 2),
      });

      // Feb period: rate 2.0x. Cost $5 → billed $10. closingBalance = 85 - 10 = 75.
      const period2 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 2),
      );
      await insertCost(5, makeDate(2025, 2, 10));
      await BillingPeriodService.closePeriod(period2);

      // Old all-time impl: (10+5) * 2.0 = 30 → balance = 100 - 30 = 70 (WRONG)
      // Correct period-aware result: 75
      const balance = await TeamBillingService.getBalance(teamId);
      expect(balance).toBe(75);
    });

    it("credits field equals closingBalance plus new credits when a period is closed", async () => {
      await seedPlanBackdated(1.5);

      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 15));
      await insertCost(10, makeDate(2025, 1, 20));
      await BillingPeriodService.closePeriod(period);
      // closingBalance = 100 - (10 * 1.5) = 85

      // New credit after period close
      await insertCredit(40, makeDate(2025, 2, 5));

      const summary = await TeamBillingService.getBalanceSummary(teamId);
      expect(summary).not.toBeNull();
      // credits = closingBalance + newCredits = 85 + 40 = 125
      expect(summary!.credits).toBe(125);
      expect(summary!.balance).toBe(125);
    });

    it("plan change after period close: live costs use the new plan rate", async () => {
      const plan1 = await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });
      const TeamBillingPlanModel = mongoose.model("TeamBillingPlan");
      await TeamBillingPlanModel.create({
        team: new Types.ObjectId(teamId),
        plan: plan1._id,
        effectiveFrom: new Date(0),
      });

      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 15));
      await BillingPeriodService.closePeriod(period);
      // closingBalance = 100

      // New plan with 2x markup, effective Feb 2025
      const plan2 = await BillingPlanService.create({
        name: "Premium",
        markupRate: 2.0,
        isDefault: false,
      });
      await TeamBillingPlanModel.create({
        team: new Types.ObjectId(teamId),
        plan: plan2._id,
        effectiveFrom: makeDate(2025, 2),
      });

      // Live cost in Feb 2025 (after period1.endAt)
      await insertCost(10, makeDate(2025, 2, 10));

      const balance = await TeamBillingService.getBalance(teamId);
      // 100 (closingBalance) - (10 * 2.0) = 80
      expect(balance).toBe(80);
    });
  });

  describe("legacy baseline migration", () => {
    async function createTeam() {
      return TeamService.create({ name: "Billing Migration Team" });
    }

    async function getDb() {
      if (!mongoose.connection.db) {
        throw new Error("Database connection not available");
      }

      return mongoose.connection.db;
    }

    it("seeds one baseline ledger entry and balance from legacy rows", async () => {
      const team = await createTeam();
      await TeamBillingPlanService.assignPlan(
        team._id,
        (
          await BillingPlanService.create({
            name: "Standard",
            markupRate: 1.5,
            isDefault: true,
          })
        )._id,
      );

      await TeamCreditService.create({
        team: team._id,
        amount: 100,
        addedBy: userId,
      });
      await LlmCostService.create({
        team: team._id,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 100,
        outputTokens: 50,
        cost: 10,
        providerCost: 8,
      });

      const db = await getDb();
      await markLegacyBillingRowsMigration.up(db);
      await seedLegacyBillingBaselinesMigration.up(db);
      await seedLegacyBillingBaselinesMigration.up(db);

      const ledger = await BillingLedgerEntryService.findByTeam(team._id);
      expect(ledger).toHaveLength(1);
      expect(ledger[0].source).toBe("legacy-migration");
      expect(ledger[0].idempotencyKey).toBe(`legacy-balance:${team._id}`);
      expect(ledger[0].amount).toBe(85);

      const balance = await TeamBillingBalanceService.findByTeam(team._id);
      expect(balance?.availableBalance).toBe(85);
    });

    it("preserves existing ledger deltas when the balance is seeded late", async () => {
      const team = await createTeam();
      await TeamBillingPlanService.assignPlan(
        team._id,
        (
          await BillingPlanService.create({
            name: "Standard",
            markupRate: 1.5,
            isDefault: true,
          })
        )._id,
      );

      await TeamCreditService.create({
        team: team._id,
        amount: 100,
        addedBy: userId,
      });
      await LlmCostService.create({
        team: team._id,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 100,
        outputTokens: 50,
        cost: 10,
        providerCost: 8,
      });

      const db = await getDb();
      await markLegacyBillingRowsMigration.up(db);
      await db.collection("billingledgerentries").insertOne({
        team: new Types.ObjectId(team._id),
        direction: "credit",
        amount: 20,
        currency: "USD",
        source: "admin-credit",
        sourceId: "manual-topup-1",
        idempotencyKey: "admin-credit:manual-topup-1",
        createdAt: new Date(),
      });

      await seedLegacyBillingBaselinesMigration.up(db);

      const ledger = await BillingLedgerEntryService.findByTeam(team._id);
      expect(ledger).toHaveLength(2);

      const balance = await TeamBillingBalanceService.findByTeam(team._id);
      expect(balance?.availableBalance).toBe(105);
    });
  });
});
