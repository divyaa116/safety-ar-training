/* quiz.js - quiz questions and the quiz screens. NOTE: scoring still happens in the browser. Phase 5 moves it to the backend.
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

const PASS_MARK = 4;                                         // out of 5 questions

const QUIZ = [
  { q:"A fire starts at an electrical panel in the mine. What should you do FIRST?",
    o:["Fight it alone with a bucket of water","Alert others and raise the alarm","Ignore it because it is small","Take a photo for the report"], a:1,
    e:"Always alert others first, so everyone can get out safely and help can come." },
  { q:"Which of these must NOT be used on an electrical fire?",
    o:["CO2 extinguisher","Dry powder extinguisher","A bucket of water","All three are safe"], a:2,
    e:"Water conducts electricity and can cause a deadly shock." },
  { q:"What does PASS stand for?",
    o:["Push, Aim, Spray, Stop","Pull, Aim, Squeeze, Sweep","Pull, Alert, Shout, Spray","Pick, Aim, Squeeze, Stand"], a:1,
    e:"Pull the pin, Aim at the base, Squeeze the handle, Sweep side to side." },
  { q:"Where should you aim the extinguisher?",
    o:["At the top of the flames","At the smoke","At the base of the fire","At the ceiling"], a:2,
    e:"The base is the fuel source. Hitting the flames alone will not put the fire out." },
  { q:"While fighting a small fire, where should your exit be?",
    o:["Behind the fire","Behind you","Far away from you","It does not matter"], a:1,
    e:"Keep the exit behind you so you can leave quickly if the fire grows." }
];

/* ======== quiz ======== */
function startQuiz(){
  phase="quiz"; qi=0; score=0;
  hide("lesson"); hide("held"); $("spray").className=""; hide("result");
  show("quiz"); renderQ();
}
function renderQ(){
  const q=QUIZ[qi]; answered=false;
  $("qmeta").textContent="Question "+(qi+1)+" of "+QUIZ.length;
  $("qtext").textContent=q.q;
  $("qopts").innerHTML="";
  q.o.forEach((t,k)=>{
    const b=document.createElement("button"); b.className="opt"; b.textContent=t; b.onclick=()=>pick(k,b);
    $("qopts").appendChild(b);
  });
  hide("qexp"); hide("qnext");
  $("qnext").textContent = (qi===QUIZ.length-1) ? "See result" : "Next";
}
function pick(k,btn){
  if(answered) return; answered=true;
  const q=QUIZ[qi], all=$("qopts").children;
  if(k===q.a){ score++; btn.classList.add("good"); } else { btn.classList.add("bad"); all[q.a].classList.add("good"); }
  $("qexp").textContent=(k===q.a?"Correct. ":"Not quite. ")+q.e;
  show("qexp"); show("qnext");
}
function nextQ(){ qi++; if(qi>=QUIZ.length) showResult(); else renderQ(); }
function showResult(){
  hide("quiz"); show("result");
  const pass=score>=PASS_MARK;
  $("rtitle").textContent = pass ? "You passed!" : "Not passed yet";
  $("rtext").textContent = "Your score: "+score+" out of "+QUIZ.length+". "+(pass
    ? "Well done, "+workerName+". You can now generate your certificate."
    : "You need at least "+PASS_MARK+" correct answers. Review the lesson or try again.");
  $("rcert").style.display = pass ? "block" : "none";
  $("rretry").style.display = pass ? "none" : "block";
  $("rlesson").style.display = pass ? "none" : "block";
}

