// Small helpers shared by the progress, module and quiz routes.
const Progress = require("../models/Progress");

const RANK = { none: 0, started: 1, search: 2, lesson: 3 };

function statusOf(p) {
  if (p && p.completed) return "completed";
  if (p && p.checkpoint !== "none") return "in_progress";
  return "not_started";
}

async function getProgress(userId, moduleKey) {
  return Progress.findOne({ user: userId, moduleKey });
}

module.exports = { RANK, statusOf, getProgress };
