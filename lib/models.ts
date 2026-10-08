import mongoose, { Schema, models } from "mongoose";

// ── User ──────────────────────────────────────────────────────────────────────
const UserSchema = new Schema({
  userId:    { type: String, required: true, unique: true },
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  avatarUrl: { type: String, default: "" },
  joinedAt:  { type: Date, default: Date.now },
});

// ── Progress ──────────────────────────────────────────────────────────────────
const ProgressSchema = new Schema({
  userId:        { type: String, required: true, unique: true },
  done:          { type: [String], default: [] },
  // pre-computed stats (updated on every save)
  totalSolved:   { type: Number, default: 0 },
  topicsDone:    { type: Number, default: 0 },   // topics fully completed
  companiesDone: { type: [String], default: [] }, // company names where all questions solved
  badges:        { type: [String], default: [] }, // badge ids earned
  score:         { type: Number, default: 0 },    // weighted score for leaderboard
  updatedAt:     { type: Date, default: Date.now },
});

export const User     = models.User     ?? mongoose.model("User",     UserSchema);
export const Progress = models.Progress ?? mongoose.model("Progress", ProgressSchema);
