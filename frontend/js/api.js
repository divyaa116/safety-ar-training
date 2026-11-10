/* api.js - one small helper for talking to the backend.
   The website and the backend live at the same address, so we use relative paths like "/api/auth/me". */

async function api(method, path, body) {
  let res;
  try {
    res = await fetch("/api" + path + (path.indexOf("?") >= 0 ? "&" : "?") + "lang=" + lang, {
      method: method,
      headers: body ? { "Content-Type": "application/json" } : {},
      credentials: "same-origin",
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    const err = new Error(t("err.network"));
    err.network = true;
    throw err;
  }
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const err = new Error(data.error || t("err.generic"));
    err.status = res.status;
    throw err;
  }
  return data;
}
