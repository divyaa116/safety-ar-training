/* quiz.js - the quiz screens. The worker gets instant "right / wrong" feedback after EVERY answer.
   The server marks each answer and LOCKS it, so a score cannot be changed from this page. */

let quizQs = [], quizTotal = 5, quizAttemptId = null, quizFeedback = [], quizResult = null, quizLocked = false;

async function startQuiz() {
  phase = "quiz"; fireOut = false;
  hide("arrow"); hide("lesson"); hide("held"); $("spray").className = ""; hide("result");
  try {
    await api("POST", "/progress/fire/checkpoint", { checkpoint: "lesson" });   // "I finished the lesson"
    const q = await api("POST", "/quiz/fire/start");
    quizQs = q.questions; quizTotal = q.total; quizAttemptId = q.attemptId;
    qi = 0; quizFeedback = []; quizResult = null;
    show("quiz"); renderQ();
  } catch (err) {
    phase = "lesson"; show("lesson"); show("held");
    toast(err.message, "rgba(127,29,29,.95)", 3500);
  }
}

function renderQ() {
  const q = quizQs[qi];
  quizLocked = false;
  $("qmeta").textContent = t("quiz.q", { n: qi + 1, t: quizQs.length });
  $("qtext").textContent = q.text;
  $("qopts").innerHTML = "";
  q.options.forEach((t, k) => {
    const b = document.createElement("button");
    b.className = "opt"; b.textContent = t; b.onclick = () => pick(k);
    $("qopts").appendChild(b);
  });
  hide("qexp"); hide("qnext");
}

// The worker taps an answer: send it to the server, then show right/wrong and the explanation.
async function pick(k) {
  if (quizLocked) return;
  quizLocked = true;
  const q = quizQs[qi], btns = [...$("qopts").children];
  btns[k].classList.add("sel");
  try {
    const f = await api("POST", "/quiz/fire/answer", { attemptId: quizAttemptId, questionId: q.id, selected: k });
    quizFeedback[qi] = f;
    btns.forEach(b => b.disabled = true);
    btns[f.correctIndex].classList.add("good");
    if (!f.correct) btns[k].classList.add("bad");
    $("qexp").textContent = t(f.correct ? "quiz.right" : "quiz.wrong") + f.explanation;
    show("qexp");
    if (f.finished) { quizResult = f.result; score = f.result.correctCount; }
    $("qnext").textContent = t(qi === quizQs.length - 1 ? "quiz.result" : "quiz.next");
    show("qnext");
  } catch (err) {
    btns[k].classList.remove("sel");
    toast(err.message, "rgba(127,29,29,.95)", 3500);
    if (err.status === 404) setTimeout(startQuiz, 1600);   // the attempt expired: start a fresh one
    else quizLocked = false;
  }
}

function nextQ() {
  if (qi < quizQs.length - 1) { qi++; renderQ(); return; }
  if (quizResult) showResult(quizResult);
}

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function showResult(r) {
  hide("quiz"); show("result");
  $("rtitle").textContent = t(r.passed ? "res.pass" : "res.fail");
  $("rtext").textContent = t("res.score", { c: r.correctCount, t: r.total, p: r.scorePercent }) + (r.passed
    ? t("res.passMsg", { name: workerName })
    : t("res.failMsg", { n: r.passCorrect, p: r.passPercent }));
  $("rreview").innerHTML = r.review.map((x, n) => {
    const q = quizQs[n];
    return x.correct
      ? '<div class="rv good"><b>&#10004; ' + esc(q.text) + '</b></div>'
      : '<div class="rv bad"><b>&#10008; ' + esc(q.text) + '</b><br>' + t('res.yours') + esc(q.options[x.selected]) +
        '<br>' + t('res.correct') + esc(q.options[x.correctIndex]) + '<br><i>' + esc(x.explanation) + '</i></div>';
  }).join("");
  $("rcert").style.display = r.passed ? "block" : "none";
  $("rretry").style.display = r.passed ? "none" : "block";
  $("rlesson").style.display = r.passed ? "none" : "block";
}
