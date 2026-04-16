import mongoose from "mongoose";
import { LlmCostModel } from "../llmCost";
import type { CostByModel } from "../llmCosts.types";

export default async function sumCostByModel(
  teamId: string,
): Promise<CostByModel[]> {
  const result = await LlmCostModel.aggregate([
    { $match: { team: new mongoose.Types.ObjectId(teamId) } },
    {
      $group: {
        _id: "$model",
        totalCost: { $sum: "$cost" },
        totalInputTokens: { $sum: "$inputTokens" },
        totalOutputTokens: { $sum: "$outputTokens" },
      },
    },
    { $sort: { totalCost: -1 } },
  ]);
  return result.map(
    (r: {
      _id: string;
      totalCost: number;
      totalInputTokens: number;
      totalOutputTokens: number;
    }) => ({
      model: r._id,
      totalCost: r.totalCost,
      totalInputTokens: r.totalInputTokens,
      totalOutputTokens: r.totalOutputTokens,
    }),
  );
}
