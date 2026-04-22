import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import billingLedgerEntrySchema from "~/lib/schemas/billingLedgerEntry.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
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

  static async find(options?: FindOptions): Promise<BillingLedgerEntry[]> {
    const match = options?.match || {};
    let query = BillingLedgerEntryModel.find(match);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    const docs = await query;
    return docs.map((doc) => this.toBillingLedgerEntry(doc));
  }

  static async count(match: Record<string, unknown> = {}): Promise<number> {
    return BillingLedgerEntryModel.countDocuments(match);
  }

  static async findCreditByStripeSession(
    stripeSessionId: string,
  ): Promise<BillingLedgerEntry | null> {
    const doc = await BillingLedgerEntryModel.findOne({
      direction: "credit",
      source: "stripe-topup",
      sourceId: stripeSessionId,
    });

    return doc ? this.toBillingLedgerEntry(doc) : null;
  }

  static async paginate({
    match,
    sort,
    page,
    pageSize,
  }: PaginateProps): Promise<{
    data: BillingLedgerEntry[];
    count: number;
    totalPages: number;
  }> {
    const pagination = getPaginationParams(page, pageSize);

    let query = BillingLedgerEntryModel.find(match)
      .skip(pagination.skip)
      .limit(pagination.limit);

    if (sort) {
      query = query.sort(sort);
    }

    const [results, count] = await Promise.all([
      query.then((docs) => docs.map((doc) => this.toBillingLedgerEntry(doc))),
      this.count(match),
    ]);

    return {
      data: results,
      count,
      totalPages: getTotalPages(count, pageSize),
    };
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

  static async sumLedgerTotalsByTeam(teamId: string): Promise<{
    credits: number;
    rawCosts: number;
    billedCosts: number;
  }> {
    const result = await BillingLedgerEntryModel.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId) } },
      {
        $group: {
          _id: null,
          credits: {
            $sum: {
              $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0],
            },
          },
          rawCosts: {
            $sum: {
              $cond: [{ $eq: ["$direction", "debit"] }, "$rawAmount", 0],
            },
          },
          billedCosts: {
            $sum: {
              $cond: [{ $eq: ["$direction", "debit"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    return {
      credits: result[0]?.credits ?? 0,
      rawCosts: result[0]?.rawCosts ?? 0,
      billedCosts: result[0]?.billedCosts ?? 0,
    };
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

  static async aggregate<T = Record<string, unknown>>(
    pipeline: mongoose.PipelineStage[],
  ): Promise<T[]> {
    return BillingLedgerEntryModel.aggregate(pipeline) as Promise<T[]>;
  }
}
