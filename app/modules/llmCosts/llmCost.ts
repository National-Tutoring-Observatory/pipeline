import mongoose from "mongoose";
import llmCostSchema from "~/lib/schemas/llmCost.schema";
import type { LlmCost } from "./llmCosts.types";

const LlmCostModel =
  mongoose.models.LlmCost || mongoose.model("LlmCost", llmCostSchema);

export class LlmCostService {
  private static toLlmCost(doc: any): LlmCost {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async create(
    data: Omit<LlmCost, "_id" | "createdAt">,
  ): Promise<LlmCost> {
    const doc = await LlmCostModel.create(data);
    return this.toLlmCost(doc);
  }

  static async findByTeam(teamId: string): Promise<LlmCost[]> {
    const docs = await LlmCostModel.find({ team: teamId }).sort({
      createdAt: -1,
    });
    return docs.map((doc) => this.toLlmCost(doc));
  }

  static async findBySourceId(sourceId: string): Promise<LlmCost[]> {
    const docs = await LlmCostModel.find({ sourceId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toLlmCost(doc));
  }
}
