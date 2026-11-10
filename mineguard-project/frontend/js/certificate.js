/* certificate.js - asks the SERVER for the worker's certificate and shows the download and verify links.
   The certificate itself (PDF + QR code) is made and signed off by the server, never by this page. */

async function getCertificate() {
  try {
    const r = await api("POST", "/certificates/fire");
    showCertificate(r.certificate);
  } catch (err) { toast(err.message, "rgba(127,29,29,.95)", 3500); }
}

function showCertificate(c) {
  hide("result"); hide("dashboard"); show("cert");
  $("cName").textContent = currentUser.fullName;
  $("cModule").textContent = c.moduleTitle;
  $("cScore").textContent = t("cert.score", { c: c.correctCount, t: c.totalQuestions, p: c.scorePercent });
  $("cId").textContent = c.certId;
  $("cDate").textContent = new Date(c.issuedAt).toISOString().slice(0, 10);
  $("cPdf").href = c.pdfUrl + "?lang=" + lang;   // the PDF is made in the worker's language
  $("cVerify").href = c.verifyUrl + "?lang=" + lang;
}
