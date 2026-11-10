/* training.js - the PASS lesson steps, the search game, and starting the training
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

const steps = [0, 1, 2, 3, 4];   // the text of each step is in i18n.js (step0.t, step0.x ...)

/* ======== lesson ======== */
function renderLessonText(){
  $("stepTitle").textContent=t("step"+i+".t");
  $("stepText").textContent=t("step"+i+".x");
  $("count").textContent=(i+1)+" / "+steps.length;
  $("fill").style.width=((i+1)/steps.length*100)+"%";
  $("nextBtn").textContent = (i===steps.length-1) ? t("btn.quiz") : "▶";
}
function render(){
  renderLessonText();
  if(phase==="lesson") updateScene();
}
const exitItem=()=>items.find(x=>x.kind==="exit");
function updateScene(){
  show("held");
  $("spray").className = (i>=3) ? (i===4 ? "on sweep" : "on") : "";
  const f=items[0].el_;
  clearTimeout(fireT);
  if(i===4){
    f.classList.add("out");
    fireT=setTimeout(()=>{
      if(i===4&&phase==="lesson"){
        fireOut=true; $("spray").className=""; exitItem().el_.classList.add("hint");
        toast(t("toast.fireOut"),"rgba(21,128,61,.95)",3500);
      }
    },3800);
  } else { f.classList.remove("out"); fireOut=false; exitItem().el_.classList.remove("hint"); }
}
function move(d){
  if(d>0 && i===steps.length-1){ startQuiz(); return; }
  i=Math.max(0,Math.min(steps.length-1,i+d)); render();
}
function reviewLesson(){
  hide("result"); hide("quiz"); phase="lesson"; i=0; fireOut=false; show("lesson"); render();
}

function tapItem(it){
  if(it.kind==="exit"){
    if(phase==="lesson" && fireOut){
      toast(t("toast.left"),"rgba(21,128,61,.95)",1500);
      setTimeout(startQuiz,900);
    } else if(phase==="lesson") toast(t("toast.exitFirst"),"rgba(127,29,29,.95)");
    else if(phase==="search") toast(t("toast.findFirst"),"rgba(127,29,29,.95)");
    return;
  }
  if(phase!=="search") return;
  if(it.kind==="ext"){
    foundTime=Math.floor((Date.now()-t0)/1000);
    enterLesson();
    toast(t("toast.found",{s:foundTime}),"rgba(21,128,61,.95)");
    api("POST","/progress/fire/checkpoint",{checkpoint:"search"}).catch(()=>{});   // save progress
  } else toast(t("toast.wrongBucket"),"rgba(127,29,29,.95)");
}
// Moves from the search to the lesson (also used when a worker comes back and continues).
function enterLesson(){
  phase="lesson";
  items.forEach(x=>{ if(x.kind==="ext"||x.kind==="bucket") x.gone=true; });
  hide("arrow"); hide("timer"); hide("search"); show("lesson");
  updateScene();
}

function openAR(){ const mv=$("hiddenAR"); if(mv.canActivateAR) mv.activateAR(); else alert(t("ar.unsupported")); }

async function startAll(){
  if(!currentUser) return;                       // only logged-in workers can start
  workerName=currentUser.fullName; workerId=currentUser.workerId||"";
  try{
    if(typeof DeviceOrientationEvent!=="undefined" && typeof DeviceOrientationEvent.requestPermission==="function"){
      await DeviceOrientationEvent.requestPermission();
    }
  }catch(e){}
  api("POST","/progress/fire/checkpoint",{checkpoint:"started"}).catch(()=>{});   // save progress
  hide("dashboard"); sizeGL();
  items.forEach(it=>{ if(it.v) it.v.play().catch(()=>{}); });
  az0=null; t0=Date.now(); phase="search"; i=0;
  setTimeout(()=>{ if(!realSensor){ B=rad(90); G=0; haveSensor=true; } },1200);
  setTimeout(()=>{ items.forEach(x=>{ if(x.kind==="ext") x.el_.classList.add("hint"); }); },25000);
}

