// One record for EVERY finished quiz attempt. Finished attempts are never overwritten or deleted.
// (An unfinished attempt, started but abandoned, is discarded when the worker starts a new one.)
const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    moduleKey: { type: String, required: true },
    answers: [{ questionId: String, selected: Number, correct: Boolean, _id: false }],
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    scorePercent: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    finished: { type: Boolean, default: false }   // false while the worker is still answering; only finished attempts count
  },
  { timestamps: true }
);
attemptSchema.index({ user: 1, moduleKey: 1, createdAt: -1 });

module.exports = mongoose.model("QuizAttempt", attemptSchema);
