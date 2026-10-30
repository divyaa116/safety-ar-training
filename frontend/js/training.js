/* training.js - the PASS lesson steps, the search game, and starting the training
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

const steps = [
  { t:"Do this first", x:"When a fire starts, alert others first. Use the extinguisher only if the fire is small. Always keep your exit behind you." },
  { t:"P - Pull", x:"Pull the safety pin of the extinguisher." },
  { t:"A - Aim", x:"Aim at the base of the fire." },
  { t:"S - Squeeze", x:"Squeeze the handle." },
  { t:"S - Sweep", x:"Sweep from side to side across the base of the fire." }
];

/* ======== lesson ======== */
function render(){
  $("stepTitle").textContent=steps[i].t;
  $("stepText").textContent=steps[i].x;
  $("count").textContent=(i+1)+" / "+steps.length;
  $("fill").style.width=((i+1)/steps.length*100)+"%";
  $("nextBtn").textContent = (i===steps.length-1) ? "Quiz ▶" : "▶";
  if(phase==="lesson") updateScene();
}
function updateScene(){
  show("held");
  $("spray").className = (i>=3) ? (i===4 ? "on sweep" : "on") : "";
  const f=items[0].el_;
  clearTimeout(fireT);
  if(i===4){
    f.classList.add("out");
    fireT=setTimeout(()=>{ if(i===4&&phase==="lesson"){ toast("Fire is out! Well done!","rgba(21,128,61,.95)"); $("spray").className=""; } },3800);
  } else f.classList.remove("out");
}
function move(d){
  if(d>0 && i===steps.length-1){ startQuiz(); return; }
  i=Math.max(0,Math.min(steps.length-1,i+d)); render();
}
function reviewLesson(){
  hide("result"); hide("quiz"); phase="lesson"; i=0; show("lesson"); render();
}

function tapItem(it){
  if(phase!=="search") return;
  if(it.kind==="ext"){
    foundTime=Math.floor((Date.now()-t0)/1000);
    phase="lesson";
    items.forEach(x=>{ if(x.kind) x.gone=true; });
    hide("arrow"); hide("timer"); hide("search"); show("lesson");
    toast("Correct! Extinguisher found in "+foundTime+" s","rgba(21,128,61,.95)");
    updateScene();
  } else toast("Wrong! Never use water on an electrical fire!","rgba(127,29,29,.95)");
}
function openAR(){ const mv=$("hiddenAR"); if(mv.canActivateAR) mv.activateAR(); else alert("AR is not supported on this device"); }

async function startAll(){
  workerName=$("wname").value.trim(); workerId=$("wid").value.trim();
  if(workerName.length<2){ $("err").textContent="Please enter your name."; return; }
  try{
    if(typeof DeviceOrientationEvent!=="undefined" && typeof DeviceOrientationEvent.requestPermission==="function"){
      await DeviceOrientationEvent.requestPermission();
    }
  }catch(e){}
  hide("start"); sizeGL();
  items.forEach(it=>{ if(it.v) it.v.play().catch(()=>{}); });
  az0=null; t0=Date.now(); phase="search"; i=0;
  setTimeout(()=>{ if(!realSensor){ B=rad(90); G=0; haveSensor=true; } },1200);
  setTimeout(()=>{ items.forEach(x=>{ if(x.kind==="ext") x.el_.classList.add("hint"); }); },25000);
}

