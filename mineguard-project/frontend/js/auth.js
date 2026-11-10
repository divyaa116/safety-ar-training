/* auth.js - login, register, logout, and the worker dashboard screen. */

let currentUser = null, moduleInfo = null;

function showTab(which) {
  const login = which === "login";
  $("loginForm").style.display = login ? "block" : "none";
  $("registerForm").style.display = login ? "none" : "block";
  $("tabLogin").className = login ? "on" : "";
  $("tabRegister").className = login ? "" : "on";
  setAuthMsg("");
}

function setAuthMsg(text, good) {
  const m = $("authMsg");
  m.textContent = text || "";
  m.className = "msg" + (text ? (good ? " ok" : " bad") : "");
}

function showAuth(message) {
  hide("loading"); hide("dashboard"); show("auth");
  if (message) setAuthMsg(message);
}

function showDashboard(user) {
  currentUser = user;
  hide("loading"); hide("auth"); show("dashboard");
  setWelcome();
  $("adminLink").style.display = user.role === "admin" ? "block" : "none";
  loadModules();
}

function setWelcome() {
  if (!currentUser) return;
  $("dWelcome").textContent = t("dash.welcome", { name: currentUser.fullName });
  $("dMeta").textContent = currentUser.workerId ? t("dash.workerId", { id: currentUser.workerId }) : currentUser.email;
}

/* Asks the server how the worker is doing in each module, then fills in the dashboard card. */
async function loadModules() {
  try {
    const r = await api("GET", "/modules");
    moduleInfo = r.modules.find(m => m.key === "fire") || null;
    renderModuleCard();
  } catch (e) {}
}

function renderModuleCard() {
  const m = moduleInfo; if (!m) return;
  $("statusA").textContent = t("status." + m.status);
  $("statusA").className = "badge " + m.status;
  $("startBtn").textContent = t(m.status === "completed" ? "btn.replay" : (m.status === "in_progress" ? "btn.restart" : "btn.start"));
  if (m.enabled === false) { $("startBtn").textContent = t("btn.unavailable"); $("startBtn").disabled = true; } else $("startBtn").disabled = false;
  const cb = $("certBtn");
  if (m.status === "completed") {
    cb.style.display = "block";
    cb.textContent = t(!m.certificate ? "btn.certGet" : (m.certificate.status === "revoked" ? "btn.certRevoked" : "btn.certView"));
    cb.disabled = !!(m.certificate && m.certificate.status === "revoked");
  } else cb.style.display = "none";
  $("statsA").textContent = m.attemptCount
    ? t("stats.line", { best: m.bestScorePercent, c: m.lastAttempt.correct, t: m.lastAttempt.total, n: m.attemptCount })
    : t("stats.none");
  $("histA").innerHTML = m.recentAttempts.map(a =>
    '<div class="hrow"><span>' + new Date(a.date).toLocaleDateString() + '</span><span>' + a.correct + "/" + a.total +
    '</span><span class="' + (a.passed ? "pass" : "fail") + '">' + t(a.passed ? "hist.passed" : "hist.failed") + "</span></div>").join("");
}

async function submitLogin(e) {
  e.preventDefault();
  setAuthMsg("");
  const btn = $("liBtn"); btn.disabled = true;
  try {
    const r = await api("POST", "/auth/login", { email: $("liEmail").value, password: $("liPass").value });
    $("liPass").value = "";
    showDashboard(r.user);
    if (r.user.language !== lang) api("PATCH", "/auth/language", { language: lang }).catch(() => {});
  } catch (err) { setAuthMsg(err.message); }
  btn.disabled = false;
}

async function submitRegister(e) {
  e.preventDefault();
  setAuthMsg("");
  if ($("rgPass").value !== $("rgPass2").value) { setAuthMsg(t("auth.mismatch")); return; }
  const btn = $("rgBtn"); btn.disabled = true;
  try {
    const r = await api("POST", "/auth/register", {
      fullName: $("rgName").value, email: $("rgEmail").value, workerId: $("rgWid").value, password: $("rgPass").value, language: lang
    });
    $("rgPass").value = ""; $("rgPass2").value = "";
    showDashboard(r.user);
  } catch (err) { setAuthMsg(err.message); }
  btn.disabled = false;
}

async function logout() {
  try { await api("POST", "/auth/logout"); } catch (e) {}
  location.href = location.pathname;   // reload so everything starts clean
}

/* Called once when the page opens: are we already logged in? */
async function initAuth() {
  try {
    const r = await api("GET", "/auth/me");
    if (!langWasStored && r.user.language && r.user.language !== lang) setLang(r.user.language, false);
    showDashboard(r.user);
  } catch (err) {
    if (err.network) showAuth(t("auth.serverDown"));
    else showAuth();
  }
}
