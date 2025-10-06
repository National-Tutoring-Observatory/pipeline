import mongoose from 'mongoose';

export default new mongoose.Schema({
  username: { type: String, default: '' },
  role: { type: String, enum: ['SUPER_ADMIN', 'USER'] },
  email: { type: String },
  teams: [{
    team: { type: mongoose.Types.ObjectId, ref: 'Team' },
    role: { type: String, enum: ['ADMIN'] }
  }],
  isRegistered: { type: Boolean, default: false },
  inviteId: { type: String },
  githubId: { type: Number },
  hasGithubSSO: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
});