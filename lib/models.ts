import mongoose, { Schema, models } from "mongoose";

const ProgressSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  done: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

export const Progress = models.Progress ?? mongoose.model("Progress", ProgressSchema);
