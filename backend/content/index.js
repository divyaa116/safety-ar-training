// List of all training modules the server knows about.
const modules = { fire: require("./fireModule") };
const LANGS = ["en", "ta"];

function safeLang(l) { return LANGS.includes(l) ? l : "en"; }
function pick(obj, lang) { return (obj && (obj[lang] || obj.en)) || ""; }

module.exports = { modules, safeLang, pick };
