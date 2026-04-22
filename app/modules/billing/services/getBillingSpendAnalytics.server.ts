import mongoose from "mongoose";
import billingLedgerEntrySchema from "~/lib/schemas/billingLedgerEntry.schema";
import type {
  CostByModel,
  CostBySource,
  CostOverTime,
  SpendGranularity,
} from "~/modules/llmCosts/llmCosts.types";

const BillingLedgerEntryModel =
  mongoose.models.BillingLedgerEntry ||
  mongoose.model("BillingLedgerEntry", billingLedgerEntrySchema);

function getStartDate(granularity: SpendGranularity): Date {
  const now = new Date();
  switch (granularity) {
    case "day":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "week":
      return new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
  }
}

function groupDaysIntoWeeks(
  days: Array<{ _id: string; totalCost: number }>,
): CostOverTime[] {
  const weekMap = new Map<string, number>();
  for (const day of days) {
    const date = new Date(day._id + "T00:00:00Z");
    const mondayOffset = (date.getUTCDay() + 6) % 7;
    const monday = new Date(date.getTime() - mondayOffset * 86400000);
    const key = monday.toISOString().slice(0, 10);
    weekMap.set(key, (weekMap.get(key) ?? 0) + day.totalCost);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, totalCost]) => ({ period, totalCost }));
}

export interface BillingSpendAnalytics {
  byModel: CostByModel[];
  bySource: CostBySource[];
  overTime: CostOverTime[];
}

export default async function getBillingSpendAnalytics(
  teamId: string,
  granularity: SpendGranularity,
): Promise<BillingSpendAnalytics> {
  const teamObjectId = new mongoose.Types.ObjectId(teamId);
  const startDate = getStartDate(granularity);

  const [byModel, bySource, overTime] = await Promise.all([
    BillingLedgerEntryModel.aggregate([
      {
        $match: {
          team: teamObjectId,
          direction: "debit",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$model",
          totalCost: { $sum: "$amount" },
          totalInputTokens: { $sum: "$inputTokens" },
          totalOutputTokens: { $sum: "$outputTokens" },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { totalCost: -1 } },
    ]),
    BillingLedgerEntryModel.aggregate([
      {
        $match: {
          team: teamObjectId,
          direction: "debit",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$source",
          totalCost: { $sum: "$amount" },
        },
      },
      { $sort: { totalCost: -1 } },
    ]),
    granularity === "week"
      ? BillingLedgerEntryModel.aggregate([
          {
            $match: {
              team: teamObjectId,
              direction: "debit",
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              totalCost: { $sum: "$amount" },
            },
          },
          { $sort: { _id: 1 } },
        ])
      : BillingLedgerEntryModel.aggregate([
          {
            $match: {
              team: teamObjectId,
              direction: "debit",
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: granularity === "day" ? "%Y-%m-%d" : "%Y-%m",
                  date: "$createdAt",
                },
              },
              totalCost: { $sum: "$amount" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
  ]);

  return {
    byModel: byModel.map(
      (row: {
        _id: string;
        totalCost: number;
        totalInputTokens: number;
        totalOutputTokens: number;
      }) => ({
        model: row._id,
        totalCost: row.totalCost,
        totalInputTokens: row.totalInputTokens,
        totalOutputTokens: row.totalOutputTokens,
      }),
    ),
    bySource: bySource.map((row: { _id: string; totalCost: number }) => ({
      source: row._id,
      totalCost: row.totalCost,
    })),
    overTime:
      granularity === "week"
        ? groupDaysIntoWeeks(
            overTime as Array<{ _id: string; totalCost: number }>,
          )
        : overTime.map((row: { _id: string; totalCost: number }) => ({
            period: row._id,
            totalCost: row.totalCost,
          })),
  };
}
