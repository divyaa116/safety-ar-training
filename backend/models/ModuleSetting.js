// Lets an admin switch a whole module on or off. No record means "on".
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("ModuleSetting", settingSchema);
