import mongoose, { Types } from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BillingPeriodService } from "~/modules/billing/billingPeriod";
import { BillingPlanService } from "~/modules/billing/billingPlan";
import { TeamBillingPlanService } from "~/modules/billing/teamBillingPlan";
import { TeamCreditService } from "~/modules/billing/teamCredit";
import { LlmCostService } from "~/modules/llmCosts/llmCost";
import { TeamService } from "~/modules/teams/team";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import makeDate from "../../../test/helpers/makeDate";
import closeBillingPeriods from "../closeBillingPeriods";

// Importing these services registers their Mongoose schemas as a side effect,
// which is required because the worker imports them indirectly via billing modules.
void LlmCostService;
void TeamCreditService;

describe("closeBillingPeriods worker", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const teamId = new Types.ObjectId().toString();
  const otherTeamId = new Types.ObjectId().toString();

  async function seedPlan(team: string, markupRate = 1.5) {
    const plan = await BillingPlanService.create({
      name: "Standard",
      markupRate,
      isDefault: true,
    });
    const TeamBillingPlanModel = mongoose.model("TeamBillingPlan");
    await TeamBillingPlanModel.create({
      team: new Types.ObjectId(team),
      plan: plan._id,
      effectiveFrom: new Date(0),
    });
    return plan;
  }

  it("closes all stale open periods (endAt <= now)", async () => {
    await seedPlan(teamId);

    // Jan 2025 period — endAt = Feb 1 2025 (well in the past)
    const period = await BillingPeriodService.openPeriod(
      teamId,
      makeDate(2025, 1),
    );
    expect(period.status).toBe("open");

    const result = await closeBillingPeriods({ data: {} } as any);

    expect(result.status).toBe("OK");
    expect(result.stats.closed).toBe(1);

    const last = await BillingPeriodService.getLastClosedPeriod(teamId);
    expect(last).not.toBeNull();
    expect(last!.status).toBe("closed");
    expect(last!.closedAt).toBeDefined();
  });

  it("does not close an open period whose endAt is in the future (current month)", async () => {
    await seedPlan(teamId);

    // Current month period — endAt is next month, in the future
    await BillingPeriodService.openPeriod(teamId, new Date());

    const result = await closeBillingPeriods({ data: {} } as any);

    expect(result.stats.closed).toBe(0);
    const current = await BillingPeriodService.getCurrentPeriod(teamId);
    expect(current).not.toBeNull();
    expect(current!.status).toBe("open");
  });

  it("opens a new period for the current month after closing the stale one", async () => {
    await seedPlan(teamId);

    await BillingPeriodService.openPeriod(teamId, makeDate(2025, 1));

    await closeBillingPeriods({ data: {} } as any);

    const after = await BillingPeriodService.getCurrentPeriod(teamId);
    expect(after).not.toBeNull();
    expect(after!.status).toBe("open");
    // The new period should be for the current month, not the stale Jan 2025 one
    const expectedStartAt = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
    );
    expect(new Date(after!.startAt).getTime()).toBe(expectedStartAt.getTime());
  });

  it("does not open a period for a team with no billing plan", async () => {
    // No plan seeded for teamId
    const result = await closeBillingPeriods({ data: {} } as any);

    expect(result.status).toBe("OK");
    const current = await BillingPeriodService.getCurrentPeriod(teamId);
    expect(current).toBeNull();
  });

  it("does not create a duplicate if a current-month period already exists", async () => {
    await seedPlan(teamId);

    // Open current month manually before the job runs
    await BillingPeriodService.openPeriod(teamId, new Date());

    const result = await closeBillingPeriods({ data: {} } as any);
    expect(result.status).toBe("OK");

    // Should not throw or create a duplicate
    const BillingPeriodModel = mongoose.model("BillingPeriod");
    const count = await BillingPeriodModel.countDocuments({
      team: new Types.ObjectId(teamId),
      status: "open",
    });
    expect(count).toBe(1);
  });

  it("is idempotent: running twice produces the same state", async () => {
    await seedPlan(teamId);
    await BillingPeriodService.openPeriod(teamId, makeDate(2025, 1));

    await closeBillingPeriods({ data: {} } as any);
    const result2 = await closeBillingPeriods({ data: {} } as any);

    expect(result2.status).toBe("OK");
    // Second run: nothing stale to close, current period already exists so 0 newly opened
    expect(result2.stats.closed).toBe(0);
    expect(result2.stats.opened).toBe(0);
  });

  it("handles multiple teams independently", async () => {
    await seedPlan(teamId);
    await seedPlan(otherTeamId);

    await BillingPeriodService.openPeriod(teamId, makeDate(2025, 1));
    await BillingPeriodService.openPeriod(otherTeamId, makeDate(2025, 2));

    const result = await closeBillingPeriods({ data: {} } as any);

    expect(result.stats.closed).toBe(2);

    const team1Closed = await BillingPeriodService.getLastClosedPeriod(teamId);
    const team2Closed =
      await BillingPeriodService.getLastClosedPeriod(otherTeamId);
    expect(team1Closed!.status).toBe("closed");
    expect(team2Closed!.status).toBe("closed");
  });

  it("closes multiple stale periods for the same team in chronological order", async () => {
    await seedPlan(teamId);

    const p1 = await BillingPeriodService.openPeriod(teamId, makeDate(2025, 1));
    await BillingPeriodService.closePeriod(p1);

    const p2 = await BillingPeriodService.openPeriod(teamId, makeDate(2025, 2));
    await BillingPeriodService.closePeriod(p2);

    // Manually create a stale open period bypassing service validation
    const BillingPeriodModel = mongoose.model("BillingPeriod");
    const plan = await mongoose
      .model("BillingPlan")
      .findOne({ name: "Standard" });
    await BillingPeriodModel.create({
      team: new Types.ObjectId(teamId),
      plan: plan!._id,
      markupRate: 1.5,
      startAt: makeDate(2025, 3),
      endAt: makeDate(2025, 4),
      status: "open",
    });

    const result = await closeBillingPeriods({ data: {} } as any);
    expect(result.stats.closed).toBe(1);

    const last = await BillingPeriodService.getLastClosedPeriod(teamId);
    expect(new Date(last!.startAt).getUTCMonth()).toBe(2); // March (0-indexed)
  });

  it("returns PARTIAL status when a period fails to close", async () => {
    await seedPlan(teamId);
    await seedPlan(otherTeamId);

    await BillingPeriodService.openPeriod(teamId, makeDate(2025, 1));
    await BillingPeriodService.openPeriod(otherTeamId, makeDate(2025, 1));

    const original =
      BillingPeriodService.closePeriod.bind(BillingPeriodService);
    let calls = 0;
    vi.spyOn(BillingPeriodService, "closePeriod").mockImplementation(
      async (...args) => {
        calls++;
        if (calls === 1) throw new Error("Simulated failure");
        return original(...args);
      },
    );

    const result = await closeBillingPeriods({ data: {} } as any);

    expect(result.status).toBe("PARTIAL");
    expect(result.stats.closeFailed).toBe(1);
    expect(result.stats.closed).toBe(1);
  });

  describe("planless team fallback", () => {
    it("assigns default plan to a team with no billing plan", async () => {
      await BillingPlanService.create({
        name: "Standard",
        markupRate: 1.5,
        isDefault: true,
      });
      const team = await TeamService.create({ name: "Planless Team" });

      const before = await TeamBillingPlanService.getEffectivePlan(team._id);
      expect(before).toBeNull();

      const result = await closeBillingPeriods({ data: {} } as any);
      expect(result.stats.assigned).toBe(1);

      const after = await TeamBillingPlanService.getEffectivePlan(team._id);
      expect(after).not.toBeNull();
      expect(after!.name).toBe("Standard");
    });

    it("does not reassign a plan to teams that already have one", async () => {
      await seedPlan(teamId);

      const result = await closeBillingPeriods({ data: {} } as any);
      expect(result.stats.assigned).toBe(0);
    });

    it("does nothing when no default plan exists", async () => {
      await BillingPlanService.create({
        name: "Custom",
        markupRate: 2.0,
        isDefault: false,
      });
      const team = await TeamService.create({ name: "Planless Team" });

      const result = await closeBillingPeriods({ data: {} } as any);
      expect(result.stats.assigned).toBe(0);

      const plan = await TeamBillingPlanService.getEffectivePlan(team._id);
      expect(plan).toBeNull();
    });

    it("does not count teams with only a future pending plan as planless", async () => {
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
      // Assign plan1 now, then schedule plan2 for next month
      await TeamBillingPlanService.assignPlan(teamId, plan1._id);
      await TeamBillingPlanService.assignPlan(teamId, plan2._id);

      const result = await closeBillingPeriods({ data: {} } as any);
      expect(result.stats.assigned).toBe(0);
    });
  });
});
