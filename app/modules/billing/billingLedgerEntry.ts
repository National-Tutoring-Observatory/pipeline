import mongoose from "mongoose";
import billingLedgerEntrySchema from "~/lib/schemas/billingLedgerEntry.schema";
import type { BillingLedgerEntry } from "./billing.types";

export const BillingLedgerEntryModel =
  mongoose.models.BillingLedgerEntry ||
  mongoose.model("BillingLedgerEntry", billingLedgerEntrySchema);

export class BillingLedgerEntryService {
  private static toBillingLedgerEntry(
    doc: mongoose.Document,
  ): BillingLedgerEntry {
    return doc.toJSON({ flattenObjectIds: true }) as BillingLedgerEntry;
  }

  static async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<BillingLedgerEntry | null> {
    const doc = await BillingLedgerEntryModel.findOne({ idempotencyKey });
    return doc ? this.toBillingLedgerEntry(doc) : null;
  }

  static async findByTeam(teamId: string): Promise<BillingLedgerEntry[]> {
    const docs = await BillingLedgerEntryModel.find({ team: teamId }).sort({
      createdAt: -1,
    });
    return docs.map((doc) => this.toBillingLedgerEntry(doc));
  }

  static async findAllTeamIds(): Promise<string[]> {
    const ids = await BillingLedgerEntryModel.distinct("team");
    return ids.map((id: mongoose.Types.ObjectId) => id.toString());
  }

  static async sumCreditsByTeam(teamId: string): Promise<number> {
    const result = await BillingLedgerEntryModel.aggregate([
      {
        $match: {
          team: new mongoose.Types.ObjectId(teamId),
          direction: "credit",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async sumDebitsByTeam(teamId: string): Promise<number> {
    const result = await BillingLedgerEntryModel.aggregate([
      {
        $match: {
          team: new mongoose.Types.ObjectId(teamId),
          direction: "debit",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async getBalanceSnapshotByTeam(teamId: string): Promise<{
    expectedBalance: number;
    creditTotal: number;
    debitTotal: number;
    lastLedgerEntryAt: Date | null;
  }> {
    const result = await BillingLedgerEntryModel.aggregate([
      {
        $match: {
          team: new mongoose.Types.ObjectId(teamId),
        },
      },
      {
        $group: {
          _id: null,
          creditTotal: {
            $sum: {
              $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0],
            },
          },
          debitTotal: {
            $sum: {
              $cond: [{ $eq: ["$direction", "debit"] }, "$amount", 0],
            },
          },
          lastLedgerEntryAt: { $max: "$createdAt" },
        },
      },
    ]);

    const creditTotal = result[0]?.creditTotal ?? 0;
    const debitTotal = result[0]?.debitTotal ?? 0;

    return {
      expectedBalance: creditTotal - debitTotal,
      creditTotal,
      debitTotal,
      lastLedgerEntryAt: result[0]?.lastLedgerEntryAt ?? null,
    };
  }
}
