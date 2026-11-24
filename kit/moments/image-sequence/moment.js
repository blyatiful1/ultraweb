// image-sequence: scrubs a canvas through numbered frames while a tall sticky section scrolls.
// Frames: options.frames (array of CanvasImageSource) or a URL pattern in data-frames. No scroll-jacking.
export default function mount(root, options = {}) {
  if (!root || root.hasAttribute('data-moment-ready')) return () => {};
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const stick = root.querySelector('[data-is-sticky]');
  const poster = root.querySelector('[data-is-poster]');
  if (!stick) return () => {};
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const pattern = options.pattern ?? root.dataset.frames ?? '';
  const hook = Array.isArray(options.frames) ? options.frames : null;
  const total = hook ? hook.length : Math.round(num(options.count ?? root.dataset.count, 0));
  const start = Math.round(num(options.start ?? root.dataset.start, 1));
  const lengthVh = num(options.length ?? root.dataset.length, 400);
  const fit = (options.fit ?? root.dataset.fit) === 'contain' ? 'contain' : 'cover';
  const ramp = num(options.ramp ?? root.dataset.ramp, 0.05);
  const stride = Math.max(2, Math.round(num(options.preloadStride ?? root.dataset.preloadStride, 8)));
  const mqReduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  const mqPhone = win.matchMedia('(max-width: 767px)');
  const mqCoarse = win.matchMedia('(pointer: coarse)');
  const posterSrc = poster ? poster.getAttribute('src') : null;

  const stillFrame = () => {
    // reduced motion / no usable frames: leave the poster (CSS fallback) as the final state
    if (poster && hook && hook[0] && !posterSrc) {
      try {
        const c = doc.createElement('canvas');
        c.width = hook[0].width || hook[0].naturalWidth || 16; c.height = hook[0].height || hook[0].naturalHeight || 9;
        c.getContext('2d').drawImage(hook[0], 0, 0);
        poster.src = c.toDataURL('image/webp', 0.8);
      } catch (e) { /* tainted or unsupported: keep markup as is */ }
    }
  };
  if (total < 2) return () => {};
  if (mqReduce.matches) {
    stillFrame();
    return () => { if (poster && !posterSrc) poster.removeAttribute('src'); };
  }

  root.setAttribute('data-moment-ready', '');
  root.style.setProperty('--is-length', String(lengthVh));
  const canvas = doc.createElement('canvas');
  canvas.setAttribute('data-is-canvas', '');
  canvas.setAttribute('aria-hidden', 'true');
  stick.insertBefore(canvas, poster ? poster.nextSibling : stick.firstChild);
  const ctx = canvas.getContext('2d');
  const caps = [...root.querySelectorAll('[data-from]')].map((node) => ({
    node, from: num(node.dataset.from, 0), to: num(node.dataset.to, 1), v: -1,
  }));

  // ---- frame set (every 2nd frame on phones, always including the last) ----
  let avail = [];
  const buildAvail = () => {
    const s = mqPhone.matches ? 2 : 1;
    const a = [];
    for (let i = 0; i < total; i += s) a.push(i);
    if (a[a.length - 1] !== total - 1) a.push(total - 1);
    avail = a;
  };
  buildAvail();

  const urlFor = (i) => pattern.replace(/\{(0*)\}/, (m, z) => String(start + i).padStart(z.length, '0'));
  const frames = new Array(total).fill(null);     // loaded drawables
  const wanted = new Set();
  let destroyed = false, queue = [], inflight = 0;

  if (hook) hook.forEach((f, i) => { frames[i] = f; });
  else if (pattern) {
    // progressive order: first, last, every Nth, then bisect down to every frame
    const seen = new Set(), order = [];
    const push = (i) => { if (i >= 0 && i < total && !seen.has(i)) { seen.add(i); order.push(i); } };
    push(0); push(total - 1);
    for (let s = stride; s >= 1; s = Math.floor(s / 2)) { for (let i = 0; i < total; i += s) push(i); if (s === 1) break; }
    queue = order;
  }
  const pump = () => {
    while (!destroyed && inflight < 6 && queue.length) {
      const i = queue.shift();
      if (mqPhone.matches && !avail.includes(i)) continue;
      inflight++;
      const img = new win.Image();
      img.decoding = 'async';
      img.onload = () => {
        const done = () => { inflight--; if (!destroyed) { frames[i] = img; schedule(); pump(); } };
        if (img.decode) img.decode().then(done, done); else done();
      };
      img.onerror = () => { inflight--; pump(); };
      img.src = urlFor(i);
    }
  };

  // ---- geometry (cached, refreshed by ResizeObserver) ----
  let top = 0, span = 1, cw = 0, ch = 0, dpr = 1;
  let shown = -2, raf = 0, visible = true, lastP = 0, sized = false;
  const measure = () => {
    const r = stick.getBoundingClientRect();
    cw = Math.max(1, Math.round(r.width)); ch = Math.max(1, Math.round(r.height));
    dpr = Math.min(win.devicePixelRatio || 1, mqCoarse.matches ? 1.5 : 2, 2560 / cw);
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    top = win.scrollY + root.getBoundingClientRect().top;
    span = Math.max(1, root.offsetHeight - ch);
    shown = -2; sized = true;
    schedule();
  };
  const nearest = (target) => {
    if (frames[target]) return target;
    for (let d = 1; d < total; d++) {
      const a = target - d, b = target + d;
      if (a >= 0 && frames[a] && (!mqPhone.matches || avail.includes(a))) return a;
      if (b < total && frames[b] && (!mqPhone.matches || avail.includes(b))) return b;
    }
    return -1;
  };
  const draw = (i) => {
    const f = frames[i];
    const iw = f.naturalWidth || f.videoWidth || f.width, ih = f.naturalHeight || f.videoHeight || f.height;
    if (!iw || !ih) return false;
    const k = (fit === 'cover' ? Math.max : Math.min)(canvas.width / iw, canvas.height / ih);
    const w = iw * k, h = ih * k;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(f, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    return true;
  };
  const render = () => {
    raf = 0;
    if (!sized) return;
    const p = clamp((win.scrollY - top) / span, 0, 1);
    lastP = p;
    const target = avail[Math.round(p * (avail.length - 1))];
    const f = nearest(target);
    if (f >= 0 && f !== shown && draw(f)) {
      shown = f;
      if (!root.hasAttribute('data-is-drawn')) root.setAttribute('data-is-drawn', '');
    }
    for (const c of caps) {
      const o = clamp(Math.min((p - c.from) / ramp, (c.to - p) / ramp), 0, 1);
      const v = Math.round(o * 100) / 100;
      if (v !== c.v) { c.v = v; c.node.style.opacity = String(v); c.node.style.transform = 'translate3d(0,' + ((1 - v) * 16).toFixed(1) + 'px,0)'; }
    }
  };
  function schedule() { if (!raf && visible && !destroyed) raf = win.requestAnimationFrame(render); }

  // a newly loaded frame may be nearer to the target than the one on screen
  
  const io = new win.IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) { measureLazy(); schedule(); } }, { rootMargin: '25% 0px' });
  const measureLazy = () => { top = win.scrollY + root.getBoundingClientRect().top; };
  io.observe(root);
  const ro = new win.ResizeObserver(measure);
  ro.observe(stick); ro.observe(root);
  if (doc.body) ro.observe(doc.body);
  const onPhone = () => { buildAvail(); if (!hook && pattern) { queue = queue.concat(avail.filter((i) => !frames[i])); pump(); } shown = -2; schedule(); };
  const onScroll = () => schedule();
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('load', measure);
  mqPhone.addEventListener ? mqPhone.addEventListener('change', onPhone) : mqPhone.addListener(onPhone);

  measure();
  pump();

  return () => {
    destroyed = true;
    if (raf) win.cancelAnimationFrame(raf);
    io.disconnect(); ro.disconnect();
    win.removeEventListener('scroll', onScroll);
    win.removeEventListener('load', measure);
    mqPhone.removeEventListener ? mqPhone.removeEventListener('change', onPhone) : mqPhone.removeListener(onPhone);
    canvas.remove();
    caps.forEach((c) => { c.node.style.opacity = ''; c.node.style.transform = ''; });
    root.style.removeProperty('--is-length');
    root.removeAttribute('data-is-drawn');
    root.removeAttribute('data-moment-ready');
    frames.fill(null);
  };
}
