/* utils.js - tiny helpers and the shared state variables used by every other file
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

let phase="idle", i=0, t0=0, foundTime=0, fireT=null, qi=0, score=0, answered=false, workerName="", workerId="";
const $ = id => document.getElementById(id);
const show = id => $(id).style.display="block";
const hide = id => $(id).style.display="none";

function toast(msg,color,ms){ const t=$("toast"); t.textContent=msg; t.style.background=color; t.style.display="block"; setTimeout(()=>t.style.display="none",ms||2200); }
