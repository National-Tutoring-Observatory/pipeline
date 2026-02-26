import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema({
  example: { type: String, default: "" },
  exampleType: {
    type: String,
    enum: ["NEAR_MISS", "NEAR_HIT", "HIT", "MISS"],
    default: "HIT",
  },
});

const codeSchema = new mongoose.Schema({
  code: { type: String, default: "" },
  definition: { type: String, default: "" },
  examples: [exampleSchema],
});

const categorySchema = new mongoose.Schema({
  name: { type: String, default: "" },
  description: { type: String, default: "" },
  codes: [codeSchema],
});

export default new mongoose.Schema({
  name: { type: String },
  codebook: { type: mongoose.Types.ObjectId, ref: "Codebook" },
  version: { type: Number },
  hasBeenSaved: { type: Boolean, default: false },
  categories: [categorySchema],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
