import mongoose from "mongoose";
import billingPeriodSchema from "~/lib/schemas/billingPeriod.schema";
import withTransaction from "~/lib/withTransaction";
import type { BillingPeriod } from "./billing.types";
import { BillingLedgerEntryModel } from "./billingLedgerEntry";
import { startOfMonth, startOfNextMonth } from "./helpers/periodDates";
import { TeamBillingPlanService } from "./teamBillingPlan";

class NoPlanError extends Error {
  constructor(teamId: string, asOf: Date) {
    super(
      `No billing plan assigned to team ${teamId} at ${asOf.toISOString()}`,
    );
    this.name = "NoPlanError";
  }
}

const BillingPeriodModel =
  mongoose.models.BillingPeriod ||
  mongoose.model("BillingPeriod", billingPeriodSchema);

export class BillingPeriodService {
  private static toBillingPeriod(doc: mongoose.Document): BillingPeriod {
    return doc.toJSON({ flattenObjectIds: true }) as BillingPeriod;
  }

  static async openPeriod(
    teamId: string,
    monthDate: Date,
  ): Promise<BillingPeriod> {
    const startAt = startOfMonth(monthDate);
    const endAt = startOfNextMonth(monthDate);

    const plan = await TeamBillingPlanService.getEffectivePlan(teamId, startAt);
    if (!plan) {
      throw new NoPlanError(teamId, startAt);
    }

    const existing = await BillingPeriodModel.findOne({
      team: teamId,
      startAt,
    });
    if (existing) {
      throw new Error(
        `A billing period already exists for team ${teamId} starting ${startAt.toISOString()}`,
      );
    }

    const doc = await BillingPeriodModel.create({
      team: teamId,
      plan: plan._id,
      markupRate: plan.markupRate,
      startAt,
      endAt,
      status: "open",
    });
    return this.toBillingPeriod(doc);
  }

  static async closePeriod(period: BillingPeriod): Promise<BillingPeriod> {
    return withTransaction(async (session) => {
      const teamObjId = new mongoose.Types.ObjectId(period.team);
      const startAt = new Date(period.startAt);
      const endAt = new Date(period.endAt);

      const prevClosed = await BillingPeriodModel.findOne({
        team: teamObjId,
        status: "closed",
        endAt: { $lte: startAt },
      })
        .sort({ endAt: -1 })
        .session(session);

      const [periodTotals] = await BillingLedgerEntryModel.aggregate([
        {
          $match: {
            team: teamObjId,
            createdAt: { $gte: startAt, $lt: endAt },
          },
        },
        {
          $group: {
            _id: null,
            creditsAdded: {
              $sum: {
                $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0],
              },
            },
            rawCost: {
              $sum: {
                $cond: [{ $eq: ["$direction", "debit"] }, "$rawAmount", 0],
              },
            },
            billedAmount: {
              $sum: {
                $cond: [{ $eq: ["$direction", "debit"] }, "$amount", 0],
              },
            },
          },
        },
      ]).session(session);

      const openingBalance = prevClosed?.closingBalance ?? 0;
      const creditsAdded = periodTotals?.creditsAdded ?? 0;
      const rawCost = periodTotals?.rawCost ?? 0;
      const billedAmount = periodTotals?.billedAmount ?? 0;
      const closingBalance = openingBalance + creditsAdded - billedAmount;

      const updated = await BillingPeriodModel.findOneAndUpdate(
        { _id: period._id, status: "open" },
        {
          $set: {
            status: "closed",
            openingBalance,
            creditsAdded,
            rawCost,
            billedAmount,
            closingBalance,
            closedAt: new Date(),
          },
        },
        { new: true, session },
      );

      if (!updated) {
        const existing = await BillingPeriodModel.findById(period._id).session(
          session,
        );
        if (existing?.status === "closed") {
          return this.toBillingPeriod(existing);
        }
        if (!existing) {
          throw new Error(`Period ${period._id} does not exist`);
        }
        throw new Error(
          `Period ${period._id} has unexpected status "${existing.status}"`,
        );
      }

      return this.toBillingPeriod(updated);
    });
  }

  static async getCurrentPeriod(teamId: string): Promise<BillingPeriod | null> {
    const doc = await BillingPeriodModel.findOne({
      team: teamId,
      status: "open",
    });
    return doc ? this.toBillingPeriod(doc) : null;
  }

  static async getLastClosedPeriod(
    teamId: string,
  ): Promise<BillingPeriod | null> {
    const doc = await BillingPeriodModel.findOne({
      team: teamId,
      status: "closed",
    }).sort({ endAt: -1 });
    return doc ? this.toBillingPeriod(doc) : null;
  }

  static async findClosedByTeam(
    teamId: string,
    limit = 24,
  ): Promise<BillingPeriod[]> {
    const docs = await BillingPeriodModel.find({
      team: teamId,
      status: "closed",
    })
      .sort({ startAt: -1 })
      .limit(limit);
    return docs.map((doc) => this.toBillingPeriod(doc));
  }

  static async findStaleOpenPeriods(
    asOf: Date = new Date(),
  ): Promise<BillingPeriod[]> {
    const docs = await BillingPeriodModel.find({
      status: "open",
      endAt: { $lte: asOf },
    }).sort({ team: 1, startAt: 1 });
    return docs.map((doc) => this.toBillingPeriod(doc));
  }

  static async findOrOpenCurrentPeriod(
    teamId: string,
    date: Date = new Date(),
  ): Promise<BillingPeriod | null> {
    const existing = await this.getCurrentPeriod(teamId);
    if (existing) return existing;

    try {
      return await this.openPeriod(teamId, date);
    } catch (err) {
      if (err instanceof NoPlanError) return null;
      // Duplicate key here means another process won the race to create this
      // period, so return the now-existing current period instead of failing.
      if (err instanceof Error && (err as { code?: number }).code === 11000) {
        return this.getCurrentPeriod(teamId);
      }
      throw err;
    }
  }
}
