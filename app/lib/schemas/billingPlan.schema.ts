import mongoose from "mongoose";

const billingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  markupRate: { type: Number, required: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

billingPlanSchema.index(
  { isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);

export default billingPlanSchema;
