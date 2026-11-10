// A permanent record of important admin actions. Audit records are never edited or deleted by the app.
const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminName: { type: String, default: "" },        // copied at the time, so the log still makes sense later
    action: { type: String, required: true },         // e.g. certificate_revoked, progress_reset, account_disabled
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetName: { type: String, default: "" },
    target: { type: String, default: "" },            // e.g. a certificate ID or module key
    details: { type: String, default: "", maxlength: 300 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditSchema);
