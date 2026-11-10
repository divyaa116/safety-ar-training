// Starts everything: loads settings, connects to the database, then starts listening for requests.
require("dotenv").config({ path: require("path").join(__dirname, ".env"), quiet: true });
const app = require("./app");
const connectDatabase = require("./config/database");
const User = require("./models/User");
const Progress = require("./models/Progress");
const QuizAttempt = require("./models/QuizAttempt");
const Certificate = require("./models/Certificate");
const AuditLog = require("./models/AuditLog");
const ModuleSetting = require("./models/ModuleSetting");

const PORT = process.env.PORT || 3000;

function friendly(err) {
  const m = String(err.message || err);
  if (/bad auth|Authentication failed/i.test(m)) return "Wrong username or password in MONGODB_URI.";
  if (/ENOTFOUND|querySrv|EAI_AGAIN/i.test(m)) return "Could not find the Atlas address. Check the connection string and your internet.";
  if (/timed out|ReplicaSetNoPrimary|Server selection/i.test(m)) return "Atlas did not answer. In Atlas > Network Access, make sure your current IP address is allowed, and check your internet.";
  return m.replace(/mongodb(\+srv)?:\/\/\S+/g, "[hidden]");
}

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("\nJWT_SECRET is missing or too short. Follow the steps to create one and put it in backend/.env.");
    process.exit(1);
  }
  try {
    await connectDatabase();
    await Promise.all([User.init(), Progress.init(), QuizAttempt.init(), Certificate.init(), AuditLog.init(), ModuleSetting.init()]); // makes sure database rules and indexes are ready
    console.log("Database connected.");
  } catch (err) {
    console.error("\nCould not connect to the database.\nReason: " + friendly(err));
    process.exit(1);
  }
  app.listen(PORT, () => console.log("MineGuard server running at http://localhost:" + PORT));
}
start();
