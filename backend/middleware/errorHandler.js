// Last safety net: logs the real error on the server, but sends the browser only a safe, short message.
const msg = require("../i18n/messages");
module.exports = function errorHandler(err, req, res, next) {
  console.error("Server error:", err.message);
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  const key = status === 413 ? "tooLarge" : (status < 500 ? "invalid" : "server");
  res.status(status).json({ error: msg(req, key) });
};
