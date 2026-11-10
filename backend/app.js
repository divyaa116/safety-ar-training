// Builds the Express app: security settings, API routes, and (for local testing) serves the website files.
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.disable("x-powered-by");
// When hosted online, requests arrive through the host's proxy; this makes rate limiting see the real visitor.
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// helmet adds safe HTTP headers. Its content-security-policy is switched off for now because the
// current page loads scripts from Google/jsDelivr; we tighten it in a later phase.
app.use(helmet({ contentSecurityPolicy: false }));

// Only websites listed in CLIENT_ORIGIN may call the API from a browser.
const origins = (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins, credentials: true }));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Rate limit: one visitor can only make so many API calls per 15 minutes.
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false, message: req => ({ error: require("./i18n/messages")(req, "tooManyReq") }) }));

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ status: "ok", database: states[mongoose.connection.readyState] || "unknown", time: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api", (req, res) => res.status(404).json({ error: require("./i18n/messages")(req, "notFound") }));

// Local testing only: serve the website from the folder above "backend". Only listed files are public,
// so backend/, .env and everything else stay private.
const ROOT = path.join(__dirname, "..");
app.use("/frontend", express.static(path.join(ROOT, "frontend"), { dotfiles: "deny" }));
// The administrator page (the page itself is public; every admin DATA route is protected on the server).
app.get("/admin", (req, res) => res.sendFile(path.join(ROOT, "frontend", "admin.html")));
app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));
// The page a worker's QR code opens (it asks the API whether the certificate is valid).
app.get("/verify/:certId", (req, res) => res.sendFile(path.join(ROOT, "frontend", "verify.html")));
["extinguisher.glb", "mining_bakground.jpg"].forEach(f => app.get("/" + f, (req, res) => res.sendFile(path.join(ROOT, f))));

app.use(errorHandler);
module.exports = app;
