/* scene.js - phone motion sensors, the WebGL mine background, and the objects placed in the mine
   Loaded as a normal script (not a module), so the functions below are shared with the other files in this folder. */

const BG_FILES = ["mine_bg.jpg", "mining_bakground.jpg"];   // first one found is used

/* ======== sensors + math (portrait and landscape) ======== */
let A=0,B=0,G=0,haveSensor=false,realSensor=false,az0=null;
const rad=d=>d*Math.PI/180;
function mul(a,b){ const r=[[0,0,0],[0,0,0],[0,0,0]];
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)r[i][j]+=a[i][k]*b[k][j]; return r; }
function rotation(a,b,g){
  const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cg=Math.cos(g),sg=Math.sin(g);
  return mul(mul([[ca,-sa,0],[sa,ca,0],[0,0,1]],[[1,0,0],[0,cb,-sb],[0,sb,cb]]),[[cg,0,sg],[0,1,0],[-sg,0,cg]]);
}
function screenAngle(){
  if(screen.orientation && typeof screen.orientation.angle==="number") return screen.orientation.angle;
  if(typeof window.orientation==="number") return window.orientation;
  return 0;
}
function getR(){
  const t=rad(screenAngle()), c=Math.cos(t), s=Math.sin(t);
  return mul(rotation(A,B,G),[[c,s,0],[-s,c,0],[0,0,1]]);
}
function forwardAz(R){ return Math.atan2(-R[0][2],-R[1][2])*180/Math.PI; }
function focal(){ return (Math.max(innerWidth,innerHeight)/2)/Math.tan(rad(32.5)); }

window.addEventListener("deviceorientation",e=>{
  if(e.alpha===null||e.alpha===undefined) return;
  A=rad(e.alpha); B=rad(e.beta); G=rad(e.gamma); haveSensor=true; realSensor=true;
});
let dragging=false,lastX=0;
addEventListener("pointerdown",e=>{ dragging=true; lastX=e.clientX; });
addEventListener("pointerup",()=>dragging=false);
addEventListener("pointermove",e=>{
  if(!dragging||realSensor) return;
  A+=rad((e.clientX-lastX)*0.3); lastX=e.clientX;
});

/* ======== WebGL mine world from the photo ======== */
const pano=$("pano");
const gl=pano.getContext("webgl",{antialias:false});
let prog,U={},texReady=false,vspan=60,pxw=0.001,pxh=0.001;

function initGL(){
  const vs="attribute vec2 p; varying vec2 v; void main(){ v=p; gl_Position=vec4(p,0.0,1.0); }";
  const fs=`
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec2 v;
  uniform sampler2D tex;
  uniform mat3 R;
  uniform vec2 sc, px;
  uniform float az0, vspan;
  void main(){
    vec3 d = R * vec3(v.x*sc.x, v.y*sc.y, -1.0);
    float az = atan(d.x, d.y)*57.29578;
    float el = atan(d.z, length(d.xy))*57.29578;
    float t = mod(az-az0+45.0,360.0)/90.0;
    float ti = floor(t); float fr = t-ti;
    if(mod(ti,2.0)>=1.0) fr = 1.0-fr;
    float vy = 0.5-el/vspan; float shade=1.0;
    if(vy<0.0){ vy=0.0; shade=0.55; } else if(vy>1.0){ vy=1.0; shade=0.45; }
    vec2 uv = vec2(fr,vy);
    vec3 c0 = texture2D(tex,uv).rgb;
    vec3 s = texture2D(tex,uv+vec2(px.x,0.0)).rgb + texture2D(tex,uv-vec2(px.x,0.0)).rgb
           + texture2D(tex,uv+vec2(0.0,px.y)).rgb + texture2D(tex,uv-vec2(0.0,px.y)).rgb;
    vec3 c = clamp(c0 + (c0 - s*0.25)*0.7, 0.0, 1.0)*shade;
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);
    c += (g-0.5)*0.03;
    gl_FragColor = vec4(c,1.0);
  }`;
  function sh(type,src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s; }
  prog=gl.createProgram();
  gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prog,"p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  ["tex","R","sc","px","az0","vspan"].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
}
function sizeGL(){
  const s=Math.min(window.devicePixelRatio||1,1.5);
  pano.width=Math.round(innerWidth*s); pano.height=Math.round(innerHeight*s);
  gl.viewport(0,0,pano.width,pano.height);
}
addEventListener("resize",sizeGL);
addEventListener("orientationchange",()=>setTimeout(sizeGL,300));

function loadImage(names,cb){
  let k=0;
  (function next(){
    if(k>=names.length){ alert("Background photo not found. Upload mining_bakground.jpg to the repo."); return; }
    const im=new Image(); im.onload=()=>cb(im); im.onerror=next; im.src=names[k++];
  })();
}
function makeTexture(im){
  const maxW=Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE),4096);
  const sc=Math.min(1,maxW/im.width);
  const c=document.createElement("canvas"); c.width=Math.round(im.width*sc); c.height=Math.round(im.height*sc);
  c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  vspan=90*im.height/im.width; pxw=1/c.width; pxh=1/c.height;
  const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  texReady=true;
}
function drawPano(R){
  if(!texReady) return;
  const w=innerWidth,h=innerHeight,f=focal();
  const m=[R[0][0],R[1][0],R[2][0], R[0][1],R[1][1],R[2][1], R[0][2],R[1][2],R[2][2]];
  gl.uniformMatrix3fv(U.R,false,new Float32Array(m));
  gl.uniform2f(U.sc,(w/2)/f,(h/2)/f);
  gl.uniform2f(U.px,pxw,pxh);
  gl.uniform1f(U.az0,az0); gl.uniform1f(U.vspan,vspan);
  gl.uniform1i(U.tex,0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}

/* ======== objects in the mine ========
   off = left/right angle from where you face at START (0 = ahead, 90 = right, 180 = behind, -90 = left)
   el  = up/down angle (negative = lower)   -> change these numbers to move things              */
function extSVG(id){ return '<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="'+id+'" x1="0" x2="1"><stop offset="0" stop-color="#7f1d1d"/><stop offset=".45" stop-color="#ef4444"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient></defs><ellipse cx="30" cy="116" rx="20" ry="3.5" fill="rgba(0,0,0,.45)"/><rect x="14" y="36" width="32" height="78" rx="9" fill="url(#'+id+')"/><rect x="21" y="22" width="18" height="16" rx="3" fill="#374151"/><rect x="17" y="14" width="26" height="9" rx="3" fill="#111827"/><path d="M43 20 q14 4 10 22 q-2 10 -9 14" stroke="#111827" stroke-width="4" fill="none"/><rect x="19" y="58" width="22" height="26" rx="2" fill="#f5f5f4"/><rect x="22" y="62" width="16" height="4" fill="#dc2626"/><circle cx="30" cy="30" r="5" fill="#e5e7eb" stroke="#111827" stroke-width="1.5"/></svg>'; }
const BUCKET_SVG='<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="74" rx="26" ry="4" fill="rgba(0,0,0,.45)"/><path d="M14 24 L22 70 Q40 78 58 70 L66 24 Z" fill="#9ca3af"/><ellipse cx="40" cy="24" rx="26" ry="6" fill="#d1d5db"/><ellipse cx="40" cy="25" rx="22" ry="4.5" fill="#3b82f6"/><path d="M14 24 Q40 -6 66 24" stroke="#4b5563" stroke-width="2.5" fill="none"/><rect x="29" y="42" width="22" height="12" rx="2" fill="#1d4ed8"/><text x="40" y="51" font-size="8" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">WATER</text></svg>';
const FLAME_HTML='<div class="flame"><i></i><i></i><i></i></div>';

const items=[
  {cls:"fire",      video:"fire.mp4", fb:FLAME_HTML,                    off:-7,   el:1,   m:140},
  {cls:"sign tag",  html:"440V PANEL",                                   off:-7,   el:-9,  m:100},
  {cls:"sign exit", html:"EXIT ➜",                                       off:90,   el:8,   m:100},
  {cls:"sign warn", html:"⚠ GAS HAZARD",                                 off:-90,  el:8,   m:110},
  {cls:"ext",       img:"ext.png",    fb:extSVG("g1"),                   off:146,  el:1,   m:70, kind:"ext"},
  {cls:"bucket",    img:"bucket.png", fb:BUCKET_SVG,                    off:-75,  el:-20, m:70, kind:"bucket"}
];
items.forEach(it=>{
  const e=document.createElement("div");
  e.className="item "+it.cls;
  if(it.video){
    const v=document.createElement("video");
    v.src=it.video; v.muted=true; v.loop=true; v.autoplay=true; v.setAttribute("playsinline","");
    v.onerror=()=>{ e.innerHTML=it.fb; };
    e.appendChild(v); it.v=v;
  } else if(it.img){
    const im=new Image(); im.src=it.img; im.onerror=()=>{ e.innerHTML=it.fb; }; e.appendChild(im);
  } else e.innerHTML=it.html;
  if(it.kind) e.onclick=()=>tapItem(it);
  document.body.appendChild(e); it.el_=e;
});
(function(){   // extinguisher the worker holds
  const h=$("held"), im=new Image(); im.src="ext.png"; im.onerror=()=>{ h.innerHTML=extSVG("g2"); }; h.appendChild(im);
})();

function loop(){
  requestAnimationFrame(loop);
  if((phase!=="search"&&phase!=="lesson")||!haveSensor) return;
  const R=getR();
  if(az0===null) az0=forwardAz(R);
  drawPano(R);

  const w=innerWidth,h=innerHeight,f=focal();
  let extVisible=false, extVec=null;
  items.forEach(it=>{
    if(it.gone){ it.el_.style.display="none"; return; }
    const az=rad(az0+it.off), el=rad(it.el);
    const v=[Math.sin(az)*Math.cos(el), Math.cos(az)*Math.cos(el), Math.sin(el)];
    const d=[0,1,2].map(c=>R[0][c]*v[0]+R[1][c]*v[1]+R[2][c]*v[2]);
    const depth=-d[2];
    if(it.kind==="ext") extVec=d;
    if(depth>0.05){
      const sx=w/2+f*d[0]/depth, sy=h/2-f*d[1]/depth;
      if(sx>-it.m&&sx<w+it.m&&sy>-it.m&&sy<h+it.m){
        it.el_.style.display="block"; it.el_.style.left=sx+"px"; it.el_.style.top=sy+"px";
        if(it.kind==="ext") extVisible=true;
        return;
      }
    }
    it.el_.style.display="none";
  });

  if(phase==="search"){
    if(extVisible) $("arrow").style.display="none";
    else if(extVec){
      $("arrow").style.display="block";
      $("arrow").style.transform="rotate("+(Math.atan2(extVec[0],extVec[1])*180/Math.PI)+"deg)";
    }
    $("timer").textContent="Time: "+Math.floor((Date.now()-t0)/1000)+" s";
  }
}

