import mongoose, { type ClientSession } from "mongoose";
import teamBillingBalanceSchema from "~/lib/schemas/teamBillingBalance.schema";
import type { TeamBillingBalance } from "./billing.types";
import getLegacyBalanceSummary from "./helpers/getLegacyBalanceSummary.server";
import reconcileTeamBillingBalance, {
  type ReconcileTeamBillingBalanceResult,
} from "./services/reconcileTeamBillingBalance.server";

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
    legacyBalance?: number,
  ): Promise<TeamBillingBalance> {
    const summary =
      legacyBalance === undefined
        ? await getLegacyBalanceSummary(teamId)
        : { balance: legacyBalance };

    const doc = await TeamBillingBalanceModel.findOneAndUpdate(
      { team: teamId },
      {
        $setOnInsert: {
          availableBalance: summary?.balance ?? 0,
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
  ): Promise<void> {
    await TeamBillingBalanceModel.findOneAndUpdate(
      { team: teamId },
      {
        $inc: { availableBalance: delta, version: 1 },
        $set: {
          updatedAt: new Date(),
          lastLedgerEntryAt: new Date(),
        },
      },
      { session, upsert: true },
    );
  }

  static async reconcileToSnapshot({
    teamId,
    expectedBalance,
    lastLedgerEntryAt,
    currentVersion,
  }: {
    teamId: string;
    expectedBalance: number;
    lastLedgerEntryAt: Date | null;
    currentVersion?: number;
  }): Promise<"updated" | "stale"> {
    const now = new Date();

    if (currentVersion === undefined) {
      const result = await TeamBillingBalanceModel.updateOne(
        { team: teamId },
        {
          $setOnInsert: {
            availableBalance: expectedBalance,
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
