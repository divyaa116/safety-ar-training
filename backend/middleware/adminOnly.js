// Use after requireAuth. Lets only administrators through. The role is read from the DATABASE on every request,
// so hiding a button on the page is never what protects an admin action.
const msg = require("../i18n/messages");

module.exports = function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: msg(req, "adminOnly") });
  next();
};
