import mongoose from "mongoose";

export default new mongoose.Schema({
  name: { type: String },
  team: { type: mongoose.Types.ObjectId, ref: "Team" },
  isUploadingFiles: { type: Boolean, default: false },
  isConvertingFiles: { type: Boolean, default: false },
  hasSetupProject: { type: Boolean, default: false },
  hasErrored: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
