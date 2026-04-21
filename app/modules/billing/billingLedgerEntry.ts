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
}
