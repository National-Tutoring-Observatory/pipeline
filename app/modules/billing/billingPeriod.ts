import Decimal from "decimal.js";
import mongoose from "mongoose";
import billingPeriodSchema from "~/lib/schemas/billingPeriod.schema";
import llmCostSchema from "~/lib/schemas/llmCost.schema";
import teamCreditSchema from "~/lib/schemas/teamCredit.schema";
import type { BillingPeriod } from "./billing.types";
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

const TeamCreditModel =
  mongoose.models.TeamCredit || mongoose.model("TeamCredit", teamCreditSchema);

const LlmCostModel =
  mongoose.models.LlmCost || mongoose.model("LlmCost", llmCostSchema);

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
    const teamObjId = new mongoose.Types.ObjectId(period.team);
    const startAt = new Date(period.startAt);
    const endAt = new Date(period.endAt);

    const prevClosed = await BillingPeriodModel.findOne({
      team: teamObjId,
      status: "closed",
      endAt: { $lte: startAt },
    }).sort({ endAt: -1 });

    const creditLowerBound = prevClosed
      ? new Date(prevClosed.endAt)
      : new Date(0);

    const [costResult, creditResult] = await Promise.all([
      LlmCostModel.aggregate([
        {
          $match: {
            team: teamObjId,
            createdAt: { $gte: startAt, $lt: endAt },
          },
        },
        { $group: { _id: null, total: { $sum: "$cost" } } },
      ]),
      TeamCreditModel.aggregate([
        {
          $match: {
            team: teamObjId,
            createdAt: { $gte: creditLowerBound, $lt: endAt },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const rawCost = costResult[0]?.total ?? 0;
    const newCredits = creditResult[0]?.total ?? 0;
    const prevClosingBalance = prevClosed?.closingBalance ?? 0;

    const billedAmount = new Decimal(rawCost)
      .times(period.markupRate)
      .toNumber();
    const closingBalance = new Decimal(prevClosingBalance)
      .plus(newCredits)
      .minus(billedAmount)
      .toNumber();

    const updated = await BillingPeriodModel.findOneAndUpdate(
      { _id: period._id, status: "open" },
      {
        $set: {
          status: "closed",
          rawCost,
          billedAmount,
          closingBalance,
          closedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updated) {
      throw new Error(
        `Period ${period._id} is already closed or does not exist`,
      );
    }

    return this.toBillingPeriod(updated);
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
      // Another process opened the period concurrently — return whatever is there now
      if (err instanceof Error && (err as { code?: number }).code === 11000) {
        return this.getCurrentPeriod(teamId);
      }
      throw err;
    }
  }
}
