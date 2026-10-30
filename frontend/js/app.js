/* app.js - starts the app after all the other files have loaded
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

/* ======== start ======== */
(async function(){
  if(await checkVerify()) return;
  initGL();
  loadImage(BG_FILES, makeTexture);
  render(); loop();
})();
