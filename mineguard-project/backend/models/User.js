// What a user account looks like in the database.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true }, // the password itself is NEVER stored, only this scrambled version
    workerId: { type: String, trim: true, maxlength: 20, default: "" },
    role: { type: String, enum: ["worker", "admin"], default: "worker" },
    isActive: { type: Boolean, default: true },     // an admin can switch an account off
    language: { type: String, enum: ["en", "ta"], default: "en" }
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// The safe version of a user that we send to the browser (no password hash).
userSchema.methods.toPublic = function () {
  return { id: this._id.toString(), fullName: this.fullName, email: this.email, workerId: this.workerId, role: this.role, language: this.language };
};

module.exports = mongoose.model("User", userSchema);
