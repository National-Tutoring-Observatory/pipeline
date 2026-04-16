import mongoose from "mongoose";
import { LlmCostModel } from "../llmCost";
import type { CostOverTime, SpendGranularity } from "../llmCosts.types";

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
