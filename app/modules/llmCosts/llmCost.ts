import mongoose from "mongoose";
import llmCostSchema from "~/lib/schemas/llmCost.schema";
import type {
  CostByModel,
  CostBySource,
  CostOverTime,
  LlmCost,
  SpendGranularity,
} from "./llmCosts.types";
import sumCostByModel from "./services/sumCostByModel.server";
import sumCostBySource from "./services/sumCostBySource.server";
import sumCostOverTime from "./services/sumCostOverTime.server";

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

  static async sumCostByTeam(teamId: string): Promise<number> {
    const result = await LlmCostModel.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId) } },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async sumCostByTeamSince(
    teamId: string,
    since: Date,
  ): Promise<number> {
    const result = await LlmCostModel.aggregate([
      {
        $match: {
          team: new mongoose.Types.ObjectId(teamId),
          createdAt: { $gte: since },
        },
      },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async sumCostByModel(teamId: string): Promise<CostByModel[]> {
    return sumCostByModel(teamId);
  }

  static async sumCostBySource(teamId: string): Promise<CostBySource[]> {
    return sumCostBySource(teamId);
  }

  static async sumCostOverTime(
    teamId: string,
    granularity: SpendGranularity,
  ): Promise<CostOverTime[]> {
    return sumCostOverTime(teamId, granularity);
  }

  static async getOutputToInputRatio(teamId: string): Promise<number | null> {
    const result = await LlmCostModel.aggregate([
      {
        $match: {
          team: new mongoose.Types.ObjectId(teamId),
          source: { $regex: "^annotation:" },
        },
      },
      {
        $group: {
          _id: null,
          totalInput: { $sum: "$inputTokens" },
          totalOutput: { $sum: "$outputTokens" },
        },
      },
    ]);
    if (!result[0] || result[0].totalInput === 0) {
      return null;
    } else {
      return result[0].totalOutput / result[0].totalInput;
    }
  }
}
