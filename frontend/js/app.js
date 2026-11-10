/* app.js - starts the app after all the other files have loaded
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

/* Called whenever the language changes: re-writes the text that JavaScript (not the HTML) put on screen. */
function refreshDynamic(){
  if (typeof renderLessonText === "function") renderLessonText();
  if (typeof currentUser !== "undefined" && currentUser) { setWelcome(); renderModuleCard(); }
  if (typeof items !== "undefined") items.forEach(it => { if (it.key && it.el_) it.el_.textContent = t(it.key); });
}

/* ======== start ======== */
(async function(){
  initGL();
  loadImage(BG_FILES, makeTexture);
  render(); loop();
  applyLang();
  initAuth();
})();
