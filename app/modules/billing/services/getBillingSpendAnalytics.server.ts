import mongoose from "mongoose";
import type {
  CostByModel,
  CostBySource,
  CostOverTime,
  SpendGranularity,
} from "~/modules/billing/billingAnalytics.types";
import { BillingLedgerEntryModel } from "../billingLedgerEntry";
import {
  getStartDate,
  groupDaysIntoWeeks,
} from "../helpers/granularityHelpers";

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
