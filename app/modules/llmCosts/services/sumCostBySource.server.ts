import mongoose from "mongoose";
import { LlmCostModel } from "../llmCost";
import type { CostBySource } from "../llmCosts.types";

export default async function sumCostBySource(
  teamId: string,
): Promise<CostBySource[]> {
  const result = await LlmCostModel.aggregate([
    { $match: { team: new mongoose.Types.ObjectId(teamId) } },
    {
      $group: {
        _id: "$source",
        totalCost: { $sum: "$cost" },
      },
    },
    { $sort: { totalCost: -1 } },
  ]);
  return result.map((r: { _id: string; totalCost: number }) => ({
    source: r._id,
    totalCost: r.totalCost,
  }));
}
