// Registration, login, logout, and "who am I".
const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const msg = require("../i18n/messages");
const { requireAuth, issueToken, clearToken } = require("../middleware/auth");

const router = express.Router();

// Slows down password guessing: only 20 register/login attempts per 15 minutes per visitor.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: req => ({ error: msg(req, "tooMany") })
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WORKER_ID_RE = /^[A-Za-z0-9_-]{0,20}$/;
const BCRYPT_COST = 12;
// A fake hash used so that "unknown email" takes as long as "wrong password" (stops email guessing by timing).
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

function str(v) { return typeof v === "string" ? v.trim() : ""; }

router.post("/register", authLimiter, async (req, res) => {
  const fullName = str(req.body.fullName);
  const email = str(req.body.email).toLowerCase();
  const workerId = str(req.body.workerId);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  const problems = [];
  if (fullName.length < 2 || fullName.length > 60) problems.push(msg(req, "val.name"));
  if (!EMAIL_RE.test(email) || email.length > 100) problems.push(msg(req, "val.email"));
  if (password.length < 8 || password.length > 72) problems.push(msg(req, "val.pwLen"));
  else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) problems.push(msg(req, "val.pwMix"));
  if (!WORKER_ID_RE.test(workerId)) problems.push(msg(req, "val.wid"));
  if (problems.length) return res.status(400).json({ error: problems[0], problems });

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const language = req.body.language === "ta" ? "ta" : "en";
    const user = await User.create({ fullName, email, workerId, passwordHash, language });
    issueToken(res, user);
    return res.status(201).json({ user: user.toPublic() });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: msg(req, "dupEmail") });
    throw err;
  }
});

router.post("/login", authLimiter, async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const user = email ? await User.findOne({ email }) : null;
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: msg(req, "badLogin") });
  if (!user.isActive) return res.status(403).json({ error: msg(req, "disabled") });
  issueToken(res, user);
  res.json({ user: user.toPublic() });
});

router.post("/logout", (req, res) => {
  clearToken(res);
  res.json({ ok: true });
});

// Saves the worker's chosen language (en or ta).
router.patch("/language", requireAuth, async (req, res) => {
  const language = req.body && req.body.language;
  if (language !== "en" && language !== "ta") return res.status(400).json({ error: msg(req, "badLang") });
  req.user.language = language;
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

module.exports = router;
