// Saves "I reached this stage" checkpoints. Stages must be reached in order, so a worker cannot jump to the quiz.
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Progress = require("../models/Progress");
const msg = require("../i18n/messages");
const { isEnabled } = require("../services/moduleService");
const { modules } = require("../content");
const { RANK } = require("../services/progressService");

const router = express.Router();
router.use(requireAuth);

router.post("/:moduleKey/checkpoint", async (req, res) => {
  const moduleKey = req.params.moduleKey;
  const checkpoint = req.body && req.body.checkpoint;
  if (!modules[moduleKey]) return res.status(404).json({ error: msg(req, "modNotFound") });
  if (!(await isEnabled(moduleKey))) return res.status(403).json({ error: msg(req, "modDisabled") });
  if (!Object.prototype.hasOwnProperty.call(RANK, checkpoint) || checkpoint === "none") return res.status(400).json({ error: msg(req, "badCheckpoint") });

  let p = await Progress.findOne({ user: req.user._id, moduleKey });
  if (!p) p = new Progress({ user: req.user._id, moduleKey });
  const current = RANK[p.checkpoint];
  const wanted = RANK[checkpoint];
  if (wanted > current + 1 && !p.completed) return res.status(400).json({ error: msg(req, "earlierStages") });
  if (wanted > current) p.checkpoint = checkpoint;   // never moves backwards
  await p.save();
  res.json({ ok: true, checkpoint: p.checkpoint, completed: p.completed });
});

module.exports = router;
