import mongoose, { type ClientSession } from "mongoose";
import teamBillingBalanceSchema from "~/lib/schemas/teamBillingBalance.schema";
import type { RunningTotals, TeamBillingBalance } from "./billing.types";
import { balanceGauge } from "./helpers/billingMetrics";
import reconcileTeamBillingBalance, {
  type ReconcileTeamBillingBalanceResult,
} from "./services/reconcileTeamBillingBalance.server";

function definedTotals(totals?: RunningTotals): Record<string, number> {
  const out: Record<string, number> = {};
  if (totals?.totalCredits !== undefined)
    out.totalCredits = totals.totalCredits;
  if (totals?.totalRawCosts !== undefined)
    out.totalRawCosts = totals.totalRawCosts;
  if (totals?.totalBilledCosts !== undefined)
    out.totalBilledCosts = totals.totalBilledCosts;
  return out;
}

export const TeamBillingBalanceModel =
  mongoose.models.TeamBillingBalance ||
  mongoose.model("TeamBillingBalance", teamBillingBalanceSchema);

export class TeamBillingBalanceService {
  private static toTeamBillingBalance(
    doc: mongoose.Document,
  ): TeamBillingBalance {
    return doc.toJSON({ flattenObjectIds: true }) as TeamBillingBalance;
  }

  static async findByTeam(teamId: string): Promise<TeamBillingBalance | null> {
    const doc = await TeamBillingBalanceModel.findOne({ team: teamId });
    return doc ? this.toTeamBillingBalance(doc) : null;
  }

  static async findAllTeamIds(): Promise<string[]> {
    const ids = await TeamBillingBalanceModel.distinct("team");
    return ids.map((id: mongoose.Types.ObjectId) => id.toString());
  }

  static async deleteByTeam(teamId: string): Promise<void> {
    await TeamBillingBalanceModel.deleteOne({ team: teamId });
  }

  static async ensureInitialized(
    teamId: string,
    initialBalance?: number,
  ): Promise<TeamBillingBalance> {
    const doc = await TeamBillingBalanceModel.findOneAndUpdate(
      { team: teamId },
      {
        $setOnInsert: {
          availableBalance: initialBalance ?? 0,
          totalCredits: 0,
          totalRawCosts: 0,
          totalBilledCosts: 0,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    return this.toTeamBillingBalance(doc);
  }

  static async applyDelta(
    teamId: string,
    delta: number,
    session: ClientSession,
    runningTotals?: RunningTotals,
  ): Promise<void> {
    const inc: Record<string, number> = {
      availableBalance: delta,
      version: 1,
      totalCredits: runningTotals?.totalCredits ?? 0,
      totalRawCosts: runningTotals?.totalRawCosts ?? 0,
      totalBilledCosts: runningTotals?.totalBilledCosts ?? 0,
    };

    const doc = await TeamBillingBalanceModel.findOneAndUpdate(
      { team: teamId },
      {
        $inc: inc,
        $set: {
          updatedAt: new Date(),
          lastLedgerEntryAt: new Date(),
        },
      },
      { session, upsert: true, new: true },
    );

    if (doc) {
      balanceGauge.record(doc.availableBalance, { team: teamId });
    }
  }

  static async reconcileToSnapshot({
    teamId,
    expectedBalance,
    lastLedgerEntryAt,
    currentVersion,
    runningTotals,
  }: {
    teamId: string;
    expectedBalance: number;
    lastLedgerEntryAt: Date | null;
    currentVersion?: number;
    runningTotals?: RunningTotals;
  }): Promise<"updated" | "stale"> {
    const now = new Date();
    const totalsSet = definedTotals(runningTotals);

    if (currentVersion === undefined) {
      const result = await TeamBillingBalanceModel.updateOne(
        { team: teamId },
        {
          $setOnInsert: {
            availableBalance: expectedBalance,
            ...totalsSet,
            lastLedgerEntryAt: lastLedgerEntryAt ?? undefined,
            updatedAt: now,
            version: 0,
          },
        },
        { upsert: true },
      );

      return result.upsertedCount > 0 ? "updated" : "stale";
    }

    const result = await TeamBillingBalanceModel.updateOne(
      { team: teamId, version: currentVersion },
      {
        $set: {
          availableBalance: expectedBalance,
          ...totalsSet,
          lastLedgerEntryAt: lastLedgerEntryAt ?? undefined,
          updatedAt: now,
        },
        $inc: { version: 1 },
      },
    );

    return result.modifiedCount > 0 ? "updated" : "stale";
  }

  static async reconcile(
    teamId: string,
  ): Promise<ReconcileTeamBillingBalanceResult> {
    return reconcileTeamBillingBalance(teamId);
  }
}
