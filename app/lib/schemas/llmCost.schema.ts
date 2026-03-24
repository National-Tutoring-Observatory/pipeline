import mongoose from "mongoose";

const llmCostSchema = new mongoose.Schema({
  team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  model: { type: String, required: true },
  source: { type: String, required: true },
  sourceId: { type: String },
  inputTokens: { type: Number, required: true },
  outputTokens: { type: Number, required: true },
  cost: { type: Number, required: true },
  providerCost: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

llmCostSchema.index({ team: 1, createdAt: -1 });
llmCostSchema.index({ sourceId: 1 });

export default llmCostSchema;
