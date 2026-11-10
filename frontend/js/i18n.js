/* i18n.js - English and Tamil text for the whole website, and the language switch.
   HTML elements marked data-i18n="key" are filled from this file; JavaScript uses t("key", {values}). */

const I18N = {
  en: {
    "app.title": "Mine Safety Training", "app.module": "Fire & Explosion Response", "loading": "Loading...",
    "auth.intro": "Fire & Explosion Response. Create an account to save your progress and earn a verifiable certificate.",
    "auth.login": "Log in", "auth.register": "Register", "auth.create": "Create account",
    "ph.email": "Email address", "ph.password": "Password", "ph.fullName": "Full name", "ph.workerId": "Worker ID (optional)", "ph.confirm": "Confirm password",
    "auth.hint": "Password: at least 8 characters, with a letter and a number.",
    "auth.mismatch": "The two passwords do not match.", "auth.serverDown": "The server is not reachable right now. Please try again in a moment.",
    "err.network": "Cannot reach the server. Please check your connection and try again.", "err.generic": "Something went wrong. Please try again.",
    "dash.welcome": "Welcome, {name}", "dash.workerId": "Worker ID: {id}",
    "mod.a.title": "Fire & Explosion Response", "mod.a.desc": "Find the extinguisher, learn the PASS steps, put out the fire, then take the quiz.",
    "status.not_started": "Not started", "status.in_progress": "In progress", "status.completed": "Completed",
    "btn.start": "Start training", "btn.restart": "Restart training", "btn.replay": "Replay training",
    "btn.certGet": "Get my certificate", "btn.certView": "View my certificate", "btn.certRevoked": "Certificate revoked", "btn.logout": "Log out", "btn.unavailable": "Currently unavailable", "btn.admin": "Admin dashboard",
    "stats.none": "No quiz attempts yet.", "stats.line": "Best score: {best}%  |  Last: {c}/{t}  |  Attempts: {n}",
    "hist.passed": "Passed", "hist.failed": "Not passed",
    "search.title": "Emergency! Fire at the electrical panel!",
    "search.text": "Turn your phone around to find the correct fire extinguisher on the mine wall. The arrow shows the way. Tap it when you see it.",
    "timer": "Time: {s} s",
    "step0.t": "Do this first", "step0.x": "When a fire starts, alert others first. Use the extinguisher only if the fire is small. Always keep your exit behind you.",
    "step1.t": "P - Pull", "step1.x": "Pull the safety pin of the extinguisher.",
    "step2.t": "A - Aim", "step2.x": "Aim at the base of the fire.",
    "step3.t": "S - Squeeze", "step3.x": "Squeeze the handle.",
    "step4.t": "S - Sweep", "step4.x": "Sweep from side to side across the base of the fire.",
    "btn.quiz": "Quiz ▶", "ar.btn": "View the extinguisher in AR (ARCore)", "ar.unsupported": "AR is not supported on this device",
    "toast.found": "Correct! Extinguisher found in {s} s", "toast.wrongBucket": "Wrong! Never use water on an electrical fire!",
    "toast.fireOut": "Fire is out! Now tap the EXIT sign to leave the area.", "toast.exitFirst": "Put out the fire first, then use the exit.",
    "toast.findFirst": "First find the extinguisher.", "toast.left": "You left the area safely. Now the quiz.",
    "sign.exit": "EXIT ➜", "sign.gas": "⚠ GAS HAZARD", "sign.panel": "440V PANEL",
    "quiz.q": "Question {n} of {t}", "quiz.next": "Next", "quiz.result": "See result", "quiz.right": "Correct! ", "quiz.wrong": "Wrong. ",
    "res.pass": "You passed!", "res.fail": "Not passed yet",
    "res.score": "Your score: {c} out of {t} ({p}%). ", "res.passMsg": "Well done, {name}. You can now generate your certificate.",
    "res.failMsg": "You need at least {n} correct answers ({p}%). Review the lesson or try again.",
    "res.yours": "Your answer: ", "res.correct": "Correct answer: ",
    "res.gen": "Generate my certificate", "res.retry": "Try the quiz again", "res.review": "Review the lesson",
    "cert.title": "Your certificate", "cert.score": "Score: {c} / {t} ({p}%)", "cert.id": "Certificate ID: ", "cert.issued": "Issued: ",
    "cert.pdf": "Download certificate (PDF)", "cert.verify": "Open verification page", "cert.back": "Back to dashboard"
  },
  ta: {
    "app.title": "சுரங்கப் பாதுகாப்புப் பயிற்சி", "app.module": "தீ மற்றும் வெடிப்பு பாதுகாப்பு", "loading": "ஏற்றுகிறது...",
    "auth.intro": "தீ மற்றும் வெடிப்பு பாதுகாப்புப் பயிற்சி. உங்கள் முன்னேற்றத்தைச் சேமிக்கவும், சரிபார்க்கக்கூடிய சான்றிதழ் பெறவும் கணக்கை உருவாக்குங்கள்.",
    "auth.login": "உள்நுழை", "auth.register": "பதிவு செய்", "auth.create": "கணக்கை உருவாக்கு",
    "ph.email": "மின்னஞ்சல் முகவரி", "ph.password": "கடவுச்சொல்", "ph.fullName": "முழுப் பெயர்", "ph.workerId": "பணியாளர் எண் (விருப்பம்)", "ph.confirm": "கடவுச்சொல்லை உறுதிப்படுத்துங்கள்",
    "auth.hint": "கடவுச்சொல்: குறைந்தது 8 எழுத்துகள், ஒரு எழுத்தும் ஒரு எண்ணும் இருக்க வேண்டும்.",
    "auth.mismatch": "இரண்டு கடவுச்சொற்களும் பொருந்தவில்லை.", "auth.serverDown": "சேவையகத்தை இப்போது அணுக முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயலுங்கள்.",
    "err.network": "சேவையகத்தை அணுக முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயலுங்கள்.", "err.generic": "ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயலுங்கள்.",
    "dash.welcome": "வணக்கம், {name}", "dash.workerId": "பணியாளர் எண்: {id}",
    "mod.a.title": "தீ மற்றும் வெடிப்பு பாதுகாப்பு", "mod.a.desc": "தீ அணைப்பானைக் கண்டுபிடியுங்கள், PASS படிகளைக் கற்றுக்கொள்ளுங்கள், தீயை அணையுங்கள், பிறகு வினாடி வினா எழுதுங்கள்.",
    "status.not_started": "தொடங்கவில்லை", "status.in_progress": "நடைபெறுகிறது", "status.completed": "முடிந்தது",
    "btn.start": "பயிற்சியைத் தொடங்கு", "btn.restart": "பயிற்சியை மீண்டும் தொடங்கு", "btn.replay": "பயிற்சியை மீண்டும் செய்",
    "btn.certGet": "என் சான்றிதழைப் பெறு", "btn.certView": "என் சான்றிதழைப் பார்", "btn.certRevoked": "சான்றிதழ் ரத்து செய்யப்பட்டது", "btn.logout": "கணக்கிலிருந்து வெளியேறு", "btn.unavailable": "தற்போது கிடைக்கவில்லை", "btn.admin": "நிர்வாகப் பலகை",
    "stats.none": "இதுவரை வினாடி வினா முயற்சிகள் இல்லை.", "stats.line": "சிறந்த மதிப்பெண்: {best}%  |  கடைசி: {c}/{t}  |  முயற்சிகள்: {n}",
    "hist.passed": "தேர்ச்சி", "hist.failed": "தேர்ச்சி இல்லை",
    "search.title": "அவசரம்! மின் பலகையில் தீ!",
    "search.text": "போனைச் சுற்றித் திருப்பி சுரங்கச் சுவரில் உள்ள சரியான தீ அணைப்பானைக் கண்டுபிடியுங்கள். அம்புக்குறி வழி காட்டும். கண்டதும் அதைத் தொடுங்கள்.",
    "timer": "நேரம்: {s} வி",
    "step0.t": "முதலில் இதைச் செய்யுங்கள்", "step0.x": "தீ பிடித்தால் முதலில் மற்றவர்களை எச்சரிக்கை செய்யுங்கள். தீ சிறியதாக இருந்தால் மட்டும் அணைப்பானைப் பயன்படுத்துங்கள். வெளியேறும் வழி எப்போதும் உங்கள் பின்னால் இருக்க வேண்டும்.",
    "step1.t": "P - இழுக்கவும்", "step1.x": "அணைப்பானின் பாதுகாப்புப் பின்னை இழுக்கவும்.",
    "step2.t": "A - குறி வையுங்கள்", "step2.x": "நெருப்பின் அடிப்பகுதியை நோக்கிக் குறி வையுங்கள்.",
    "step3.t": "S - அழுத்துங்கள்", "step3.x": "கைப்பிடியை அழுத்துங்கள்.",
    "step4.t": "S - இடம் வலமாகத் தெளியுங்கள்", "step4.x": "அணைப்பானை இடமிருந்து வலமாக நகர்த்தி, நெருப்பின் அடிப்பகுதியில் தெளியுங்கள்.",
    "btn.quiz": "வினாடி வினா ▶", "ar.btn": "அணைப்பானை AR-இல் பாருங்கள் (ARCore)", "ar.unsupported": "இந்தச் சாதனத்தில் AR ஆதரிக்கப்படவில்லை",
    "toast.found": "சரி! அணைப்பான் {s} வினாடியில் கிடைத்தது", "toast.wrongBucket": "தவறு! மின் தீக்குத் தண்ணீரைப் பயன்படுத்தக் கூடாது!",
    "toast.fireOut": "தீ அணைந்தது! இப்போது பகுதியை விட்டு வெளியேற வெளியேறு பலகையைத் தொடுங்கள்.", "toast.exitFirst": "முதலில் தீயை அணையுங்கள், பிறகு வெளியேறுங்கள்.",
    "toast.findFirst": "முதலில் தீ அணைப்பானைக் கண்டுபிடியுங்கள்.", "toast.left": "நீங்கள் பாதுகாப்பாக வெளியேறினீர்கள். இப்போது வினாடி வினா.",
    "sign.exit": "வெளியேறு ➜", "sign.gas": "⚠ வாயு ஆபத்து", "sign.panel": "440V மின் பலகை",
    "quiz.q": "கேள்வி {n} / {t}", "quiz.next": "அடுத்து", "quiz.result": "முடிவைப் பார்", "quiz.right": "சரி! ", "quiz.wrong": "தவறு. ",
    "res.pass": "நீங்கள் தேர்ச்சி பெற்றீர்கள்!", "res.fail": "இன்னும் தேர்ச்சி பெறவில்லை",
    "res.score": "உங்கள் மதிப்பெண்: {t}-இல் {c} ({p}%). ", "res.passMsg": "நன்று, {name}. இப்போது உங்கள் சான்றிதழை உருவாக்கலாம்.",
    "res.failMsg": "குறைந்தது {n} சரியான பதில்கள் ({p}%) தேவை. பாடத்தை மீண்டும் பாருங்கள் அல்லது மீண்டும் முயலுங்கள்.",
    "res.yours": "உங்கள் பதில்: ", "res.correct": "சரியான பதில்: ",
    "res.gen": "என் சான்றிதழை உருவாக்கு", "res.retry": "வினாடி வினாவை மீண்டும் முயலுங்கள்", "res.review": "பாடத்தை மீண்டும் பார்",
    "cert.title": "உங்கள் சான்றிதழ்", "cert.score": "மதிப்பெண்: {c} / {t} ({p}%)", "cert.id": "சான்றிதழ் எண்: ", "cert.issued": "வழங்கிய நாள்: ",
    "cert.pdf": "சான்றிதழைப் பதிவிறக்கு (PDF)", "cert.verify": "சரிபார்ப்புப் பக்கத்தைத் திற", "cert.back": "முகப்புக்குத் திரும்பு"
  }
};

let lang = (function () { try { return localStorage.getItem("mg_lang") === "ta" ? "ta" : "en"; } catch (e) { return "en"; } })();
let langWasStored = (function () { try { return !!localStorage.getItem("mg_lang"); } catch (e) { return false; } })();

function t(key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t("app.title");
  document.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.getAttribute("data-i18n")); });
  document.querySelectorAll("[data-i18n-ph]").forEach(e => { e.placeholder = t(e.getAttribute("data-i18n-ph")); });
  document.querySelectorAll(".langsw button").forEach(b => b.classList.toggle("on", b.getAttribute("data-lang") === lang));
  if (typeof refreshDynamic === "function") refreshDynamic();
}

// fromUser = true when the worker tapped the switch (then we also remember it on the server).
function setLang(l, fromUser) {
  lang = l === "ta" ? "ta" : "en";
  try { localStorage.setItem("mg_lang", lang); langWasStored = true; } catch (e) {}
  applyLang();
  if (fromUser !== false && typeof currentUser !== "undefined" && currentUser) api("PATCH", "/auth/language", { language: lang }).catch(() => {});
}
