/* certificate.js - TEMPORARY browser-side certificate and verify page. NOTE: the SECRET below is public and can be forged. Phase 5 replaces this with backend PDF certificates.
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

const SECRET   = "change-this-secret-before-demo-2026";      // used to sign certificates
const MODULE_NAME = "Fire & Explosion Response (Electrical Fire)";

/* ======== signed QR certificate ======== */
function b64e(str){ const bytes=new TextEncoder().encode(str); let s=""; bytes.forEach(b=>s+=String.fromCharCode(b));
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function b64d(b){ b=b.replace(/-/g,"+").replace(/_/g,"/"); while(b.length%4) b+="=";
  const bin=atob(b); return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0))); }
async function hmac(msg){
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,24);
}
function fit(ctx,text,maxW,size,font){ do{ ctx.font=font.replace("{s}",size); size-=2; } while(ctx.measureText(text).width>maxW && size>14); }

async function makeCert(){
  hide("result"); show("cert");
  const id="MSA-"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();
  const date=new Date().toISOString().slice(0,10);
  /* short payload keeps the QR code small and easy to scan */
  const body=b64e(JSON.stringify([id,workerName,workerId,1,score,QUIZ.length,date,foundTime])), sig=await hmac(body);
  const url=location.origin+location.pathname+"?verify="+body+"."+sig;

  const c=$("certCanvas"), x=c.getContext("2d"), W=c.width, H=c.height;
  x.fillStyle="#fffaf0"; x.fillRect(0,0,W,H);
  x.strokeStyle="#7c2d12"; x.lineWidth=10; x.strokeRect(20,20,W-40,H-40);
  x.strokeStyle="#facc15"; x.lineWidth=3; x.strokeRect(36,36,W-72,H-72);
  x.textAlign="center"; x.fillStyle="#7c2d12";
  x.font="bold 46px Georgia, serif"; x.fillText("CERTIFICATE OF COMPLETION",W/2,120);
  x.fillStyle="#44403c"; x.font="22px Arial"; x.fillText("Mine Safety Training Platform",W/2,158);
  x.font="24px Georgia, serif"; x.fillText("This is to certify that",W/2,225);
  x.fillStyle="#1c1917"; fit(x,workerName,800,56,"bold {s}px Georgia, serif"); x.fillText(workerName,W/2,295);
  x.strokeStyle="#a8a29e"; x.lineWidth=1.5; x.beginPath(); x.moveTo(190,312); x.lineTo(W-190,312); x.stroke();
  x.fillStyle="#44403c"; x.font="24px Georgia, serif"; x.fillText("has successfully completed the AR safety training and quiz on",W/2,362);
  x.fillStyle="#7c2d12"; fit(x,MODULE_NAME,800,32,"bold {s}px Georgia, serif"); x.fillText(MODULE_NAME,W/2,408);
  x.fillStyle="#1c1917"; x.font="24px Arial";
  x.fillText("Quiz score: "+score+" / "+QUIZ.length+"   |   Date: "+date,W/2,458);

  x.textAlign="left"; x.fillStyle="#57534e"; x.font="18px Arial";
  x.fillText("Certificate ID: "+id,70,560);
  if(workerId) x.fillText("Worker ID: "+workerId,70,590);
  x.fillText("Signature: "+sig,70,620);
  x.font="16px Arial"; x.fillText("Scan the QR code to verify this certificate.",70,650);

  if(typeof qrcode==="function"){
    /* QR sits in the bottom-right corner, below the text, never overlapping it */
    const qr=qrcode(0,"M"); qr.addData(url); qr.make();
    const n=qr.getModuleCount(), cell=Math.max(4,Math.floor(205/n)), qs=cell*n, pad=12, boxW=qs+pad*2;
    const bx=W-64-boxW, by=H-52-boxW;
    x.fillStyle="#fff"; x.fillRect(bx,by,boxW,boxW);
    x.fillStyle="#000";
    for(let r=0;r<n;r++) for(let k=0;k<n;k++) if(qr.isDark(r,k)) x.fillRect(bx+pad+k*cell,by+pad+r*cell,cell,cell);
  } else {
    x.fillStyle="#b91c1c"; x.font="16px Arial"; x.fillText("QR library not loaded. Check your internet and retry.",W-480,H-100);
  }
  $("dl").href=c.toDataURL("image/png");
}

/* ======== verify page (opened by scanning the QR) ======== */
async function checkVerify(){
  const p=new URLSearchParams(location.search).get("verify");
  if(!p) return false;
  hide("start"); show("verify");
  let ok=false, d=null;
  try{
    const k=p.lastIndexOf("."), body=p.slice(0,k), sig=p.slice(k+1);
    const a=JSON.parse(b64d(body));
    d={id:a[0],n:a[1],w:a[2],m:MODULE_NAME,s:a[4],t:a[5],d:a[6],f:a[7]};
    ok=(await hmac(body))===sig;
  }catch(e){ ok=false; }
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
  $("vbox").innerHTML = ok
    ? '<h2 style="color:#22c55e">✔ Certificate is VALID</h2><p>This certificate was issued by the Mine Safety Training platform and has not been altered.</p>'
      +'<p><b>Name:</b> '+esc(d.n)+'<br>'+(d.w?'<b>Worker ID:</b> '+esc(d.w)+'<br>':'')
      +'<b>Training:</b> '+esc(d.m)+'<br><b>Score:</b> '+esc(d.s)+' / '+esc(d.t)+'<br><b>Date:</b> '+esc(d.d)+'<br><b>Certificate ID:</b> '+esc(d.id)+'</p>'
    : '<h2 style="color:#ef4444">✖ Certificate is NOT valid</h2><p>The data in this QR code does not match its signature. It may have been edited or forged.</p>';
  return true;
}

