// How far each worker has got in each module (one record per worker per module).
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    moduleKey: { type: String, required: true },
    checkpoint: { type: String, enum: ["none", "started", "search", "lesson"], default: "none" },
    completed: { type: Boolean, default: false },   // true once the worker has passed the quiz
    completedAt: { type: Date },
    bestScorePercent: { type: Number, default: 0 }
  },
  { timestamps: true }
);
progressSchema.index({ user: 1, moduleKey: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
