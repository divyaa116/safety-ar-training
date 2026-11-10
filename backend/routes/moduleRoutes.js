// The dashboard asks this route: "what are my modules and how am I doing?"
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const QuizAttempt = require("../models/QuizAttempt");
const Progress = require("../models/Progress");
const Certificate = require("../models/Certificate");
const { isEnabled } = require("../services/moduleService");
const { modules, safeLang, pick } = require("../content");
const { statusOf } = require("../services/progressService");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const lang = safeLang(req.query.lang);
  const out = [];
  for (const m of Object.values(modules)) {
    const p = await Progress.findOne({ user: req.user._id, moduleKey: m.key });
    const attempts = await QuizAttempt.find({ user: req.user._id, moduleKey: m.key, finished: { $ne: false } }).sort({ createdAt: -1 }).limit(5);
    const cert = await Certificate.findOne({ user: req.user._id, moduleKey: m.key });
    const total = await QuizAttempt.countDocuments({ user: req.user._id, moduleKey: m.key, finished: { $ne: false } });
    out.push({
      key: m.key,
      enabled: await isEnabled(m.key),
      title: pick(m.title, lang),
      status: statusOf(p),
      checkpoint: p ? p.checkpoint : "none",
      bestScorePercent: p ? p.bestScorePercent : 0,
      attemptCount: total,
      certificate: cert ? { certId: cert.certId, status: cert.status } : null,
      lastAttempt: attempts[0] ? { correct: attempts[0].correctCount, total: attempts[0].totalQuestions, passed: attempts[0].passed } : null,
      recentAttempts: attempts.map(a => ({ date: a.createdAt, correct: a.correctCount, total: a.totalQuestions, scorePercent: a.scorePercent, passed: a.passed }))
    });
  }
  res.json({ modules: out });
});

module.exports = router;
