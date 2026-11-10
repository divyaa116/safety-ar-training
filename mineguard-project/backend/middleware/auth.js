// Checks that a request comes from a logged-in user. The login "ticket" (a signed token) lives in a cookie
// that JavaScript on the page cannot read (httpOnly), which keeps it safer from theft.
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const msg = require("../i18n/messages");

const COOKIE_NAME = "mg_token";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: WEEK_MS, path: "/" };
}

function issueToken(res, user) {
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function clearToken(res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

async function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: msg(req, "loginRequired") });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    // Look the user up every time, so a disabled account or a changed role takes effect immediately.
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: msg(req, "loginRequired") });
    if (!user.isActive) return res.status(403).json({ error: msg(req, "disabled") });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: msg(req, "loginAgain") });
  }
}

module.exports = { requireAuth, issueToken, clearToken };
