import mongoose from "mongoose";

const teamBillingPlanSchema = new mongoose.Schema({
  team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  plan: { type: mongoose.Types.ObjectId, ref: "BillingPlan", required: true },
  createdAt: { type: Date, default: Date.now },
});

teamBillingPlanSchema.index({ team: 1 }, { unique: true });

export default teamBillingPlanSchema;
