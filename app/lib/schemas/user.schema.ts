import mongoose from "mongoose";

export default new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  name: { type: String },
  role: { type: String, enum: ["SUPER_ADMIN", "USER"] },
  email: { type: String, unique: true, sparse: true },
  teams: [
    {
      team: { type: mongoose.Types.ObjectId, ref: "Team" },
      role: { type: String, enum: ["ADMIN", "MEMBER"] },
      viaTeamInvite: { type: mongoose.Types.ObjectId, ref: "TeamInvite" },
      joinedAt: { type: Date, default: Date.now },
      _id: false,
    },
  ],
  featureFlags: [{ type: String }],
  inviteId: { type: String },
  isRegistered: { type: Boolean, default: false },
  githubId: { type: Number },
  hasGithubSSO: { type: Boolean, default: false },
  invitedAt: { type: Date },
  registeredAt: { type: Date },
  institution: { type: String },
  userRole: {
    type: String,
    enum: ["Researcher", "Grad Student", "Instructor/Faculty", "Other"],
  },
  useCases: [{ type: String }],
  scholarshipInterest: { type: Boolean },
  termsAcceptedAt: { type: Date },
  onboardingComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
