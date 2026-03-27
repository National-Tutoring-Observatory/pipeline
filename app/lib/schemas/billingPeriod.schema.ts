import mongoose from "mongoose";

const billingPeriodSchema = new mongoose.Schema({
  team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  plan: { type: mongoose.Types.ObjectId, ref: "BillingPlan", required: true },
  markupRate: { type: Number, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  rawCost: { type: Number },
  billedAmount: { type: Number },
  closingBalance: { type: Number },
  closedAt: { type: Date },
});

billingPeriodSchema.index({ team: 1, startAt: -1 });
billingPeriodSchema.index({ team: 1, startAt: 1 }, { unique: true });
billingPeriodSchema.index({ team: 1, status: 1 });

export default billingPeriodSchema;
