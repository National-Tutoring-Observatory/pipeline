import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { BillingPlanService } from "~/modules/billing/billingPlan";
import applyBillingCredit from "~/modules/billing/services/applyBillingCredit.server";
import {
  TeamBillingBalanceModel,
  TeamBillingBalanceService,
} from "~/modules/billing/teamBillingBalance";
import { TeamBillingPlanService } from "~/modules/billing/teamBillingPlan";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import reconcileBillingBalances from "../reconcileBillingBalances";

describe("reconcileBillingBalances worker", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("repairs drifted balances across teams", async () => {
    const teamId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();
    const plan = await BillingPlanService.create({
      name: "Standard",
      markupRate: 1.5,
      isDefault: false,
    });
    await TeamBillingPlanService.assignPlan(teamId, plan._id);

    await applyBillingCredit({
      teamId,
      amount: 30,
      addedBy: userId,
      source: "admin-credit",
      sourceId: "admin-credit:test-worker",
      idempotencyKey: "admin-credit:test-worker",
    });

    await TeamBillingBalanceModel.updateOne(
      { team: teamId },
      { $set: { availableBalance: 5 } },
    );

    const result = await reconcileBillingBalances({ data: {} } as never);

    expect(result.status).toBe("OK");
    expect(result.stats.repaired).toBe(1);

    const balance = await TeamBillingBalanceService.findByTeam(teamId);
    expect(balance?.availableBalance).toBe(30);
  });
});
