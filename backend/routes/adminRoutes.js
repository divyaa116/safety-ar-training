// Everything an administrator can do. Every route below needs a logged-in admin (checked on the server).
const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const User = require("../models/User");
const Progress = require("../models/Progress");
const QuizAttempt = require("../models/QuizAttempt");
const Certificate = require("../models/Certificate");
const AuditLog = require("../models/AuditLog");
const ModuleSetting = require("../models/ModuleSetting");
const { modules, pick } = require("../content");
const { statusOf } = require("../services/progressService");
const { ID_RE } = require("../services/certificateService");

const router = express.Router();
router.use(requireAuth, adminOnly);

const isId = v => typeof v === "string" && mongoose.isValidObjectId(v);
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");          // so a search like ".*" is just text, not a pattern
const pageOf = req => { const n = parseInt(req.query.page, 10); return n > 0 ? Math.min(n, 100000) : 1; };
const limitOf = (req, d = 20) => { const n = parseInt(req.query.limit, 10); return n > 0 ? Math.min(n, 100) : d; };

async function audit(req, action, d = {}) {
  await AuditLog.create({ admin: req.user._id, adminName: req.user.fullName, action, targetUser: d.targetUser, targetName: d.targetName || "", target: d.target || "", details: String(d.details || "").slice(0, 300) });
}

// ---------- overview numbers ----------
router.get("/stats", async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const fin = { finished: { $ne: false } };
  const [totalWorkers, disabledWorkers, newThisWeek, completed, inProgress, attempts, passedAttempts, certValid, certRevoked] = await Promise.all([
    User.countDocuments({ role: "worker" }), User.countDocuments({ role: "worker", isActive: false }),
    User.countDocuments({ role: "worker", createdAt: { $gte: weekAgo } }),
    Progress.countDocuments({ completed: true }), Progress.countDocuments({ completed: false, checkpoint: { $ne: "none" } }),
    QuizAttempt.countDocuments(fin), QuizAttempt.countDocuments({ ...fin, passed: true }),
    Certificate.countDocuments({ status: "valid" }), Certificate.countDocuments({ status: "revoked" })
  ]);
  res.json({ totalWorkers, activeWorkers: totalWorkers - disabledWorkers, disabledWorkers, newThisWeek, modulesCompleted: completed, modulesInProgress: inProgress,
    quizAttempts: attempts, passRatePercent: attempts ? Math.round((passedAttempts / attempts) * 100) : 0, certificatesValid: certValid, certificatesRevoked: certRevoked });
});

// ---------- workers ----------
function workerRow(u, progList) {
  const mods = {};
  for (const m of Object.values(modules)) mods[m.key] = statusOf(progList.find(p => p.moduleKey === m.key));
  return { id: u._id.toString(), fullName: u.fullName, email: u.email, workerId: u.workerId, isActive: u.isActive, language: u.language, createdAt: u.createdAt, modules: mods };
}

router.get("/workers", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 60) : "";
  const filter = { role: "worker" };
  if (q) { const re = new RegExp(escRe(q), "i"); filter.$or = [{ fullName: re }, { email: re }, { workerId: re }]; }
  const page = pageOf(req), limit = limitOf(req);
  const [total, users] = await Promise.all([User.countDocuments(filter), User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)]);
  const progress = await Progress.find({ user: { $in: users.map(u => u._id) } });
  res.json({ total, page, limit, workers: users.map(u => workerRow(u, progress.filter(p => p.user.equals(u._id)))) });
});

router.get("/workers/:id", async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).json({ error: "Worker not found." });
  const u = await User.findOne({ _id: req.params.id, role: "worker" });
  if (!u) return res.status(404).json({ error: "Worker not found." });
  const [progress, attempts, certs] = await Promise.all([
    Progress.find({ user: u._id }),
    QuizAttempt.find({ user: u._id, finished: { $ne: false } }).sort({ createdAt: -1 }).limit(50),
    Certificate.find({ user: u._id }).sort({ issuedAt: -1 })
  ]);
  const row = workerRow(u, progress);
  const mods = Object.values(modules).map(m => {
    const p = progress.find(x => x.moduleKey === m.key);
    return { key: m.key, title: pick(m.title, "en"), status: statusOf(p), checkpoint: p ? p.checkpoint : "none", bestScorePercent: p ? p.bestScorePercent : 0,
      attemptCount: attempts.filter(a => a.moduleKey === m.key).length };
  });
  res.json({ worker: row, modules: mods,
    attempts: attempts.map(a => ({ date: a.createdAt, moduleKey: a.moduleKey, correct: a.correctCount, total: a.totalQuestions, scorePercent: a.scorePercent, passed: a.passed })),
    certificates: certs.map(c => ({ certId: c.certId, moduleTitle: c.moduleTitle, scorePercent: c.scorePercent, issuedAt: c.issuedAt, status: c.status, revokedAt: c.revokedAt, revokedReason: c.revokedReason })) });
});

router.patch("/workers/:id/status", async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).json({ error: "Worker not found." });
  if (typeof (req.body && req.body.isActive) !== "boolean") return res.status(400).json({ error: "isActive must be true or false." });
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ error: "You cannot change your own account status." });
  const u = await User.findOne({ _id: req.params.id, role: "worker" });
  if (!u) return res.status(404).json({ error: "Worker not found." });
  u.isActive = req.body.isActive; await u.save();
  await audit(req, u.isActive ? "account_enabled" : "account_disabled", { targetUser: u._id, targetName: u.fullName, details: String(req.body.reason || "") });
  res.json({ ok: true, isActive: u.isActive });
});

// Resets ONE module's progress for a worker. Quiz attempts, certificates and audit records are all kept.
router.post("/workers/:id/modules/:moduleKey/reset", async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).json({ error: "Worker not found." });
  if (!modules[req.params.moduleKey]) return res.status(404).json({ error: "Module not found." });
  const u = await User.findOne({ _id: req.params.id, role: "worker" });
  if (!u) return res.status(404).json({ error: "Worker not found." });
  const p = await Progress.findOneAndUpdate({ user: u._id, moduleKey: req.params.moduleKey }, { $set: { checkpoint: "none", completed: false }, $unset: { completedAt: 1 } }, { new: true });
  if (!p) return res.status(404).json({ error: "This worker has no progress in that module to reset." });
  await QuizAttempt.deleteMany({ user: u._id, moduleKey: req.params.moduleKey, finished: false });   // only an unfinished, half-answered attempt is cleared
  await audit(req, "progress_reset", { targetUser: u._id, targetName: u.fullName, target: req.params.moduleKey, details: String(req.body && req.body.reason || "") });
  res.json({ ok: true, status: statusOf(p) });
});

// ---------- certificates ----------
router.get("/certificates", async (req, res) => {
  const filter = {};
  if (req.query.status === "valid" || req.query.status === "revoked") filter.status = req.query.status;
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 60) : "";
  if (q) { const re = new RegExp(escRe(q), "i"); filter.$or = [{ certId: re }, { fullName: re }]; }
  const page = pageOf(req), limit = limitOf(req, 25);
  const [total, list] = await Promise.all([Certificate.countDocuments(filter), Certificate.find(filter).sort({ issuedAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "email workerId")]);
  res.json({ total, page, limit, certificates: list.map(c => ({ certId: c.certId, fullName: c.fullName, email: c.user ? c.user.email : "", workerId: c.user ? c.user.workerId : "",
    moduleTitle: c.moduleTitle, scorePercent: c.scorePercent, issuedAt: c.issuedAt, status: c.status, revokedAt: c.revokedAt, revokedReason: c.revokedReason })) });
});

router.post("/certificates/:certId/revoke", async (req, res) => {
  const id = req.params.certId;
  if (!ID_RE.test(id)) return res.status(404).json({ error: "Certificate not found." });
  const reason = typeof (req.body && req.body.reason) === "string" ? req.body.reason.trim() : "";
  if (reason.length < 3 || reason.length > 300) return res.status(400).json({ error: "Please give a reason (3 to 300 characters)." });
  const c = await Certificate.findOneAndUpdate({ certId: id, status: "valid" }, { $set: { status: "revoked", revokedAt: new Date(), revokedReason: reason, revokedBy: req.user._id } }, { new: true });
  if (!c) return res.status(await Certificate.exists({ certId: id }) ? 409 : 404).json({ error: (await Certificate.exists({ certId: id })) ? "This certificate is already revoked." : "Certificate not found." });
  await audit(req, "certificate_revoked", { targetUser: c.user, targetName: c.fullName, target: c.certId, details: reason });
  res.json({ ok: true, certId: c.certId, status: c.status });
});

// ---------- modules on / off ----------
router.get("/modules", async (req, res) => {
  const settings = await ModuleSetting.find({});
  res.json({ modules: Object.values(modules).map(m => { const s = settings.find(x => x.key === m.key); return { key: m.key, title: pick(m.title, "en"), enabled: !s || s.enabled !== false }; }) });
});

router.patch("/modules/:moduleKey", async (req, res) => {
  const m = modules[req.params.moduleKey];
  if (!m) return res.status(404).json({ error: "Module not found." });
  if (typeof (req.body && req.body.enabled) !== "boolean") return res.status(400).json({ error: "enabled must be true or false." });
  await ModuleSetting.findOneAndUpdate({ key: m.key }, { $set: { enabled: req.body.enabled } }, { upsert: true });
  await audit(req, req.body.enabled ? "module_enabled" : "module_disabled", { target: m.key });
  res.json({ ok: true, key: m.key, enabled: req.body.enabled });
});

// ---------- audit log ----------
router.get("/audit", async (req, res) => {
  const list = await AuditLog.find({}).sort({ createdAt: -1 }).limit(limitOf(req, 100));
  res.json({ entries: list.map(a => ({ date: a.createdAt, admin: a.adminName, action: a.action, worker: a.targetName, target: a.target, details: a.details })) });
});

module.exports = router;
