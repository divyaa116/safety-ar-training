// Quiz: the worker answers one question at a time. Each answer is LOCKED on the server the moment it is given,
// and the server replies right away with "correct / wrong" and the explanation. The final score is worked out
// from the locked answers, so it cannot be changed from the browser.
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");
const Progress = require("../models/Progress");
const msg = require("../i18n/messages");
const { isEnabled } = require("../services/moduleService");
const QuizAttempt = require("../models/QuizAttempt");
const { modules, safeLang, pick } = require("../content");
const { RANK } = require("../services/progressService");

const router = express.Router();
router.use(requireAuth);
router.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false, message: req => ({ error: msg(req, "quizTooMany") }) }));

function needed(mod) { return Math.ceil((mod.passPercent / 100) * mod.questions.length); }

// Starts a new attempt and sends the questions WITHOUT the answers.
router.post("/:moduleKey/start", async (req, res) => {
  const mod = modules[req.params.moduleKey];
  if (!mod) return res.status(404).json({ error: msg(req, "modNotFound") });
  const lang = safeLang(req.query.lang);
  if (!(await isEnabled(mod.key))) return res.status(403).json({ error: msg(req, "modDisabled") });

  // The worker must have reached the end of the lesson first (or have completed this module before).
  const prog = await Progress.findOne({ user: req.user._id, moduleKey: mod.key });
  if (!prog || (!prog.completed && RANK[prog.checkpoint] < RANK.lesson)) return res.status(403).json({ error: msg(req, "trainFirst") });

  await QuizAttempt.deleteMany({ user: req.user._id, moduleKey: mod.key, finished: false });   // drop any abandoned attempt
  const attempt = await QuizAttempt.create({ user: req.user._id, moduleKey: mod.key, totalQuestions: mod.questions.length });
  res.status(201).json({
    attemptId: attempt._id.toString(), moduleKey: mod.key, title: pick(mod.title, lang), passPercent: mod.passPercent,
    passCorrect: needed(mod), total: mod.questions.length,
    questions: mod.questions.map(q => ({ id: q.id, text: pick(q.text, lang), options: q.options[lang] || q.options.en }))
  });
});

// Locks one answer and replies with instant feedback. The last answer also finishes the attempt and returns the result.
router.post("/:moduleKey/answer", async (req, res) => {
  const mod = modules[req.params.moduleKey];
  if (!mod) return res.status(404).json({ error: msg(req, "modNotFound") });
  const lang = safeLang(req.query.lang);
  if (!(await isEnabled(mod.key))) return res.status(403).json({ error: msg(req, "modDisabled") });
  const { attemptId, questionId, selected } = req.body || {};

  if (typeof attemptId !== "string" || !mongoose.isValidObjectId(attemptId)) return res.status(400).json({ error: msg(req, "invalid") });
  const q = mod.questions.find(x => x.id === questionId);
  if (!q) return res.status(400).json({ error: msg(req, "badQuestion") });
  const optionCount = (q.options[lang] || q.options.en).length;
  if (!Number.isInteger(selected) || selected < 0 || selected >= optionCount) return res.status(400).json({ error: msg(req, "badAnswer") });

  const correct = selected === q.correctIndex;   // marking happens here, on the server
  // One atomic step: add the answer ONLY if this attempt is still open and this question was not answered yet.
  const attempt = await QuizAttempt.findOneAndUpdate(
    { _id: attemptId, user: req.user._id, moduleKey: mod.key, finished: false, "answers.questionId": { $ne: questionId } },
    { $push: { answers: { questionId, selected, correct } } },
    { new: true }
  );
  if (!attempt) {
    const exists = await QuizAttempt.findOne({ _id: attemptId, user: req.user._id, moduleKey: mod.key, finished: false });
    return exists
      ? res.status(409).json({ error: msg(req, "alreadyAnswered") })
      : res.status(404).json({ error: msg(req, "attemptGone") });
  }

  const total = mod.questions.length;
  const body = { correct, correctIndex: q.correctIndex, explanation: pick(q.explanation, lang), answered: attempt.answers.length, total, finished: false };

  if (attempt.answers.length === total) {
    const correctCount = attempt.answers.filter(a => a.correct).length;
    const scorePercent = Math.round((correctCount / total) * 100);
    const passed = correctCount >= needed(mod);
    const done = await QuizAttempt.findOneAndUpdate({ _id: attempt._id, finished: false }, { $set: { finished: true, correctCount, scorePercent, passed } }, { new: true });
    if (done) {
      const prog = await Progress.findOne({ user: req.user._id, moduleKey: mod.key });
      if (prog) {
        if (scorePercent > prog.bestScorePercent) prog.bestScorePercent = scorePercent;
        if (passed && !prog.completed) { prog.completed = true; prog.completedAt = new Date(); }
        await prog.save();
      }
      const byId = new Map(attempt.answers.map(a => [a.questionId, a]));
      body.finished = true;
      body.result = {
        attemptId: attempt._id.toString(), correctCount, total, scorePercent, passed, passPercent: mod.passPercent, passCorrect: needed(mod),
        review: mod.questions.map(x => { const a = byId.get(x.id); return { questionId: x.id, correct: a.correct, selected: a.selected, correctIndex: x.correctIndex, explanation: pick(x.explanation, lang) }; })
      };
    }
  }
  res.json(body);
});

router.get("/:moduleKey/attempts", async (req, res) => {
  if (!modules[req.params.moduleKey]) return res.status(404).json({ error: msg(req, "modNotFound") });
  const list = await QuizAttempt.find({ user: req.user._id, moduleKey: req.params.moduleKey, finished: { $ne: false } }).sort({ createdAt: -1 }).limit(50);
  res.json({ attempts: list.map(a => ({ id: a._id.toString(), date: a.createdAt, correct: a.correctCount, total: a.totalQuestions, scorePercent: a.scorePercent, passed: a.passed })) });
});

module.exports = router;
