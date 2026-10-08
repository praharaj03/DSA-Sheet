import mongoose, { Schema, models } from "mongoose";

// ── User ──────────────────────────────────────────────────────────────────────
const UserSchema = new Schema({
  userId:            { type: String, required: true, unique: true },
  username:          { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  avatarUrl:         { type: String, default: "" },
  joinedAt:          { type: Date, default: Date.now },
  usernameChangedAt: { type: Date, default: null },
  avatarChangedAt:   { type: Date, default: null },
  links: {
    leetcode: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github:   { type: String, default: "" },
  },
});

// ── Progress ──────────────────────────────────────────────────────────────────
const ProgressSchema = new Schema({
  userId:        { type: String, required: true, unique: true },
  done:          { type: [String], default: [] },
  totalSolved:   { type: Number, default: 0 },
  topicsDone:    { type: Number, default: 0 },
  companiesDone: { type: [String], default: [] },
  badges:        { type: [String], default: [] },
  score:         { type: Number, default: 0 },
  // activity log: { "2025-01-15": 3 } — date → questions solved that day
  activityLog:   { type: Map, of: Number, default: {} },
  currentStreak: { type: Number, default: 0 },
  maxStreak:     { type: Number, default: 0 },
  updatedAt:     { type: Date, default: Date.now },
});

export const User     = models.User     ?? mongoose.model("User",     UserSchema);
export const Progress = models.Progress ?? mongoose.model("Progress", ProgressSchema);
