// Certificates: issue (after passing), list, download as PDF, and PUBLIC verification.
const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");
const Certificate = require("../models/Certificate");
const Progress = require("../models/Progress");
const msg = require("../i18n/messages");
const QuizAttempt = require("../models/QuizAttempt");
const { modules, pick, safeLang } = require("../content");
const { ID_RE, createCertificate, verifyUrl, drawCertificatePdf } = require("../services/certificateService");

const router = express.Router();

// ---- PUBLIC: anyone who scans the QR code can check a certificate. Only non-private details are shown. ----
router.get("/verify/:certId", rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, message: req => ({ error: msg(req, "tooManyReq") }) }), async (req, res) => {
  const id = req.params.certId;
  if (!ID_RE.test(id)) return res.status(404).json({ found: false });
  const c = await Certificate.findOne({ certId: id });
  if (!c) return res.status(404).json({ found: false });
  const out = { found: true, status: c.status, certId: c.certId, fullName: c.fullName, moduleTitle: titleFor(c, req),
    correctCount: c.correctCount, totalQuestions: c.totalQuestions, scorePercent: c.scorePercent, issuedAt: c.issuedAt };
  if (c.status === "revoked") out.revokedAt = c.revokedAt;   // the private reason is NOT shown publicly
  res.json(out);
});

// ---- Everything below needs a logged-in worker ----
router.use(requireAuth);

function titleFor(c, req) { const m = modules[c.moduleKey]; return (m && pick(m.title, safeLang(req.query.lang))) || c.moduleTitle; }

function ownerView(c, req) {
  return { certId: c.certId, moduleKey: c.moduleKey, moduleTitle: titleFor(c, req), status: c.status, scorePercent: c.scorePercent,
    correctCount: c.correctCount, totalQuestions: c.totalQuestions, issuedAt: c.issuedAt, verifyUrl: verifyUrl(c.certId), pdfUrl: "/api/certificates/" + c.certId + "/pdf" };
}

router.get("/", async (req, res) => {
  const list = await Certificate.find({ user: req.user._id }).sort({ issuedAt: -1 });
  res.json({ certificates: list.map(x => ownerView(x, req)) });
});

// Issue (or fetch the existing) certificate for a module. The server checks the worker really passed.
router.post("/:moduleKey", async (req, res) => {
  const mod = modules[req.params.moduleKey];
  if (!mod) return res.status(404).json({ error: msg(req, "modNotFound") });
  const prog = await Progress.findOne({ user: req.user._id, moduleKey: mod.key });
  const attempt = await QuizAttempt.findOne({ user: req.user._id, moduleKey: mod.key, passed: true, finished: { $ne: false } }).sort({ createdAt: -1 });
  if (!prog || !prog.completed || !attempt) return res.status(403).json({ error: msg(req, "needPass") });

  let cert = await Certificate.findOne({ user: req.user._id, moduleKey: mod.key });
  let created = false;
  if (!cert) {
    cert = await createCertificate({
      user: req.user._id, moduleKey: mod.key, attempt: attempt._id, fullName: req.user.fullName, moduleTitle: pick(mod.title, "en"),
      correctCount: attempt.correctCount, totalQuestions: attempt.totalQuestions, scorePercent: attempt.scorePercent
    });
    created = true;
  }
  res.status(created ? 201 : 200).json({ certificate: ownerView(cert, req) });
});

router.get("/:certId/pdf", async (req, res) => {
  if (!ID_RE.test(req.params.certId)) return res.status(404).json({ error: msg(req, "certNotFound") });
  const cert = await Certificate.findOne({ certId: req.params.certId, user: req.user._id });   // only the owner can download
  if (!cert) return res.status(404).json({ error: msg(req, "certNotFound") });
  if (cert.status === "revoked") return res.status(403).json({ error: msg(req, "certRevoked") });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="MineGuard-Certificate-' + cert.certId + '.pdf"');
  await drawCertificatePdf(cert, res, safeLang(req.query.lang));
});

module.exports = router;
