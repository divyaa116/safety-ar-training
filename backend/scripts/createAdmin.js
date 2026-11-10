// One-time setup: creates the FIRST administrator. Run it yourself in the terminal:   node scripts/createAdmin.js
// There is no default admin and no admin password stored anywhere in the code.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env"), quiet: true });
const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
let muted = false;
rl._writeToOutput = function (s) { if (!muted) rl.output.write(s); };   // while typing a password, nothing is shown on screen

async function ask(question, hidden) {
  process.stdout.write(question);
  muted = !!hidden;
  const { value } = await lines.next();
  muted = false;
  if (hidden) process.stdout.write("\n");
  return (value || "").trim();
}

(async () => {
  console.log("\nMineGuard: create an administrator account\n");
  try { await connectDatabase(); } catch (e) { console.error("Could not connect to the database. Check MONGODB_URI in backend/.env."); process.exit(1); }

  const fullName = await ask("Full name: ");
  const email = (await ask("Email address: ")).toLowerCase();
  if (fullName.length < 2 || fullName.length > 60) { console.error("Name must be 2 to 60 characters."); process.exit(1); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { console.error("That is not a valid email address."); process.exit(1); }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("\nAn account with this email already exists (role: " + existing.role + ").");
    if (existing.role === "admin") { console.log("It is already an administrator. Nothing to do."); process.exit(0); }
    const yes = (await ask("Make this existing account an administrator? Type yes or no: ")).toLowerCase();
    if (yes !== "yes") { console.log("Cancelled."); process.exit(0); }
    existing.role = "admin"; await existing.save();
    await AuditLog.create({ adminName: "setup script", action: "admin_created", targetUser: existing._id, targetName: existing.fullName, details: "existing account promoted" });
    console.log("Done. " + existing.email + " is now an administrator.");
    process.exit(0);
  }

  const password = await ask("Password (8 to 72 characters, with a letter and a number; typing is hidden): ", true);
  const again = await ask("Type the password again: ", true);
  if (password !== again) { console.error("The two passwords do not match."); process.exit(1); }
  if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) { console.error("Password must be 8 to 72 characters with at least one letter and one number."); process.exit(1); }

  const user = await User.create({ fullName, email, passwordHash: await bcrypt.hash(password, 12), role: "admin" });
  await AuditLog.create({ adminName: "setup script", action: "admin_created", targetUser: user._id, targetName: user.fullName, details: "created by setup script" });
  console.log("\nDone. Administrator created: " + user.email);
  process.exit(0);
})().catch(err => { console.error("Something went wrong:", err.message); process.exit(1); });
