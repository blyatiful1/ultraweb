// shader-ground: animated WebGL ground (flow | contour | grid | caustic) from the site's tokens.
// Self-contained ESM, no dependencies, nothing touched at module top level.
const MOUNTED = new WeakMap();
const VARIANTS = ['flow', 'contour', 'grid', 'caustic'];
const QBASE = [0.5, 0.8, 0.8, 0.6]; // internal resolution per variant (fraction of capped device pixels)
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T,S,I;uniform vec3 B,P,A,M;
float h(vec2 p){vec3 q=fract(p.xyx*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
#define G(o) dot(sin(6.2831*h(i+o)+vec2(1.5708,0.)),f-o)
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*f*(f*(f*6.-15.)+10.);
return mix(mix(G(vec2(0)),G(vec2(1,0)),u.x),mix(G(vec2(0,1)),G(vec2(1)),u.x),u.y);}
const mat2 m=mat2(1.6,1.2,-1.2,1.6);
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=m*p+7.3;a*=.5;}return s;}
void main(){vec2 fc=gl_FragCoord.xy,uv=(fc-.5*R)/R.y;float px=1./R.y,t=T*.05;
vec2 d=uv-M.xy;float k=M.z*exp(-dot(d,d)*7.);uv+=k*(.18*vec2(-d.y,d.x)+.06*d);
vec2 p=uv*S*1.6;vec3 c=B;
#if V==0
p*=.55;vec2 q=vec2(fbm(p+vec2(0,t)),fbm(p+vec2(5.2,1.3)-t));
vec2 r=vec2(fbm(p+2.*q+vec2(1.7,9.2)+.7*t),fbm(p+2.*q+vec2(8.3,2.8)-.5*t));
float f=fbm(p+1.8*r);
c=mix(c,P,I*smoothstep(-.35,.45,f));
c=mix(c,A,I*.8*smoothstep(.0,.45,r.x+.5*q.y-.1));
c=mix(c,B,.4*smoothstep(.1,-.45,f+.5*q.x));
#elif V==1
vec2 w=.9*vec2(fbm(.4*p+t*.5),fbm(.4*p+vec2(3.1,7.7)-t*.5));float e=px*S*1.6;
float f=fbm(.55*p+w),fx=fbm(.55*(p+vec2(e,0))+w),fy=fbm(.55*(p+vec2(0,e))+w);
float N=16.,v=f*N+.5,g=length(vec2(fx-f,fy-f))*N+1e-5,dl=abs(fract(v)-.5)/g;
float mj=step(mod(floor(v)+100.,5.),.5),lw=mix(.55,1.1,mj);
float a=(1.-smoothstep(lw-.7,lw+.7,dl))*(1.-smoothstep(.25,.55,g));
c=mix(B,P,I*.2*smoothstep(-.45,.45,f));
c=mix(c,mix(P,A,mj),I*a*mix(.6,.95,mj));
#elif V==2
float hz=.2,y=hz-uv.y;
c=mix(B,P,I*.5*exp(-abs(uv.y-hz)*6.));
c=mix(c,A,I*.45*exp(-length((uv-vec2(.25*sin(t*.7),hz))*vec2(1.2,7.))));
if(y>.002){
#define GP(u) (vec2(u.x,1.)*(.9*S/(hz-u.y))+vec2(.6*sin(t*.4),T*.1))
vec2 g0=GP(uv),u1=uv+vec2(px,0),u2=uv+vec2(0,-px),fw=abs(GP(u1)-g0)+abs(GP(u2)-g0);
vec2 a=abs(fract(g0)-.5)/fw,l=(1.-smoothstep(.35,1.35,a))*(1.-smoothstep(.06,.3,fw));
float z=.9*S/y,fo=exp(-z*.05),ln=max(l.x,l.y)*fo;
c=mix(c,mix(A,P,fo),I*ln*.95);
c=mix(c,P,I*.12*fo*smoothstep(.0,.5,y));}
#else
vec2 w=p*1.7+.9*vec2(fbm(p*.4+t*.3),fbm(p*.4+5.-t*.3))-250.,i=w;float L=1.,tt=T*.12;
for(int n=0;n<5;n++){float s=tt*(1.-3.5/float(n+1));i=w+vec2(cos(s-i.x)+sin(s+i.y),sin(s-i.y)+cos(s+i.x));
L+=1./length(vec2(w.x/(sin(i.x+s)*200.),w.y/(cos(i.y+s)*200.)));}
L=pow(abs(1.17-pow(L*.2,1.4)),8.);L=clamp(L,0.,1.);
c=mix(B,P,I*(.22+.25*fbm(p*.6-t*.2)));
c=mix(c,A,I*L*.95);
#endif
c+=(h(fc+fract(T*7.)*97.)-.5)/255.;gl_FragColor=vec4(c,1.);}`;

function readColors(root, list) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const x = cv.getContext('2d', { willReadFrequently: true });
  const cs = getComputedStyle(root);
  return list.map(([name, fb]) => {
    x.clearRect(0, 0, 1, 1);
    x.fillStyle = fb;
    x.fillStyle = cs.getPropertyValue(name).trim() || fb;
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  });
}

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (MOUNTED.has(root)) return MOUNTED.get(root);
  const ds = root.dataset;
  const opt = (k, d) => { const v = options[k] ?? ds[k]; return v == null || v === '' ? d : v; };
  const num = (k, d, lo, hi) => { const v = parseFloat(opt(k, d)); return Math.min(hi, Math.max(lo, isNaN(v) ? d : v)); };
  const variant = Math.max(0, VARIANTS.indexOf(String(opt('variant', 'flow'))));
  const speed = num('speed', 1, 0, 4), scale = num('scale', 1, 0.25, 4), inten = num('intensity', 0.6, 0, 1);
  const still = String(opt('still', false)) === 'true';
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const usePtr = String(opt('pointer', true)) !== 'false' && matchMedia('(pointer: fine)').matches;
  const dprCap = coarse ? 1.5 : 2;

  let cv = null, gl = null, pr = null, bf = null, U = {}, col = null;
  let raf = 0, vis = false, paused = false, lost = false, reduced = rmq.matches;
  let t = 40, last = 0, w = 0, h = 0, q = QBASE[variant], ft = 16, fc = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0 };
  let btn = null;

  root.setAttribute('data-moment-ready', '');

  function build() {
    pr = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, '#define V ' + variant + '\n' + FS]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(pr, s);
      gl.deleteShader(s);
    }
    gl.bindAttribLocation(pr, 0, 'p');
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error('link');
    gl.useProgram(pr);
    bf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    U = {};
    for (const n of ['R', 'T', 'S', 'I', 'B', 'P', 'A', 'M']) U[n] = gl.getUniformLocation(pr, n);
  }

  function colors() {
    col = readColors(root, [['--background', '#f6f4f0'], ['--primary', '#4f5bd5'], ['--accent', '#e0703a']]);
  }

  function size() {
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * q;
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  }

  function draw() {
    if (!gl || lost || !col) return;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(U.R, cv.width, cv.height);
    gl.uniform1f(U.T, t);
    gl.uniform1f(U.S, scale);
    gl.uniform1f(U.I, inten);
    gl.uniform3fv(U.B, col[0]);
    gl.uniform3fv(U.P, col[1]);
    gl.uniform3fv(U.A, col[2]);
    gl.uniform3f(U.M, ptr.x, ptr.y, ptr.s);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const running = () => gl && !lost && vis && !document.hidden && !paused && !reduced;
  function schedule() {
    if (!raf && running()) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(Math.max(now - last, 0), 50);
    last = now;
    t = (t + (dt / 1000) * speed) % 4000;
    const k = 1 - Math.exp(-dt / 220);
    ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k; ptr.s += (ptr.ts - ptr.s) * k * 0.5;
    ft = ft * 0.9 + dt * 0.1;
    if (++fc % 60 === 0) {
      const qm = QBASE[variant];
      if (ft > 20 && q > 0.3) { q = Math.max(0.3, q * 0.8); size(); }
      else if (ft < 13 && q < qm) { q = Math.min(qm, q * 1.15); size(); }
    }
    draw();
    if (running()) { raf = requestAnimationFrame(frame); }
  }

  function onLost(e) { e.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0; root.setAttribute('data-gl', 'lost'); }
  function onRestored() {
    lost = false;
    try { build(); } catch (_) { kill(); return; }
    root.setAttribute('data-gl', 'on');
    draw(); schedule();
  }

  function setup() {
    cv = document.createElement('canvas');
    cv.className = 'sg-canvas';
    cv.setAttribute('aria-hidden', 'true');
    const attrs = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' };
    gl = cv.getContext('webgl2', attrs) || cv.getContext('webgl', attrs);
    if (!gl) { cv = null; return; }
    try { build(); } catch (_) { kill(); return; }
    cv.addEventListener('webglcontextlost', onLost);
    cv.addEventListener('webglcontextrestored', onRestored);
    root.prepend(cv);
    colors(); size(); draw();
    root.setAttribute('data-gl', 'on');
  }

  function kill() {
    cancelAnimationFrame(raf); raf = 0;
    if (gl) {
      if (!gl.isContextLost()) { gl.deleteProgram(pr); gl.deleteBuffer(bf); }
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    if (cv) { cv.removeEventListener('webglcontextlost', onLost); cv.removeEventListener('webglcontextrestored', onRestored); cv.remove(); }
    cv = gl = pr = bf = null; lost = false;
    root.removeAttribute('data-gl');
  }

  function setPaused(v) {
    paused = v;
    if (btn) { btn.setAttribute('aria-pressed', String(v)); btn.textContent = v ? 'Play motion' : 'Pause motion'; }
    if (v) { cancelAnimationFrame(raf); raf = 0; } else schedule();
  }

  function apply() {
    reduced = rmq.matches;
    if (reduced && !still) { kill(); }
    else if (!gl) setup();
    const wantBtn = gl && !reduced;
    if (wantBtn && !btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sg-pause';
      btn.addEventListener('click', onBtn);
      root.append(btn);
      setPaused(paused);
    } else if (!wantBtn && btn) { btn.removeEventListener('click', onBtn); btn.remove(); btn = null; }
    if (gl) { draw(); schedule(); }
  }
  const onBtn = () => setPaused(!paused);

  const ro = new ResizeObserver((en) => {
    const r = en[0].contentRect;
    w = r.width; h = r.height;
    size(); if (!raf) draw();
  });
  const io = new IntersectionObserver((en) => {
    vis = en[en.length - 1].isIntersecting;
    if (vis) schedule(); else { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '64px' });
  const mo = new MutationObserver(() => { colors(); if (!raf) draw(); });
  const onTheme = () => { colors(); if (!raf) draw(); };
  const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else schedule(); };
  function onMove(e) {
    if (reduced) return;
    const r = root.getBoundingClientRect();
    ptr.tx = (e.clientX - r.left - r.width / 2) / r.height;
    ptr.ty = (r.height / 2 - (e.clientY - r.top)) / r.height;
    if (ptr.ts === 0) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
    ptr.ts = 1;
  }
  const onLeave = () => { ptr.ts = 0; };

  apply();
  ro.observe(root);
  io.observe(root);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
  dark.addEventListener('change', onTheme);
  rmq.addEventListener('change', apply);
  document.addEventListener('visibilitychange', onVis);
  if (usePtr) { root.addEventListener('pointermove', onMove, { passive: true }); root.addEventListener('pointerleave', onLeave); }

  const cleanup = () => {
    ro.disconnect(); io.disconnect(); mo.disconnect();
    dark.removeEventListener('change', onTheme);
    rmq.removeEventListener('change', apply);
    document.removeEventListener('visibilitychange', onVis);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    kill();
    if (btn) { btn.removeEventListener('click', onBtn); btn.remove(); btn = null; }
    root.removeAttribute('data-moment-ready');
    MOUNTED.delete(root);
  };
  MOUNTED.set(root, cleanup);
  return cleanup;
}
