import mongoose from "mongoose";

const teamCreditSchema = new mongoose.Schema({
  team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  amount: { type: Number, required: true },
  addedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  note: { type: String },
  stripeSessionId: { type: String, sparse: true, unique: true },
  isLegacy: { type: Boolean, default: false },
  legacyNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

teamCreditSchema.index({ team: 1, createdAt: -1 });

export default teamCreditSchema;
