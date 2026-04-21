import mongoose from "mongoose";

const teamBillingBalanceSchema = new mongoose.Schema({
  team: {
    type: mongoose.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  availableBalance: { type: Number, required: true, default: 0 },
  lastLedgerEntryAt: { type: Date },
  lastReconciledAt: { type: Date },
  version: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

teamBillingBalanceSchema.index({ team: 1 }, { unique: true });

export default teamBillingBalanceSchema;
