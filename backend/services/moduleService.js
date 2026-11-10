const ModuleSetting = require("../models/ModuleSetting");

async function isEnabled(key) {
  const s = await ModuleSetting.findOne({ key });
  return !s || s.enabled !== false;
}
module.exports = { isEnabled };
