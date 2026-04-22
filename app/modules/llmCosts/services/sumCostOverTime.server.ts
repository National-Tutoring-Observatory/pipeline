import mongoose from "mongoose";
import {
  getStartDate,
  groupDaysIntoWeeks,
} from "~/modules/billing/helpers/granularityHelpers";
import { LlmCostModel } from "../llmCost";
import type { CostOverTime, SpendGranularity } from "../llmCosts.types";

export default async function sumCostOverTime(
  teamId: string,
  granularity: SpendGranularity,
): Promise<CostOverTime[]> {
  const startDate = getStartDate(granularity);
  const teamObjectId = new mongoose.Types.ObjectId(teamId);

  if (granularity === "week") {
    const days = await LlmCostModel.aggregate([
      { $match: { team: teamObjectId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalCost: { $sum: "$cost" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return groupDaysIntoWeeks(days);
  }

  const format = granularity === "day" ? "%Y-%m-%d" : "%Y-%m";
  const result = await LlmCostModel.aggregate([
    { $match: { team: teamObjectId, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format, date: "$createdAt" } },
        totalCost: { $sum: "$cost" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return result.map((r: { _id: string; totalCost: number }) => ({
    period: r._id,
    totalCost: r.totalCost,
  }));
}
