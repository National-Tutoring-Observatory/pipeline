import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { BillingLedgerEntryModel } from "../billingLedgerEntry";
import { BillingPlanService } from "../billingPlan";
import applyBillingCredit from "../services/applyBillingCredit.server";
import applyBillingDebit from "../services/applyBillingDebit.server";
import getBillingReportingSummary from "../services/getBillingReportingSummary.server";
import { TeamBillingPlanService } from "../teamBillingPlan";

describe("getBillingReportingSummary", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  async function seedPlan(teamId: string) {
    const plan = await BillingPlanService.create({
      name: "Standard",
      markupRate: 1.5,
      isDefault: false,
    });
    await TeamBillingPlanService.assignPlan(teamId, plan._id);
    return plan;
  }

  it("returns ledger-based balance summary", async () => {
    const teamId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();
    await seedPlan(teamId);

    await applyBillingCredit({
      teamId,
      amount: 100,
      addedBy: userId,
      source: "admin-credit",
      sourceId: "admin-credit:test-summary",
      idempotencyKey: "admin-credit:test-summary",
    });

    await applyBillingDebit({
      teamId,
      model: "claude-opus",
      source: "annotation:per-session",
      sourceId: "session-1",
      inputTokens: 100,
      outputTokens: 50,
      rawAmount: 10,
      providerCost: 8,
      idempotencyKey: "llm-cost:test-summary",
    });

    const summary = await getBillingReportingSummary(teamId);

    expect(summary.balanceSummary).not.toBeNull();
    expect(summary.balanceSummary?.balance).toBe(85);
    expect(summary.balanceSummary?.credits).toBe(100);
    expect(summary.balanceSummary?.costs).toBe(10);
    expect(summary.balanceSummary?.markedUpCosts).toBe(15);
  });

  it("builds monthly closed period reporting from debit ledger entries", async () => {
    const teamId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();
    await seedPlan(teamId);

    await applyBillingCredit({
      teamId,
      amount: 200,
      addedBy: userId,
      source: "admin-credit",
      sourceId: "admin-credit:test-periods",
      idempotencyKey: "admin-credit:test-periods",
    });

    await applyBillingDebit({
      teamId,
      model: "claude-opus",
      source: "annotation:per-session",
      sourceId: "session-jan",
      inputTokens: 100,
      outputTokens: 50,
      rawAmount: 10,
      providerCost: 8,
      idempotencyKey: "llm-cost:test-periods-jan",
    });
    await BillingLedgerEntryModel.updateOne(
      { idempotencyKey: "llm-cost:test-periods-jan" },
      { $set: { createdAt: new Date("2025-01-15T00:00:00.000Z") } },
    );

    await applyBillingDebit({
      teamId,
      model: "claude-opus",
      source: "annotation:per-session",
      sourceId: "session-feb",
      inputTokens: 100,
      outputTokens: 50,
      rawAmount: 20,
      providerCost: 16,
      idempotencyKey: "llm-cost:test-periods-feb",
    });
    await BillingLedgerEntryModel.updateOne(
      { idempotencyKey: "llm-cost:test-periods-feb" },
      { $set: { createdAt: new Date("2025-02-15T00:00:00.000Z") } },
    );

    const summary = await getBillingReportingSummary(teamId);

    expect(summary.closedPeriods).toHaveLength(2);
    expect(summary.closedPeriods[0].billedAmount).toBe(30);
    expect(summary.closedPeriods[1].billedAmount).toBe(15);
  });
});
