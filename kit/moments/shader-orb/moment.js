// shader-orb: raymarched signed-distance object (blob | torus | crystal | liquid) lit from the site's tokens.
// Self-contained ESM, no dependencies, nothing touched at module top level.
const MOUNTED = new WeakMap();
const SHAPES = ['blob', 'torus', 'crystal', 'liquid'];
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T,K;uniform mat3 M;uniform vec3 B,P,A,L,D;
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float map(vec3 p){p=M*p;
#if SH==0
float a=.08+.1*K;return(length(p)-1.+a*sin(2.3*p.x+T*.7)*sin(2.1*p.y+T*.5)*sin(2.5*p.z+T*.6)+a*.5*sin(5.1*p.y+3.3*p.x-T*.9)*sin(4.3*p.z+T*.4))*.7;
#elif SH==1
float a=atan(p.z,p.x),w=a*1.5+T*.3+K*3.1416,c=cos(w),s=sin(w);vec2 q=vec2(length(p.xz)-.82,p.y-.18*sin(3.*a+T*.4));
q=vec2(c*q.x-s*q.y,s*q.x+c*q.y);vec2 b=abs(q)-vec2(.28,.09);return(length(max(b,0.))+min(max(b.x,b.y),0.)-.05)*.42;
#elif SH==2
p.y*=1.12;vec3 q=abs(p);
float dd=max(max(dot(q,vec3(0,.526,.851)),dot(q,vec3(.526,.851,0))),dot(q,vec3(.851,0,.526)));
float di=max(max(max(dot(q,vec3(.577)),dot(q,vec3(0,.357,.934))),dot(q,vec3(.357,.934,0))),dot(q,vec3(.934,0,.357)));
return max(dd-.84,di-mix(.95,.87,K))*.9;
#else
float d=9.;for(int i=0;i<5;i++){float f=float(i);vec3 c=(.3+.22*K)*vec3(sin(T*.37+f*1.7),cos(T*.29+f*2.3),sin(T*.23+f*.9+1.));d=smin(d,length(p-c)-(.52-.04*f),.4);}return d;
#endif
}
vec3 nor(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
float ao(vec3 p,vec3 n){float o=0.,s=1.;for(int i=1;i<5;i++){float h=.07*float(i);o+=(h-map(p+n*h))*s;s*=.6;}return clamp(1.-2.*o,0.,1.);}
float hs(vec2 p){vec3 q=fract(p.xyx*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;vec3 ro=vec3(0,0,3.7),rd=normalize(vec3(uv,-1.2));
float px=1./(R.y*1.2),b=dot(ro,rd),h=b*b-dot(ro,ro)+2.2;vec4 o=vec4(0);
vec3 Pl=pow(P,vec3(2.2)),Al=pow(A,vec3(2.2)),Ll=pow(L,vec3(2.2)),Bl=pow(B,vec3(2.2));
if(rd.y<0.){float tg=-1.3/rd.y;vec3 g=ro+rd*tg;float s=.22*exp(-dot(g.xz,g.xz)*3.);o=vec4(D*s,s);}
if(h>0.){h=sqrt(h);float t=-b-h,te=-b+h,m=1e3,tm=t;bool hit=false;
for(int i=0;i<96;i++){float d=map(ro+rd*t);if(d<.0008*t){hit=true;break;}float r=d/t;if(r<m){m=r;tm=t;}t+=d;if(t>te)break;}
float al=hit?1.:1.-smoothstep(0.,px,m);
if(al>0.){if(!hit)t=tm;vec3 p=ro+rd*t,n=nor(p),v=-rd,ld=normalize(vec3(.55,.75,.5)),hv=normalize(ld+v);
float nv=max(dot(n,v),0.),df=max(dot(n,ld),0.),fr=.04+.96*pow(1.-nv,5.),oc=ao(p,n);
float sp=pow(max(dot(n,hv),0.),GX)*(GX+8.)/25.;vec3 r=reflect(rd,n);
vec3 env=mix(Bl*.5,Ll,smoothstep(-.4,.9,r.y));
vec3 c=Pl*(Ll*df*.85+(mix(Bl,Ll,.4)*.3+Al*.35*clamp(.4-n.x*.6-n.y*.3,0.,1.))*oc);
c+=Ll*sp*df*SPC+env*fr*oc*RF+Al*pow(1.-nv,3.)*.55*oc;
c=c/(1.+c*.45);c=pow(c,vec3(1./2.2));o=mix(o,vec4(c,1.),al);}}
o.rgb+=(hs(gl_FragCoord.xy+fract(T)*61.)-.5)/255.*o.a;gl_FragColor=o;}`;
const SHAPE_DEFS = ['#define GX 40.\n#define SPC .5\n#define RF .6\n', '#define GX 70.\n#define SPC .6\n#define RF .7\n', '#define GX 160.\n#define SPC 1.2\n#define RF 1.2\n', '#define GX 110.\n#define SPC .9\n#define RF 1.\n'];

function readColors(root, list) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const x = cv.getContext('2d', { willReadFrequently: true });
  const cs = getComputedStyle(root);
  return list.map(([name, fb]) => {
    const v = cs.getPropertyValue(name).trim();
    x.clearRect(0, 0, 1, 1);
    x.fillStyle = v && CSS.supports('color', v) ? v : fb;
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  });
}
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (MOUNTED.has(root)) return MOUNTED.get(root);
  const ds = root.dataset;
  const opt = (k, d) => { const v = options[k] ?? ds[k]; return v == null || v === '' ? d : v; };
  const num = (k, d, lo, hi) => { const v = parseFloat(opt(k, d)); return Math.min(hi, Math.max(lo, isNaN(v) ? d : v)); };
  const shape = Math.max(0, SHAPES.indexOf(String(opt('shape', 'blob'))));
  const speed = num('speed', 1, 0, 4), qmax = num('quality', 0.75, 0.3, 1);
  const still = String(opt('still', false)) === 'true';
  const useScroll = String(opt('scroll', true)) !== 'false';
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const usePtr = String(opt('pointer', true)) !== 'false' && matchMedia('(pointer: fine)').matches;
  const dprCap = coarse ? 1.5 : 2;
  const section = root.closest('section') || root;

  let cv = null, gl = null, pr = null, bf = null, U = {}, col = null;
  let raf = 0, vis = false, paused = false, lost = false, reduced = rmq.matches;
  let t = 12, last = 0, w = 0, h = 0, q = Math.min(0.6, qmax), ft = 16, fc = 0;
  let secTop = 0, secH = 1, vh = 800, vw = 1200, sy = 0, prog = 0.5;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const mat = new Float32Array(9);
  let btn = null;

  root.setAttribute('data-moment-ready', '');

  function build() {
    pr = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, '#define SH ' + shape + '\n' + SHAPE_DEFS[shape] + FS]]) {
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
    for (const n of ['R', 'T', 'K', 'M', 'B', 'P', 'A', 'L', 'D']) U[n] = gl.getUniformLocation(pr, n);
  }

  function colors() {
    const [B, F, P, A] = readColors(root, [['--background', '#f6f4f0'], ['--foreground', '#16161a'], ['--primary', '#4f5bd5'], ['--accent', '#e0703a']]);
    const light = lum(B) > lum(F) ? B : F, darker = light === B ? F : B;
    const [S] = readColors(root, [['--shadow-color', `rgb(${darker.map((v) => Math.round(v * 255)).join(',')})`]]);
    col = { B, P, A, L: light, D: S };
  }

  function size() {
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * q;
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  }

  function measure() {
    const r = section.getBoundingClientRect();
    sy = window.scrollY; secTop = r.top + sy; secH = Math.max(1, r.height);
    vh = window.innerHeight; vw = window.innerWidth;
  }

  function draw() {
    if (!gl || lost || !col) return;
    const k = useScroll && !reduced ? prog : 0.5;
    const yaw = t * 0.22 + ptr.x * 0.7 + k * 2.4, pitch = 0.28 + ptr.y * 0.45 + (k - 0.5) * 0.5;
    const cy = Math.cos(yaw), sY = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    mat.set([cy, 0, -sY, sY * sp, cp, cy * sp, sY * cp, -sp, cy * cp]);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(U.R, cv.width, cv.height);
    gl.uniform1f(U.T, t);
    gl.uniform1f(U.K, k);
    gl.uniformMatrix3fv(U.M, false, mat);
    for (const n of ['B', 'P', 'A', 'L', 'D']) gl.uniform3fv(U[n], col[n]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
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
    t = (t + (dt / 1000) * speed) % 2000;
    const k = 1 - Math.exp(-dt / 260);
    ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k;
    const target = Math.min(1, Math.max(0, (sy + vh - secTop) / (vh + secH)));
    prog += (target - prog) * (1 - Math.exp(-dt / 180));
    ft = ft * 0.9 + dt * 0.1;
    if (++fc % 45 === 0) {
      if (ft > 20 && q > 0.3) { q = Math.max(0.3, q * 0.8); size(); }
      else if (ft < 13 && q < qmax) { q = Math.min(qmax, q * 1.12); size(); }
    }
    draw();
    if (running()) raf = requestAnimationFrame(frame);
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
    cv.className = 'so-canvas';
    cv.setAttribute('aria-hidden', 'true');
    const attrs = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false };
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
  const onBtn = () => setPaused(!paused);

  function apply() {
    reduced = rmq.matches;
    if (reduced && !still) kill();
    else if (!gl) setup();
    const wantBtn = gl && !reduced;
    if (wantBtn && !btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'so-pause';
      btn.addEventListener('click', onBtn);
      root.append(btn);
      setPaused(paused);
    } else if (!wantBtn && btn) { btn.removeEventListener('click', onBtn); btn.remove(); btn = null; }
    if (gl) { draw(); schedule(); }
  }

  const ro = new ResizeObserver(() => {
    w = root.clientWidth; h = root.clientHeight;
    measure(); size(); if (!raf) draw();
  });
  const io = new IntersectionObserver((en) => {
    vis = en[en.length - 1].isIntersecting;
    if (vis) { measure(); schedule(); } else { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '64px' });
  const mo = new MutationObserver(() => { colors(); if (!raf) draw(); });
  const onTheme = () => { colors(); if (!raf) draw(); };
  const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else schedule(); };
  const onScroll = () => { sy = window.scrollY; };
  const onResize = () => measure();
  function onMove(e) {
    ptr.tx = (e.clientX / vw) * 2 - 1;
    ptr.ty = (e.clientY / vh) * 2 - 1;
  }

  apply();
  ro.observe(root);
  if (section !== root) ro.observe(section);
  io.observe(root);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
  dark.addEventListener('change', onTheme);
  rmq.addEventListener('change', apply);
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  if (usePtr) window.addEventListener('pointermove', onMove, { passive: true });

  const cleanup = () => {
    ro.disconnect(); io.disconnect(); mo.disconnect();
    dark.removeEventListener('change', onTheme);
    rmq.removeEventListener('change', apply);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onMove);
    kill();
    if (btn) { btn.removeEventListener('click', onBtn); btn.remove(); btn = null; }
    root.removeAttribute('data-moment-ready');
    MOUNTED.delete(root);
  };
  MOUNTED.set(root, cleanup);
  return cleanup;
}
