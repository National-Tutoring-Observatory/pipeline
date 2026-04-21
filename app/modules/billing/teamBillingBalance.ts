import mongoose, { type ClientSession } from "mongoose";
import teamBillingBalanceSchema from "~/lib/schemas/teamBillingBalance.schema";
import type { TeamBillingBalance } from "./billing.types";
import getLegacyBalanceSummary from "./helpers/getLegacyBalanceSummary.server";

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
}
