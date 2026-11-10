/* admin.js - the administrator page. It only DISPLAYS things; every action is checked again by the server,
   so hiding or showing a button here is never what keeps the system safe. */

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = d => d ? new Date(d).toISOString().replace("T", " ").slice(0, 16) : "";
const day = d => d ? new Date(d).toISOString().slice(0, 10) : "";
const LABEL = { not_started: "Not started", in_progress: "In progress", completed: "Completed" };

async function api(method, path, body) {
  let res;
  try { res = await fetch("/api" + path + (path.indexOf("?") >= 0 ? "&" : "?") + "lang=en", { method, headers: body ? { "Content-Type": "application/json" } : {}, credentials: "same-origin", body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { const err = new Error("Cannot reach the server."); err.network = true; throw err; }
  let data = {}; try { data = await res.json(); } catch (e) {}
  if (!res.ok) { const err = new Error(data.error || "Something went wrong."); err.status = res.status; throw err; }
  return data;
}
function say(text, good) { const m = $("msgBar"); m.textContent = text || ""; m.className = "msg " + (text ? (good ? "ok" : "bad") : ""); if (text) setTimeout(() => { if (m.textContent === text) say(""); }, 5000); }

/* ---------- a small pop-up that asks for a reason ---------- */
function askReason(title, text, required) {
  return new Promise(resolve => {
    $("mTitle").textContent = title; $("mText").textContent = text; $("mInput").value = ""; $("mErr").textContent = ""; $("modal").style.display = "flex"; $("mInput").focus();
    const done = v => { $("modal").style.display = "none"; $("mOk").onclick = $("mCancel").onclick = null; resolve(v); };
    $("mCancel").onclick = () => done(null);
    $("mOk").onclick = () => { const v = $("mInput").value.trim(); if (required && v.length < 3) { $("mErr").textContent = "Please type a reason (at least 3 characters)."; return; } done(v); };
  });
}

/* ---------- sign in / out ---------- */
async function showApp(user) {
  $("loginView").classList.add("hide"); $("appView").classList.remove("hide");
  $("who").textContent = user;
  openTab("overview");
}
async function tryResume() {
  try { const me = await api("GET", "/auth/me"); await api("GET", "/admin/stats"); showApp(me.user.fullName); }
  catch (e) { $("loginView").classList.remove("hide"); $("appView").classList.add("hide"); }
}
$("loginForm").onsubmit = async ev => {
  ev.preventDefault(); $("loginMsg").textContent = ""; $("loginMsg").className = "msg bad";
  try {
    const r = await api("POST", "/auth/login", { email: $("aEmail").value, password: $("aPass").value });
    try { await api("GET", "/admin/stats"); } catch (e) { await api("POST", "/auth/logout").catch(() => {}); throw new Error("This account is not an administrator."); }
    $("aPass").value = ""; showApp(r.user.fullName);
  } catch (err) { $("loginMsg").textContent = err.message; }
};
$("logoutBtn").onclick = async () => { await api("POST", "/auth/logout").catch(() => {}); location.reload(); };

/* ---------- tabs ---------- */
function openTab(name) {
  document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
  ["overview", "workers", "certs", "modules", "audit"].forEach(t => $("tab-" + t).classList.toggle("hide", t !== name));
  say("");
  ({ overview: loadStats, workers: () => loadWorkers(1), certs: () => loadCerts(1), modules: loadModules, audit: loadAudit })[name]();
}
$("tabs").onclick = e => { if (e.target.dataset && e.target.dataset.tab) openTab(e.target.dataset.tab); };
function fail(err) { if (err.status === 401 || err.status === 403) { say("Your session has ended or you are not an administrator. Please sign in again.", false); setTimeout(() => location.reload(), 1500); } else say(err.message, false); }

/* ---------- overview ---------- */
async function loadStats() {
  try {
    const s = await api("GET", "/admin/stats");
    const items = [["Registered workers", s.totalWorkers], ["Active accounts", s.activeWorkers], ["Disabled accounts", s.disabledWorkers], ["New this week", s.newThisWeek],
      ["Modules completed", s.modulesCompleted], ["Modules in progress", s.modulesInProgress], ["Quiz attempts", s.quizAttempts], ["Quiz pass rate", s.passRatePercent + "%"],
      ["Valid certificates", s.certificatesValid], ["Revoked certificates", s.certificatesRevoked]];
    $("stats").innerHTML = items.map(i => '<div class="stat"><b>' + esc(i[1]) + "</b><span>" + esc(i[0]) + "</span></div>").join("");
  } catch (e) { fail(e); }
}

/* ---------- workers ---------- */
let wPage = 1, wTotal = 0, wLimit = 15;
async function loadWorkers(page) {
  wPage = page;
  try {
    const r = await api("GET", "/admin/workers?page=" + page + "&limit=" + wLimit + "&q=" + encodeURIComponent($("wSearch").value));
    wTotal = r.total;
    $("wRows").innerHTML = r.workers.map(w => '<tr class="click" data-id="' + esc(w.id) + '"><td>' + esc(w.fullName) + "</td><td>" + esc(w.email) + "</td><td>" + esc(w.workerId) +
      '</td><td><span class="badge ' + esc(w.modules.fire) + '">' + esc(LABEL[w.modules.fire]) + '</span></td><td><span class="badge ' + (w.isActive ? "active" : "disabled") + '">' + (w.isActive ? "Active" : "Disabled") + "</span></td><td>" + esc(day(w.createdAt)) + "</td></tr>").join("")
      || '<tr><td colspan="6" style="color:#a8a29e">No workers found.</td></tr>';
    $("wPage").textContent = "Page " + page + " of " + Math.max(1, Math.ceil(wTotal / wLimit)) + "  (" + wTotal + " workers)";
  } catch (e) { fail(e); }
}
$("wGo").onclick = () => loadWorkers(1); $("wSearch").onkeydown = e => { if (e.key === "Enter") loadWorkers(1); };
$("wPrev").onclick = () => { if (wPage > 1) loadWorkers(wPage - 1); }; $("wNext").onclick = () => { if (wPage * wLimit < wTotal) loadWorkers(wPage + 1); };
$("wRows").onclick = e => { const tr = e.target.closest("tr[data-id]"); if (tr) openWorker(tr.dataset.id); };

async function openWorker(id) {
  try {
    const d = await api("GET", "/admin/workers/" + encodeURIComponent(id)); const w = d.worker;
    $("wDetail").innerHTML = '<div class="card"><div class="row"><h2 class="grow">' + esc(w.fullName) + '</h2><span class="badge ' + (w.isActive ? "active" : "disabled") + '">' + (w.isActive ? "Active" : "Disabled") + '</span>' +
      '<button class="btn small ' + (w.isActive ? "red" : "green") + '" id="toggleAcc">' + (w.isActive ? "Disable account" : "Enable account") + "</button></div>" +
      "<p>Email: " + esc(w.email) + " &nbsp;|&nbsp; Worker ID: " + esc(w.workerId || "-") + " &nbsp;|&nbsp; Language: " + esc(w.language) + " &nbsp;|&nbsp; Joined: " + esc(day(w.createdAt)) + "</p>" +
      "<h3 style='margin-top:14px'>Modules</h3>" + d.modules.map(m => '<div class="modbox"><div class="row"><b class="grow">' + esc(m.title) + '</b><span class="badge ' + esc(m.status) + '">' + esc(LABEL[m.status]) + '</span>' +
        '<button class="btn small alt" data-reset="' + esc(m.key) + '">Reset progress</button></div><p style="margin:8px 0 0;color:#a8a29e">Best score: ' + esc(m.bestScorePercent) + "% &nbsp;|&nbsp; Quiz attempts: " + esc(m.attemptCount) + "</p></div>").join("") +
      "<h3 style='margin-top:14px'>Quiz history</h3><div class='tablebox'><table><thead><tr><th>When</th><th>Score</th><th>Result</th></tr></thead><tbody>" +
      (d.attempts.map(a => "<tr><td>" + esc(fmt(a.date)) + "</td><td>" + esc(a.correct + "/" + a.total + " (" + a.scorePercent + "%)") + '</td><td><span class="badge ' + (a.passed ? "valid" : "revoked") + '">' + (a.passed ? "Passed" : "Not passed") + "</span></td></tr>").join("") || '<tr><td colspan="3" style="color:#a8a29e">No quiz attempts.</td></tr>') +
      "</tbody></table></div><h3 style='margin-top:14px'>Certificates</h3><div class='tablebox'><table><thead><tr><th>Certificate ID</th><th>Issued</th><th>Status</th><th></th></tr></thead><tbody>" +
      (d.certificates.map(c => "<tr><td>" + esc(c.certId) + "</td><td>" + esc(day(c.issuedAt)) + '</td><td><span class="badge ' + esc(c.status) + '">' + esc(c.status) + "</span>" + (c.status === "revoked" ? "<br><small>" + esc(c.revokedReason) + "</small>" : "") + "</td><td>" +
        (c.status === "valid" ? '<button class="btn small red" data-revoke="' + esc(c.certId) + '">Revoke</button>' : "") + "</td></tr>").join("") || '<tr><td colspan="4" style="color:#a8a29e">No certificates.</td></tr>') + "</tbody></table></div></div>";
    $("toggleAcc").onclick = async () => {
      const turnOff = w.isActive; const reason = await askReason(turnOff ? "Disable this account?" : "Enable this account?", turnOff ? w.fullName + " will be signed out and cannot log in." : w.fullName + " will be able to log in again.", false); if (reason === null) return;
      try { await api("PATCH", "/admin/workers/" + id + "/status", { isActive: !w.isActive, reason }); say("Account updated.", true); openWorker(id); loadWorkers(wPage); } catch (e) { fail(e); }
    };
    $("wDetail").querySelectorAll("[data-reset]").forEach(b => b.onclick = async () => {
      const reason = await askReason("Reset progress?", "This sends " + w.fullName + " back to the start of the module. Their quiz history and certificates are kept.", false); if (reason === null) return;
      try { await api("POST", "/admin/workers/" + id + "/modules/" + b.dataset.reset + "/reset", { reason }); say("Progress reset.", true); openWorker(id); loadWorkers(wPage); } catch (e) { fail(e); }
    });
    $("wDetail").querySelectorAll("[data-revoke]").forEach(b => b.onclick = () => revoke(b.dataset.revoke, () => openWorker(id)));
    $("wDetail").scrollIntoView({ behavior: "smooth" });
  } catch (e) { fail(e); }
}

/* ---------- certificates ---------- */
let cPage = 1, cTotal = 0, cLimit = 15;
async function loadCerts(page) {
  cPage = page;
  try {
    const r = await api("GET", "/admin/certificates?page=" + page + "&limit=" + cLimit + "&status=" + encodeURIComponent($("cStatus").value) + "&q=" + encodeURIComponent($("cSearch").value));
    cTotal = r.total;
    $("cRows").innerHTML = r.certificates.map(c => "<tr><td>" + esc(c.certId) + "</td><td>" + esc(c.fullName) + "<br><small style='color:#a8a29e'>" + esc(c.email) + "</small></td><td>" + esc(c.moduleTitle) + "</td><td>" + esc(c.scorePercent) + "%</td><td>" + esc(day(c.issuedAt)) +
      '</td><td><span class="badge ' + esc(c.status) + '">' + esc(c.status) + "</span>" + (c.status === "revoked" ? "<br><small>" + esc(c.revokedReason) + "</small>" : "") + "</td><td>" +
      '<a class="btn alt small" style="text-decoration:none" target="_blank" rel="noopener" href="/verify/' + esc(c.certId) + '">Open</a> ' + (c.status === "valid" ? '<button class="btn small red" data-revoke="' + esc(c.certId) + '">Revoke</button>' : "") + "</td></tr>").join("")
      || '<tr><td colspan="7" style="color:#a8a29e">No certificates found.</td></tr>';
    $("cPage").textContent = "Page " + page + " of " + Math.max(1, Math.ceil(cTotal / cLimit)) + "  (" + cTotal + " certificates)";
    $("cRows").querySelectorAll("[data-revoke]").forEach(b => b.onclick = () => revoke(b.dataset.revoke, () => loadCerts(cPage)));
  } catch (e) { fail(e); }
}
$("cGo").onclick = () => loadCerts(1); $("cSearch").onkeydown = e => { if (e.key === "Enter") loadCerts(1); };
$("cPrev").onclick = () => { if (cPage > 1) loadCerts(cPage - 1); }; $("cNext").onclick = () => { if (cPage * cLimit < cTotal) loadCerts(cPage + 1); };

async function revoke(certId, after) {
  const reason = await askReason("Revoke certificate " + certId + "?", "Scanning its QR code will then show REVOKED, and the PDF can no longer be downloaded. This is recorded in the audit log.", true); if (reason === null) return;
  try { await api("POST", "/admin/certificates/" + encodeURIComponent(certId) + "/revoke", { reason }); say("Certificate revoked.", true); after(); } catch (e) { fail(e); }
}

/* ---------- modules ---------- */
async function loadModules() {
  try {
    const r = await api("GET", "/admin/modules");
    $("modList").innerHTML = "<p style='color:#a8a29e;margin:0 0 6px'>Switching a module off stops workers from starting its training or quiz. Progress and history are kept.</p>" +
      r.modules.map(m => '<div class="modbox"><div class="row"><b class="grow">' + esc(m.title) + '</b><span class="badge ' + (m.enabled ? "active" : "disabled") + '">' + (m.enabled ? "On" : "Off") + '</span><button class="btn small ' + (m.enabled ? "red" : "green") + '" data-mod="' + esc(m.key) + '" data-to="' + (m.enabled ? "0" : "1") + '">' + (m.enabled ? "Switch off" : "Switch on") + "</button></div></div>").join("");
    $("modList").querySelectorAll("[data-mod]").forEach(b => b.onclick = async () => {
      try { await api("PATCH", "/admin/modules/" + b.dataset.mod, { enabled: b.dataset.to === "1" }); say("Module updated.", true); loadModules(); } catch (e) { fail(e); }
    });
  } catch (e) { fail(e); }
}

/* ---------- audit log ---------- */
async function loadAudit() {
  try {
    const r = await api("GET", "/admin/audit?limit=100");
    $("aRows").innerHTML = r.entries.map(a => "<tr><td>" + esc(fmt(a.date)) + "</td><td>" + esc(a.admin) + "</td><td>" + esc(a.action.replace(/_/g, " ")) + "</td><td>" + esc(a.worker) + "</td><td>" + esc(a.target) + "</td><td>" + esc(a.details) + "</td></tr>").join("")
      || '<tr><td colspan="6" style="color:#a8a29e">Nothing recorded yet.</td></tr>';
  } catch (e) { fail(e); }
}

tryResume();
