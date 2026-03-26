import mongoose from "mongoose";
import llmCostSchema from "~/lib/schemas/llmCost.schema";
import type { CostByModel } from "../llmCosts.types";

const LlmCostModel =
  mongoose.models.LlmCost || mongoose.model("LlmCost", llmCostSchema);

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
  return result.map((r: any) => ({
    model: r._id,
    totalCost: r.totalCost,
    totalInputTokens: r.totalInputTokens,
    totalOutputTokens: r.totalOutputTokens,
  }));
}
