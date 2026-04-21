import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { AuditService } from "~/modules/audits/audit";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import applyBillingCredit from "../services/applyBillingCredit.server";
import reconcileTeamBillingBalance from "../services/reconcileTeamBillingBalance.server";
import {
  TeamBillingBalanceModel,
  TeamBillingBalanceService,
} from "../teamBillingBalance";

describe("reconcileTeamBillingBalance", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("repairs a drifted balance from the ledger snapshot", async () => {
    const teamId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();

    await applyBillingCredit({
      teamId,
      amount: 25,
      addedBy: userId,
      source: "admin-credit",
      sourceId: "admin-credit:test-repair",
      idempotencyKey: "admin-credit:test-repair",
    });

    await TeamBillingBalanceModel.updateOne(
      { team: teamId },
      { $set: { availableBalance: 10 } },
    );

    const result = await reconcileTeamBillingBalance(teamId);

    expect(result.status).toBe("repaired");
    expect(result.expectedBalance).toBe(25);
    expect(result.actualBalance).toBe(10);
    expect(result.driftAmount).toBe(15);

    const balance = await TeamBillingBalanceService.findByTeam(teamId);
    expect(balance?.availableBalance).toBe(25);

    const audits = await AuditService.find({
      match: { action: "RECONCILE_TEAM_BILLING_BALANCE" },
    });
    expect(audits).toHaveLength(1);
    expect(audits[0].context.teamId).toBe(teamId);
  });

  it("returns already-aligned when balance matches ledger", async () => {
    const teamId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();

    await applyBillingCredit({
      teamId,
      amount: 25,
      addedBy: userId,
      source: "admin-credit",
      sourceId: "admin-credit:test-aligned",
      idempotencyKey: "admin-credit:test-aligned",
    });

    const result = await reconcileTeamBillingBalance(teamId);

    expect(result.status).toBe("already-aligned");
    expect(result.expectedBalance).toBe(25);
    expect(result.actualBalance).toBe(25);

    const audits = await AuditService.find({
      match: { action: "RECONCILE_TEAM_BILLING_BALANCE" },
    });
    expect(audits).toHaveLength(0);
  });

  it("creates a missing balance document from ledger", async () => {
    const teamId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();

    await applyBillingCredit({
      teamId,
      amount: 40,
      addedBy: userId,
      source: "admin-credit",
      sourceId: "admin-credit:test-missing-balance",
      idempotencyKey: "admin-credit:test-missing-balance",
    });

    await TeamBillingBalanceModel.deleteOne({ team: teamId });

    const result = await reconcileTeamBillingBalance(teamId);

    expect(result.status).toBe("repaired");
    expect(result.expectedBalance).toBe(40);
    expect(result.actualBalance).toBe(0);

    const balance = await TeamBillingBalanceService.findByTeam(teamId);
    expect(balance?.availableBalance).toBe(40);
  });
});
