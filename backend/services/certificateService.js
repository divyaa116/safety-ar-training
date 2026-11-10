// Issues certificate records and draws the PDF. Everything here runs on the server.
const crypto = require("crypto");
const path = require("path");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const Certificate = require("../models/Certificate");
const { modules, pick } = require("../content");

const ID_RE = /^MG-[A-Z2-7]{10}$/;
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function newCertId() {
  const bytes = crypto.randomBytes(10);
  let s = "";
  for (const b of bytes) s += B32[b % 32];
  return "MG-" + s;
}

async function createCertificate(data) {
  for (let i = 0; i < 5; i++) {
    try { return await Certificate.create({ ...data, certId: newCertId() }); }
    catch (err) { if (!(err && err.code === 11000 && /certId/.test(String(err.message)))) throw err; }
  }
  throw new Error("Could not create a unique certificate ID.");
}

function baseUrl() { return (process.env.PUBLIC_BASE_URL || "http://localhost:" + (process.env.PORT || 3000)).replace(/\/+$/, ""); }
function verifyUrl(certId) { return baseUrl() + "/verify/" + certId; }

// ---------- PDF drawing ----------
const TEXT = {
  en: { title: "CERTIFICATE OF COMPLETION", sub: "MineGuard - AR-Based Mining Safety Training", certify: "This is to certify that",
        done: "has successfully completed the training and passed the assessment for", score: "Score", issued: "Issued", id: "Certificate ID", verify: "Verify online", scan: "Scan to verify",
        disc: ["This certificate confirms completion of training in the MineGuard application only. It is not a government-approved licence", "or an accredited qualification. Its status can be checked at any time by scanning the QR code."] },
  ta: { title: "நிறைவுச் சான்றிதழ்", sub: "MineGuard - AR அடிப்படையிலான சுரங்கப் பாதுகாப்புப் பயிற்சி", certify: "இதன் மூலம் சான்றளிக்கப்படுவது",
        done: "பின்வரும் பயிற்சியை வெற்றிகரமாக முடித்து, மதிப்பீட்டில் தேர்ச்சி பெற்றார்", score: "மதிப்பெண்", issued: "வழங்கிய நாள்", id: "சான்றிதழ் எண்", verify: "இணையத்தில் சரிபார்க்க", scan: "சரிபார்க்க ஸ்கேன் செய்யுங்கள்",
        disc: ["இந்தச் சான்றிதழ் இந்தப் பயிற்சிச் செயலியில் பயிற்சியை முடித்ததை மட்டுமே உறுதிப்படுத்துகிறது. இது அரசு அங்கீகாரம் பெற்ற உரிமமோ", "அங்கீகரிக்கப்பட்ட தகுதிச் சான்றோ அல்ல. க்யூஆர் குறியீட்டை ஸ்கேன் செய்து இதன் நிலையை எப்போது வேண்டுமானாலும் சரிபார்க்கலாம்."] }
};
const FONT_DIR = path.join(__dirname, "..", "assets", "fonts");
const TAMIL_RE = /[\u0B80-\u0BFF]/;

// Splits text into runs so Tamil letters use the Tamil font and everything else uses the Latin font.
function runs(text) {
  const out = []; let cur = "", tamil = null;
  for (const ch of text) {
    let t = TAMIL_RE.test(ch);
    if (ch === ":" && tamil !== null) t = tamil;   // keep ":" in the same font as the word before it
    if (tamil === null) tamil = t;
    if (t !== tamil && !/\s/.test(ch)) { out.push({ text: cur, tamil }); cur = ""; tamil = t; }
    cur += ch;
  }
  if (cur) out.push({ text: cur, tamil });
  return out;
}

function drawCentered(doc, text, y, size, bold, color, maxWidth) {
  const rs = runs(text);
  const fontOf = r => (r.tamil ? (bold ? "TamilBold" : "Tamil") : (bold ? "SansBold" : "Sans"));
  const widthAt = s => rs.reduce((w, r) => w + doc.font(fontOf(r)).fontSize(s).widthOfString(r.text), 0);
  let s = size;
  while (widthAt(s) > maxWidth && s > 12) s -= 1;
  let x = (doc.page.width - widthAt(s)) / 2;
  doc.fillColor(color);
  for (const r of rs) {
    doc.font(fontOf(r)).fontSize(s).text(r.text, x, y, { lineBreak: false });
    x += doc.widthOfString(r.text);
  }
}

async function drawCertificatePdf(cert, res, lang) {
  const T = TEXT[lang === "ta" ? "ta" : "en"];
  const moduleTitle = (modules[cert.moduleKey] && pick(modules[cert.moduleKey].title, lang === "ta" ? "ta" : "en")) || cert.moduleTitle;
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0, info: { Title: "MineGuard Certificate " + cert.certId, Author: "MineGuard" } });
  doc.registerFont("Sans", path.join(FONT_DIR, "NotoSans-Regular.ttf"));
  doc.registerFont("SansBold", path.join(FONT_DIR, "NotoSans-Bold.ttf"));
  doc.registerFont("Tamil", path.join(FONT_DIR, "NotoSansTamil-Regular.ttf"));
  doc.registerFont("TamilBold", path.join(FONT_DIR, "NotoSansTamil-Bold.ttf"));
  doc.pipe(res);
  const W = doc.page.width, H = doc.page.height;

  doc.rect(0, 0, W, H).fill("#fffaf0");
  doc.lineWidth(6).strokeColor("#7c2d12").rect(22, 22, W - 44, H - 44).stroke();
  doc.lineWidth(1.5).strokeColor("#facc15").rect(34, 34, W - 68, H - 68).stroke();

  drawCentered(doc, T.title, 62, 32, true, "#7c2d12", W - 140);
  drawCentered(doc, T.sub, 106, 14, false, "#44403c", W - 140);
  drawCentered(doc, T.certify, 160, 15, false, "#44403c", W - 140);
  drawCentered(doc, cert.fullName, 190, 38, true, "#1c1917", W - 180);
  doc.lineWidth(1).strokeColor("#a8a29e").moveTo(170, 246).lineTo(W - 170, 246).stroke();
  drawCentered(doc, T.done, 268, 15, false, "#44403c", W - 140);
  drawCentered(doc, moduleTitle, 296, 24, true, "#7c2d12", W - 180);
  const dateText = cert.issuedAt.toISOString().slice(0, 10);
  drawCentered(doc, T.score + ": " + cert.correctCount + " / " + cert.totalQuestions + " (" + cert.scorePercent + "%)     " + T.issued + ": " + dateText, 346, 15, false, "#1c1917", W - 140);

  const left = (text, y, size, color) => { let x = 70; doc.fillColor(color); for (const r of runs(text)) { doc.font(r.tamil ? "Tamil" : "Sans").fontSize(size).text(r.text, x, y, { lineBreak: false }); x += doc.widthOfString(r.text); } };
  left(T.id + ": " + cert.certId, 440, 11, "#57534e");
  left(T.verify + ": " + verifyUrl(cert.certId), 458, 11, "#57534e");
  const widthOf = (text, size) => runs(text).reduce((w, r) => w + doc.font(r.tamil ? "Tamil" : "Sans").fontSize(size).widthOfString(r.text), 0);
  const lines = []; let cur = "";
  for (const word of T.disc.join(" ").split(" ")) {
    const test = cur ? cur + " " + word : word;
    if (widthOf(test, 8.5) > 560 && cur) { lines.push(cur); cur = word; } else cur = test;
  }
  if (cur) lines.push(cur);
  lines.forEach((ln, k) => left(ln, 488 + k * 12, 8.5, "#78716c"));

  const qr = await QRCode.toBuffer(verifyUrl(cert.certId), { errorCorrectionLevel: "M", margin: 1, width: 400 });
  const qs = 112, qx = W - 70 - qs, qy = 400;
  doc.image(qr, qx, qy, { width: qs });
  doc.font(lang === "ta" ? "Tamil" : "Sans").fontSize(9).fillColor("#57534e").text(T.scan, qx - 10, qy + qs + 3, { width: qs + 20, align: "center", lineBreak: false });
  doc.end();
}

module.exports = { ID_RE, createCertificate, verifyUrl, drawCertificatePdf };
