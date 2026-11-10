// One certificate per worker per module. The server is the only thing that can create or revoke one.
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certId: { type: String, required: true, unique: true, index: true },   // e.g. MG-K4Q7ZP2XAB (printed on the PDF and in the QR code)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    moduleKey: { type: String, required: true },
    attempt: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true },  // the passing quiz attempt this came from
    // A copy of the details at the moment of issue, so the certificate never changes later:
    fullName: { type: String, required: true },
    moduleTitle: { type: String, required: true },
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    scorePercent: { type: Number, required: true },
    issuedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["valid", "revoked"], default: "valid" },
    revokedAt: { type: Date },
    revokedReason: { type: String, default: "" },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);
certificateSchema.index({ user: 1, moduleKey: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
