import mongoose, { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import makeDate from "../../../../test/helpers/makeDate";
import { LlmCostService } from "../../llmCosts/llmCost";
import { BillingPeriodService } from "../billingPeriod";
import { BillingPlanService } from "../billingPlan";
import { TeamBillingPlanService } from "../teamBillingPlan";
import { TeamCreditService } from "../teamCredit";

describe("BillingPeriodService", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  const teamId = new Types.ObjectId().toString();
  const otherTeamId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  async function seedPlan(markupRate = 1.5) {
    const plan = await BillingPlanService.create({
      name: "Standard",
      markupRate,
      isDefault: true,
    });
    // Backdate to epoch so the plan is effective for any historical period
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

  async function insertCost(cost: number, createdAt: Date, forTeam = teamId) {
    const LlmCostModel = mongoose.model("LlmCost");
    await LlmCostModel.create({
      team: new Types.ObjectId(forTeam),
      model: "claude-opus",
      source: "annotation:per-session",
      inputTokens: 100,
      outputTokens: 50,
      cost,
      providerCost: cost * 0.8,
      createdAt,
    });
  }

  describe("openPeriod", () => {
    it("creates an open period with correct startAt and endAt", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 3),
      );

      expect(period.status).toBe("open");
      expect(new Date(period.startAt).getTime()).toBe(
        makeDate(2025, 3, 1).getTime(),
      );
      expect(new Date(period.endAt).getTime()).toBe(
        makeDate(2025, 4, 1).getTime(),
      );
    });

    it("normalises startAt to 1st of the month regardless of input day", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 3, 15),
      );

      expect(new Date(period.startAt).getTime()).toBe(
        makeDate(2025, 3, 1).getTime(),
      );
    });

    it("snapshots the markupRate from the plan at open time", async () => {
      await seedPlan(2.0);
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 3),
      );

      expect(period.markupRate).toBe(2.0);
    });

    it("throws when no plan is assigned to the team", async () => {
      await expect(
        BillingPeriodService.openPeriod(teamId, makeDate(2025, 3)),
      ).rejects.toThrow();
    });

    it("throws on duplicate open for the same team and month", async () => {
      await seedPlan();
      await BillingPeriodService.openPeriod(teamId, makeDate(2025, 3));

      await expect(
        BillingPeriodService.openPeriod(teamId, makeDate(2025, 3)),
      ).rejects.toThrow();
    });
  });

  describe("closePeriod", () => {
    // For single-period tests that just need credits/costs in range, we open
    // the CURRENT month so records created with Date.now() are within the window.

    it("locks rawCost, billedAmount, and closingBalance on close", async () => {
      await seedPlan(1.5);
      const period = await BillingPeriodService.openPeriod(teamId, new Date());

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

      const closed = await BillingPeriodService.closePeriod(period);

      expect(closed.status).toBe("closed");
      expect(closed.rawCost).toBe(10);
      expect(closed.billedAmount).toBe(15);
      expect(closed.closingBalance).toBe(85);
      expect(closed.closedAt).toBeDefined();
    });

    it("first period with no costs: closingBalance equals all credits", async () => {
      await seedPlan(1.5);
      const period = await BillingPeriodService.openPeriod(teamId, new Date());

      await TeamCreditService.create({
        team: teamId,
        amount: 50,
        addedBy: userId,
      });
      await TeamCreditService.create({
        team: teamId,
        amount: 30,
        addedBy: userId,
      });

      const closed = await BillingPeriodService.closePeriod(period);

      expect(closed.rawCost).toBe(0);
      expect(closed.billedAmount).toBe(0);
      expect(closed.closingBalance).toBe(80);
    });

    it("credits added after endAt are excluded from closingBalance", async () => {
      await seedPlan(1.5);
      // Period in Jan 2025 — endAt = 2025-02-01
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );

      // In-window credit (Jan 15) — included
      await insertCredit(50, makeDate(2025, 1, 15));
      // Post-endAt credit (March, created with default Date.now()) — excluded
      await TeamCreditService.create({
        team: teamId,
        amount: 200,
        addedBy: userId,
      });

      const closed = await BillingPeriodService.closePeriod(period);

      expect(closed.closingBalance).toBe(50);
    });

    it("costs before startAt are excluded from rawCost", async () => {
      await seedPlan(1.5);
      const period = await BillingPeriodService.openPeriod(teamId, new Date());
      const now = new Date();
      const prevMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15),
      );

      await insertCredit(100, now);
      // Cost before period.startAt — excluded
      await insertCost(999, prevMonth);

      const closed = await BillingPeriodService.closePeriod(period);

      expect(closed.rawCost).toBe(0);
      expect(closed.closingBalance).toBe(100);
    });

    it("costs on or after endAt are excluded from rawCost", async () => {
      await seedPlan(1.5);
      const period = await BillingPeriodService.openPeriod(teamId, new Date());
      const now = new Date();
      const nextMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 15),
      );

      await insertCredit(100, now);
      // Cost after endAt — excluded
      await insertCost(999, nextMonth);

      const closed = await BillingPeriodService.closePeriod(period);

      expect(closed.rawCost).toBe(0);
      expect(closed.closingBalance).toBe(100);
    });

    it("uses markupRate locked at open time, not the current plan rate", async () => {
      const plan1 = await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });
      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      // Open period — locks markupRate = 1.5
      const period = await BillingPeriodService.openPeriod(teamId, new Date());

      // Change plan — takes effect next month, shouldn't affect this period
      const plan2 = await BillingPlanService.create({
        name: "Premium",
        markupRate: 3.0,
        isDefault: false,
      });
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      await LlmCostService.create({
        team: teamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 100,
        outputTokens: 50,
        cost: 10,
        providerCost: 8,
      });

      const closed = await BillingPeriodService.closePeriod(period);

      // Should use 1.5 (locked at open), not 3.0 (current plan)
      expect(period.markupRate).toBe(1.5);
      expect(closed.billedAmount).toBe(15);
    });

    it("builds closingBalance incrementally from the prior period", async () => {
      await seedPlan(1.5);

      // Period 1: Jan 2025
      const period1 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await insertCredit(100, makeDate(2025, 1, 15));
      await insertCost(10, makeDate(2025, 1, 20));
      const closed1 = await BillingPeriodService.closePeriod(period1);
      // closingBalance = 100 - (10 * 1.5) = 85
      expect(closed1.closingBalance).toBe(85);

      // Period 2: Feb 2025
      const period2 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 2),
      );
      // Credit and cost explicitly in Feb window
      await insertCredit(50, makeDate(2025, 2, 15));
      await insertCost(20, makeDate(2025, 2, 20));
      const closed2 = await BillingPeriodService.closePeriod(period2);
      // closingBalance = 85 + 50 - (20 * 1.5) = 85 + 50 - 30 = 105
      expect(closed2.rawCost).toBe(20);
      expect(closed2.billedAmount).toBe(30);
      expect(closed2.closingBalance).toBe(105);
    });

    it("credits in prior periods are not double-counted in later periods", async () => {
      await seedPlan(1.5);

      const period1 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      // Credit in Jan only
      await insertCredit(100, makeDate(2025, 1, 15));
      await BillingPeriodService.closePeriod(period1);

      const period2 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 2),
      );
      // No new credits in Feb
      const closed2 = await BillingPeriodService.closePeriod(period2);

      // Feb gets no new credits (the Jan credit was already counted in period1)
      expect(closed2.closingBalance).toBe(100);
    });

    it("closedAt reflects the time close ran, not the period endAt", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(teamId, new Date());
      const before = Date.now();
      const closed = await BillingPeriodService.closePeriod(period);
      const after = Date.now();

      const closedAtMs = new Date(closed.closedAt!).getTime();
      expect(closedAtMs).toBeGreaterThanOrEqual(before);
      expect(closedAtMs).toBeLessThanOrEqual(after);
      expect(closedAtMs).not.toBe(new Date(period.endAt).getTime());
    });

    it("is idempotent when closing an already-closed period", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(teamId, new Date());
      const first = await BillingPeriodService.closePeriod(period);
      const second = await BillingPeriodService.closePeriod(period);

      expect(second.status).toBe("closed");
      expect(second._id).toBe(first._id);
      expect(second.closingBalance).toBe(first.closingBalance);
      expect(second.closedAt).toEqual(first.closedAt);
    });

    it("excludes costs from other teams", async () => {
      await seedPlan(1.5);
      const period = await BillingPeriodService.openPeriod(teamId, new Date());

      await TeamCreditService.create({
        team: teamId,
        amount: 100,
        addedBy: userId,
      });
      await LlmCostService.create({
        team: otherTeamId,
        model: "claude-opus",
        source: "annotation:per-session",
        inputTokens: 100,
        outputTokens: 50,
        cost: 999,
        providerCost: 800,
      });

      const closed = await BillingPeriodService.closePeriod(period);

      expect(closed.rawCost).toBe(0);
      expect(closed.closingBalance).toBe(100);
    });
  });

  describe("getCurrentPeriod", () => {
    it("returns null when no periods exist", async () => {
      const result = await BillingPeriodService.getCurrentPeriod(teamId);
      expect(result).toBeNull();
    });

    it("returns the open period", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );

      const result = await BillingPeriodService.getCurrentPeriod(teamId);
      expect(result?._id).toBe(period._id);
      expect(result?.status).toBe("open");
    });

    it("returns null when only a closed period exists", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await BillingPeriodService.closePeriod(period);

      const result = await BillingPeriodService.getCurrentPeriod(teamId);
      expect(result).toBeNull();
    });

    it("returns the open period when a closed one also exists", async () => {
      await seedPlan();
      const period1 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await BillingPeriodService.closePeriod(period1);
      const period2 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 2),
      );

      const result = await BillingPeriodService.getCurrentPeriod(teamId);
      expect(result?._id).toBe(period2._id);
    });
  });

  describe("getLastClosedPeriod", () => {
    it("returns null when no periods exist", async () => {
      const result = await BillingPeriodService.getLastClosedPeriod(teamId);
      expect(result).toBeNull();
    });

    it("returns null when only an open period exists", async () => {
      await seedPlan();
      await BillingPeriodService.openPeriod(teamId, makeDate(2025, 1));

      const result = await BillingPeriodService.getLastClosedPeriod(teamId);
      expect(result).toBeNull();
    });

    it("returns the closed period", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await BillingPeriodService.closePeriod(period);

      const result = await BillingPeriodService.getLastClosedPeriod(teamId);
      expect(result?._id).toBe(period._id);
    });

    it("returns the most recently closed when multiple exist", async () => {
      await seedPlan();
      const period1 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      await BillingPeriodService.closePeriod(period1);
      const period2 = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 2),
      );
      await BillingPeriodService.closePeriod(period2);

      const result = await BillingPeriodService.getLastClosedPeriod(teamId);
      expect(result?._id).toBe(period2._id);
    });
  });

  describe("findStaleOpenPeriods", () => {
    it("includes a period whose endAt equals asOf exactly", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      // endAt for Jan 2025 is Feb 1 00:00:00.000 UTC
      const asOf = makeDate(2025, 2, 1);

      const stale = await BillingPeriodService.findStaleOpenPeriods(asOf);
      expect(stale.some((p) => p._id === period._id)).toBe(true);
    });

    it("excludes a period whose endAt is one millisecond in the future", async () => {
      await seedPlan();
      const period = await BillingPeriodService.openPeriod(
        teamId,
        makeDate(2025, 1),
      );
      // One millisecond before Feb 1 00:00:00.000 UTC
      const asOf = new Date(makeDate(2025, 2, 1).getTime() - 1);

      const stale = await BillingPeriodService.findStaleOpenPeriods(asOf);
      expect(stale.some((p) => p._id === period._id)).toBe(false);
    });
  });

  describe("findOrOpenCurrentPeriod", () => {
    it("returns existing open period without creating a duplicate", async () => {
      await seedPlan();
      const existing = await BillingPeriodService.openPeriod(
        teamId,
        new Date(),
      );

      const result = await BillingPeriodService.findOrOpenCurrentPeriod(
        teamId,
        new Date(),
      );
      expect(result?._id).toBe(existing._id);
    });

    it("opens a new period when none exists and plan is assigned", async () => {
      await seedPlan();

      const result = await BillingPeriodService.findOrOpenCurrentPeriod(
        teamId,
        new Date(),
      );
      expect(result).not.toBeNull();
      expect(result?.status).toBe("open");
    });

    it("returns null when no plan is assigned", async () => {
      const result = await BillingPeriodService.findOrOpenCurrentPeriod(
        teamId,
        new Date(),
      );
      expect(result).toBeNull();
    });
  });
});
