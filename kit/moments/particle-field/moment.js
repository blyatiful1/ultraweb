// particle-field: thousands of soft points advected through curl noise, optionally gathering into a word or SVG path.
// Self-contained ESM, no dependencies, nothing touched at module top level.
const MOUNTED = new WeakMap();
const VS = `attribute vec2 p;attribute vec2 s;uniform vec2 R;uniform float Z;varying float v;
void main(){v=s.x;gl_Position=vec4(p.x/R.x*2.-1.,1.-p.y/R.y*2.,0.,1.);gl_PointSize=Z*(.55+.9*s.y);}`;
const FS = `precision mediump float;uniform vec3 P,A;uniform float O;varying float v;
void main(){float d=length(gl_PointCoord-.5)*2.,a=smoothstep(1.,.25,d)*O;gl_FragColor=vec4(mix(P,A,v)*a,a);}`;
const GR = [1, 0, -1, 0, 0, 1, 0, -1, 0.7071, 0.7071, -0.7071, 0.7071, 0.7071, -0.7071, -0.7071, -0.7071];

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

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (MOUNTED.has(root)) return MOUNTED.get(root);
  const ds = root.dataset;
  const opt = (k, d) => { const v = options[k] ?? ds[k]; return v == null || v === '' ? d : v; };
  const num = (k, d, lo, hi) => { const v = parseFloat(opt(k, d)); return Math.min(hi, Math.max(lo, isNaN(v) ? d : v)); };
  const speed = num('speed', 1, 0, 4), density = num('density', 1, 0.1, 3), psize = num('size', 3.5, 1, 12), radius = num('radius', 120, 0, 600);
  const still = String(opt('still', false)) === 'true';
  const wordEl = root.querySelector('[data-particle-word]');
  const word = String(opt('word', wordEl ? wordEl.textContent.trim() : ''));
  const path = String(opt('path', ''));
  const viewBox = String(opt('viewBox', opt('viewbox', '0 0 100 100'))).split(/[\s,]+/).map(Number);
  const hasShape = !!(word || path);
  const gatherMode = hasShape ? String(opt('gather', 'scroll')) : 'off';
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const ptrMode = matchMedia('(pointer: fine)').matches ? String(opt('pointer', 'repel')) : 'off';
  const dprCap = coarse ? 1.5 : 2;

  let cv = null, gl = null, pr = null, pb = null, sb = null, U = {}, col = null, additive = false;
  let raf = 0, vis = false, paused = false, lost = false, reduced = rmq.matches;
  let t = 0, last = 0, w = 0, h = 0, dpr = 1, ft = 16, fc = 0;
  let n = 0, active = 0, pos = null, vel = null, seed = null, tgt = null, gather = gatherMode === 'always' ? 1 : 0;
  let secTop = 0, secH = 1, vh = 800, sy = 0, token = 0;
  const ptr = { x: -1e4, y: -1e4, on: 0 };
  let btn = null, nx = 0, ny = 0;

  root.setAttribute('data-moment-ready', '');

  // 2D gradient noise with analytic derivative; writes the gradient to nx, ny.
  function hash(i, j) { let k = Math.imul(i, 374761393) + Math.imul(j, 668265263) | 0; k = Math.imul(k ^ (k >>> 13), 1274126177); return ((k ^ (k >>> 16)) & 7) * 2; }
  function noise(x, y) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10), uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const dx = 30 * fx * fx * (fx * (fx - 2) + 1), dy = 30 * fy * fy * (fy * (fy - 2) + 1);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    const va = GR[a] * fx + GR[a + 1] * fy, vb = GR[b] * (fx - 1) + GR[b + 1] * fy;
    const vc = GR[c] * fx + GR[c + 1] * (fy - 1), vd = GR[d] * (fx - 1) + GR[d + 1] * (fy - 1);
    const k = va - vb - vc + vd;
    nx += GR[a] + ux * (GR[b] - GR[a]) + uy * (GR[c] - GR[a]) + ux * uy * (GR[a] - GR[b] - GR[c] + GR[d]) + dx * (uy * k + vb - va);
    ny += GR[a + 1] + ux * (GR[b + 1] - GR[a + 1]) + uy * (GR[c + 1] - GR[a + 1]) + ux * uy * (GR[a + 1] - GR[b + 1] - GR[c + 1] + GR[d + 1]) + dy * (ux * k + vc - va);
  }

  function alloc() {
    const want = Math.round(Math.min(coarse ? 3000 : 7000, Math.max(600, (w * h) / 230 * density * (coarse ? 0.5 : 1))));
    if (want === n) return;
    const old = pos, on = n;
    n = active = want;
    pos = new Float32Array(n * 2); vel = new Float32Array(n * 2); seed = new Float32Array(n * 2); tgt = new Float32Array(n * 2);
    let r = 1234567;
    const rnd = () => ((r = Math.imul(r, 1664525) + 1013904223 | 0) >>> 0) / 4294967296;
    for (let i = 0; i < n; i++) {
      if (old && i < on) { pos[i * 2] = old[i * 2]; pos[i * 2 + 1] = old[i * 2 + 1]; } else { pos[i * 2] = rnd() * w; pos[i * 2 + 1] = rnd() * h; }
      seed[i * 2] = Math.pow(rnd(), 1.6); seed[i * 2 + 1] = rnd();
      tgt[i * 2] = -1;
    }
    if (gl && pb) upload(true);
    sample();
  }

  async function sample() {
    if (!hasShape || !w) return;
    const my = ++token;
    if (document.fonts && wordEl) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
    if (my !== token || !pos) return;
    const k = 0.5, W = Math.ceil(w * k), H = Math.ceil(h * k);
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.scale(k, k);
    x.fillStyle = x.strokeStyle = '#000';
    if (path) {
      const [vx = 0, vy = 0, vw = 100, vhh = 100] = viewBox;
      const s = Math.min((w * 0.8) / vw, (h * 0.7) / vhh);
      x.translate((w - vw * s) / 2 - vx * s, (h - vhh * s) / 2 - vy * s);
      x.scale(s, s);
      const p2 = new Path2D(path);
      x.fill(p2); x.lineWidth = Math.max(vw, vhh) * 0.025; x.stroke(p2);
    } else {
      let cx = w / 2, cy = h / 2, font;
      if (wordEl) {
        const rr = root.getBoundingClientRect(), er = wordEl.getBoundingClientRect(), cs = getComputedStyle(wordEl);
        cx = er.left - rr.left + er.width / 2; cy = er.top - rr.top + er.height / 2;
        font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        x.font = font;
        x.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      } else {
        const fam = getComputedStyle(root).getPropertyValue('--font-display').trim() || 'serif';
        x.font = `600 100px ${fam}`;
        const fs = Math.min(h * 0.45, (w * 0.82 * 100) / Math.max(1, x.measureText(word).width));
        x.font = `600 ${fs}px ${fam}`;
      }
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(word, cx, cy);
    }
    const d = x.getImageData(0, 0, W, H).data, pts = [];
    for (let j = 0; j < H; j += 1) for (let i = 0; i < W; i += 1) if (d[(j * W + i) * 4 + 3] > 128) pts.push(i / k, j / k);
    const m = pts.length / 2;
    if (!m) return;
    let r = 98765;
    for (let i = m - 1; i > 0; i--) { r = Math.imul(r, 1664525) + 1013904223 | 0; const j = (r >>> 0) % (i + 1); [pts[i * 2], pts[j * 2]] = [pts[j * 2], pts[i * 2]]; [pts[i * 2 + 1], pts[j * 2 + 1]] = [pts[j * 2 + 1], pts[i * 2 + 1]]; }
    const free = Math.floor(n * 0.82);
    for (let i = 0; i < n; i++) {
      if (i >= free) { tgt[i * 2] = -1; continue; }
      const q = i % m;
      tgt[i * 2] = pts[q * 2] + (seed[i * 2 + 1] - 0.5) * 2.5; tgt[i * 2 + 1] = pts[q * 2 + 1] + (seed[i * 2] - 0.5) * 2.5;
    }
    if (!raf) draw();
  }

  function step(dt) {
    const fs = 0.0021, tt = t * 0.06, flow = 34 * speed, rr = radius * radius, g = gather;
    const sgn = ptrMode === 'attract' ? -1 : 1, pon = ptrMode !== 'off' && ptr.on, damp = Math.exp(-dt * 2.6);
    for (let i = 0; i < active; i++) {
      const ix = i * 2, iy = ix + 1;
      let px = pos[ix], py = pos[iy], ax = 0, ay = 0;
      nx = ny = 0;
      noise(px * fs + tt, py * fs - tt * 0.7);
      const gx = nx, gy = ny;
      nx = ny = 0;
      noise(px * fs * 2.3 - 11.3 - tt, py * fs * 2.3 + 7.1);
      const vx = (gy + ny * 0.45) * flow, vy = -(gx + nx * 0.45) * flow;
      if (pon) {
        const dx = px - ptr.x, dy = py - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < rr && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / radius) ** 2 * 2600 * sgn / d; ax += dx * f; ay += dy * f; }
      }
      const tx = tgt[ix], gg = tx >= 0 ? g : 0;
      if (gg > 0) { ax += (tx - px) * 14 * gg; ay += (tgt[iy] - py) * 14 * gg; }
      vel[ix] = (vel[ix] + ax * dt) * (gg > 0 ? Math.exp(-dt * (2.6 + 5 * gg)) : damp);
      vel[iy] = (vel[iy] + ay * dt) * (gg > 0 ? Math.exp(-dt * (2.6 + 5 * gg)) : damp);
      const fl = 1 - gg * 0.92;
      px += (vx * fl + vel[ix]) * dt; py += (vy * fl + vel[iy]) * dt;
      if (gg < 0.5) {
        if (px < -8) px += w + 16; else if (px > w + 8) px -= w + 16;
        if (py < -8) py += h + 16; else if (py > h + 8) py -= h + 16;
      }
      pos[ix] = px; pos[iy] = py;
    }
  }

  function build() {
    pr = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(pr, s);
      gl.deleteShader(s);
    }
    gl.bindAttribLocation(pr, 0, 'p');
    gl.bindAttribLocation(pr, 1, 's');
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error('link');
    gl.useProgram(pr);
    pb = gl.createBuffer(); sb = gl.createBuffer();
    U = {};
    for (const k of ['R', 'Z', 'P', 'A', 'O']) U[k] = gl.getUniformLocation(pr, k);
    gl.enable(gl.BLEND);
    upload(true);
  }
  function upload(all) {
    gl.bindBuffer(gl.ARRAY_BUFFER, pb);
    if (all) { gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW); } else gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos.subarray(0, active * 2));
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    if (all) {
      gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    }
  }

  function colors() {
    const [B, P, A] = readColors(root, [['--background', '#f6f4f0'], ['--primary', '#4f5bd5'], ['--accent', '#e0703a']]);
    additive = 0.2126 * B[0] + 0.7152 * B[1] + 0.0722 * B[2] < 0.4;
    col = { P, A };
  }

  function size() {
    if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  }

  function measure() {
    const r = root.getBoundingClientRect();
    sy = window.scrollY; secTop = r.top + sy; secH = Math.max(1, r.height); vh = window.innerHeight;
  }

  function draw() {
    if (!gl || lost || !col || !pos) return;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.ONE, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2f(U.R, w, h);
    gl.uniform1f(U.Z, psize * dpr);
    gl.uniform3fv(U.P, col.P);
    gl.uniform3fv(U.A, col.A);
    gl.uniform1f(U.O, additive ? 0.7 : 0.9);
    upload(false);
    gl.drawArrays(gl.POINTS, 0, active);
  }

  const running = () => gl && !lost && vis && !document.hidden && !paused && !reduced;
  function schedule() {
    if (!raf && running()) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(Math.max(now - last, 0), 33) / 1000;
    last = now;
    t = (t + dt * speed) % 10000;
    if (gatherMode === 'scroll') {
      const prog = Math.min(1, Math.max(0, (sy + vh - secTop) / (vh + secH))), c = Math.abs(prog - 0.5) * 2;
      const target = 1 - Math.min(1, Math.max(0, (c - 0.3) / 0.4));
      gather += (target - gather) * (1 - Math.exp(-dt * 3));
    }
    step(dt);
    ft = ft * 0.9 + dt * 100;
    if (++fc % 60 === 0) {
      if (ft > 20 && active > 600) active = Math.max(600, Math.floor(active * 0.8));
      else if (ft < 13 && active < n) active = Math.min(n, Math.ceil(active * 1.1));
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
    cv.className = 'pf-canvas';
    cv.setAttribute('aria-hidden', 'true');
    const attrs = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false };
    gl = cv.getContext('webgl2', attrs) || cv.getContext('webgl', attrs);
    if (!gl) { cv = null; return; }
    if (!pos) alloc();
    try { build(); } catch (_) { kill(); return; }
    cv.addEventListener('webglcontextlost', onLost);
    cv.addEventListener('webglcontextrestored', onRestored);
    root.prepend(cv);
    colors(); size();
    if (reduced && hasShape && gatherMode !== 'off') { gather = 1; for (let i = 0; i < 40; i++) step(1 / 30); }
    draw();
    root.setAttribute('data-gl', 'on');
  }

  function kill() {
    cancelAnimationFrame(raf); raf = 0;
    if (gl) {
      if (!gl.isContextLost()) { gl.deleteProgram(pr); gl.deleteBuffer(pb); gl.deleteBuffer(sb); }
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
    if (cv) { cv.removeEventListener('webglcontextlost', onLost); cv.removeEventListener('webglcontextrestored', onRestored); cv.remove(); }
    cv = gl = pr = pb = sb = null; lost = false;
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
      btn.className = 'pf-pause';
      btn.addEventListener('click', onBtn);
      root.append(btn);
      setPaused(paused);
    } else if (!wantBtn && btn) { btn.removeEventListener('click', onBtn); btn.remove(); btn = null; }
    if (gl) { draw(); schedule(); }
  }

  const ro = new ResizeObserver(() => {
    const nw = root.clientWidth, nh = root.clientHeight;
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    measure(); size();
    if (gl || pos) alloc();
    sample();
    if (!raf) draw();
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
    const r = root.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = 1;
  }
  const onLeave = () => { ptr.on = 0; };

  w = root.clientWidth; h = root.clientHeight;
  apply();
  ro.observe(root);
  io.observe(root);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
  dark.addEventListener('change', onTheme);
  rmq.addEventListener('change', apply);
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  if (ptrMode !== 'off') { root.addEventListener('pointermove', onMove, { passive: true }); root.addEventListener('pointerleave', onLeave); }

  const cleanup = () => {
    token++;
    ro.disconnect(); io.disconnect(); mo.disconnect();
    dark.removeEventListener('change', onTheme);
    rmq.removeEventListener('change', apply);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    kill();
    if (btn) { btn.removeEventListener('click', onBtn); btn.remove(); btn = null; }
    root.removeAttribute('data-moment-ready');
    pos = vel = seed = tgt = null;
    MOUNTED.delete(root);
  };
  MOUNTED.set(root, cleanup);
  return cleanup;
}
