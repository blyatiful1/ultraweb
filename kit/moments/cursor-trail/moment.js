// cursor-trail: images or token-coloured shapes follow the pointer inside one area (mode "trail"),
// or a list row's preview follows the pointer / docks beside the focused row (mode "list").
const mounted = new WeakMap();

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (mounted.has(root)) return mounted.get(root);
  const ds = root.dataset;
  const opt = (k, d) => (options[k] !== undefined ? options[k] : ds[k] !== undefined && ds[k] !== '' ? ds[k] : d);
  const mode = String(opt('mode', 'trail')) === 'list' ? 'list' : 'trail';
  const size = +opt('size', 88) || 88;
  const count = Math.max(3, Math.min(16, +opt('count', 8) || 8));
  const step = +opt('step', 64) || 64;
  const life = +opt('life', 900) || 900;
  let images = options.images || (ds.images ? ds.images.split(',').map((s) => s.trim()).filter(Boolean) : []);
  const mqC = window.matchMedia('(pointer: coarse)'), mqR = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rows = mode === 'list' ? [...root.querySelectorAll('[data-preview]')] : [];

  let teardown = null, dead = false;
  const start = () => {
    if (teardown) teardown();
    teardown = (mqC.matches || mqR.matches) ? inline() : (mode === 'list' ? list() : trail());
  };
  const onMq = () => { if (!dead) start(); };
  mqC.addEventListener('change', onMq); mqR.addEventListener('change', onMq);
  root.setAttribute('data-moment-ready', '');
  start();
  const cleanup = () => {
    if (dead) return;
    dead = true; mounted.delete(root);
    mqC.removeEventListener('change', onMq); mqR.removeEventListener('change', onMq);
    teardown && teardown();
    root.removeAttribute('data-moment-ready');
  };
  mounted.set(root, cleanup);
  return cleanup;

  // ---- shared helpers ----
  function shapeEl(i) {
    const d = document.createElement('span');
    d.className = 'ct-shape'; d.setAttribute('data-i', i % 3);
    return d;
  }
  function makeMedia(src, i) {
    if (src) { const im = document.createElement('img'); im.src = src; im.alt = ''; im.decoding = 'async'; im.draggable = false; return im; }
    return shapeEl(i);
  }
  function makeLayer() {
    const l = document.createElement('div');
    l.className = 'ct-layer'; l.setAttribute('aria-hidden', 'true');
    if (mode === 'trail' && String(opt('layer', 'below')) === 'above') l.setAttribute('data-above', '');
    root.appendChild(l);
    return l;
  }
  // Rect of the area, cached; refreshed only after scroll/resize and read in an event, never in a frame.
  function tracker(el) {
    let rect = null, dirty = true;
    const mark = () => { dirty = true; };
    addEventListener('scroll', mark, { passive: true }); addEventListener('resize', mark);
    return { get() { if (dirty || !rect) { rect = el.getBoundingClientRect(); dirty = false; } return rect; }, mark, stop() { removeEventListener('scroll', mark); removeEventListener('resize', mark); } };
  }
  function visibility(on) {
    let vis = true;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((e) => { vis = e[e.length - 1].isIntersecting; on && on(vis); }) : null;
    io && io.observe(root);
    return { is: () => vis, stop: () => io && io.disconnect() };
  }
  // critically-underdamped spring toward a target, dt-based so frame rate does not matter
  function spring(k = 170, c = 21) {
    const s = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, init: false };
    s.step = (dt) => {
      const ax = k * (s.tx - s.x) - c * s.vx, ay = k * (s.ty - s.y) - c * s.vy;
      s.vx += ax * dt; s.vy += ay * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    };
    s.settled = () => Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) + Math.abs(s.vx) + Math.abs(s.vy) < 0.3;
    return s;
  }
  function loop(tick) {
    let raf = 0, last = 0;
    const frame = (t) => {
      raf = 0;
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
      if (tick(dt, t) !== false) raf = requestAnimationFrame(frame); else last = 0;
    };
    return { kick() { if (!raf) raf = requestAnimationFrame(frame); }, stop() { cancelAnimationFrame(raf); raf = 0; } };
  }

  // ---- disabled (touch or reduced motion): the list is a list; images show inline as thumbnails ----
  function inline() {
    const made = [];
    if (mode === 'list') {
      rows.forEach((r, i) => {
        const src = r.getAttribute('data-preview');
        if (!src || src === 'none') return;
        const im = makeMedia(src, i); im.classList.add('ct-thumb'); im.loading = 'lazy';
        const host = r.querySelector('a,button') || r;
        host.insertBefore(im, host.firstChild); made.push(im);
      });
    }
    return () => made.forEach((n) => n.remove());
  }

  // ---- trail mode ----
  function trail() {
    const layer = makeLayer();
    const pool = [];
    for (let i = 0; i < count; i++) {
      const g = document.createElement('div');
      g.className = 'ct-ghost'; g.style.width = size + 'px'; g.style.height = size * (images.length ? 1.25 : 1) + 'px';
      g.appendChild(makeMedia(images.length ? images[i % images.length] : '', i));
      layer.appendChild(g);
      pool.push({ el: g, born: -1, x: 0, y: 0, rot: 0 });
    }
    const sp = spring(), tr = tracker(root);
    let px = 0, py = 0, inside = false, lastX = 0, lastY = 0, next = 0, alive = 0;
    const vis = visibility();
    const L = loop((dt, t) => {
      if (inside && vis.is()) {
        sp.tx = px; sp.ty = py;
        if (!sp.init) { sp.x = px; sp.y = py; sp.init = true; lastX = px; lastY = py; }
        sp.step(dt);
        if (Math.hypot(sp.x - lastX, sp.y - lastY) > step) {
          const g = pool[next]; next = (next + 1) % pool.length;
          if (g.born < 0) alive++;
          g.born = t; g.x = sp.x; g.y = sp.y; g.rot = (Math.random() - 0.5) * 14;
          lastX = sp.x; lastY = sp.y;
        }
      }
      for (const g of pool) {
        if (g.born < 0) continue;
        const a = (t - g.born) / life;
        if (a >= 1) { g.born = -1; alive--; g.el.style.opacity = '0'; continue; }
        const k = 1 - a;
        g.el.style.opacity = (k * k).toFixed(3);
        g.el.style.transform = 'translate3d(' + (g.x + 26 - size / 2).toFixed(1) + 'px,' + (g.y + 26 - size / 2 + a * 14).toFixed(1) + 'px,0) rotate(' + g.rot.toFixed(1) + 'deg) scale(' + (1 - a * 0.22).toFixed(3) + ')';
      }
      return (inside && vis.is()) || alive > 0;
    });
    const move = (e) => {
      if (e.pointerType === 'touch') return;
      const r = tr.get(); px = e.clientX - r.left; py = e.clientY - r.top; inside = true; L.kick();
    };
    const leave = () => { inside = false; sp.init = false; L.kick(); };
    const hide = () => { if (document.hidden) { inside = false; sp.init = false; } };
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', hide);
    return () => {
      L.stop(); vis.stop(); tr.stop();
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', hide);
      layer.remove();
    };
  }

  // ---- list mode ----
  function list() {
    const layer = makeLayer();
    const box = document.createElement('div');
    box.className = 'ct-preview'; box.style.width = size * 2.4 + 'px';
    layer.appendChild(box);
    const slots = rows.map((r, i) => {
      const src = r.getAttribute('data-preview');
      const m = makeMedia(src && src !== 'none' ? src : '', i);
      m.classList.add('ct-slot'); box.appendChild(m);
      if (src && src !== 'none') { const pre = new Image(); pre.src = src; }
      return m;
    });
    const sp = spring(190, 24), tr = tracker(root);
    let cur = -1, px = 0, py = 0, docked = false, bw = size * 2.4, bh = bw * 1.25;
    const vis = visibility((v) => { if (!v) hideBox(); });
    const place = () => {
      const r = tr.get(); const w = root.clientWidth, h = root.clientHeight;
      let x = px + 28, y = py + 20;
      if (x + bw > w) x = px - 28 - bw;
      sp.tx = Math.max(0, Math.min(w - bw, x)); sp.ty = Math.max(0, Math.min(h - bh, y));
    };
    const L = loop((dt) => {
      sp.step(dt);
      box.style.transform = 'translate3d(' + sp.x.toFixed(1) + 'px,' + sp.y.toFixed(1) + 'px,0)';
      return cur >= 0 && !sp.settled();
    });
    const show = (i, dock) => {
      if (i === cur && docked === dock) return;
      slots.forEach((s, j) => s.classList.toggle('is-on', j === i));
      const first = cur < 0;
      cur = i; docked = dock;
      bw = box.offsetWidth; bh = box.offsetHeight;
      box.classList.add('is-on');
      if (dock) {
        const r = tr.get(), rr = rows[i].getBoundingClientRect();
        const w = root.clientWidth, h = root.clientHeight;
        let x = rr.right - r.left + 16;
        if (x + bw > w) x = rr.left - r.left - 16 - bw;
        if (x < 0) x = Math.max(0, w - bw);
        sp.tx = x; sp.ty = Math.max(0, Math.min(h - bh, rr.top - r.top + rr.height / 2 - bh / 2));
      } else place();
      if (first || !sp.init) { sp.x = sp.tx; sp.y = sp.ty; sp.init = true; }
      L.kick();
    };
    const hideBox = () => { cur = -1; box.classList.remove('is-on'); slots.forEach((s) => s.classList.remove('is-on')); L.kick(); };
    const rowOf = (t) => (t && t.closest ? t.closest('[data-preview]') : null);
    const over = (e) => {
      if (e.pointerType === 'touch') return;
      const r = rowOf(e.target); if (!r) { if (!docked) hideBox(); return; }
      const rect = tr.get(); px = e.clientX - rect.left; py = e.clientY - rect.top;
      show(rows.indexOf(r), false);
    };
    const move = (e) => {
      if (e.pointerType === 'touch' || cur < 0 || docked) return;
      const rect = tr.get(); px = e.clientX - rect.left; py = e.clientY - rect.top; place(); L.kick();
    };
    const fin = (e) => {
      const r = rowOf(e.target);
      if (r && e.target.matches && e.target.matches(':focus-visible')) show(rows.indexOf(r), true);
    };
    const fout = (e) => { if (!rowOf(e.relatedTarget)) hideBox(); };
    root.addEventListener('pointerover', over, { passive: true });
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', hideBox);
    root.addEventListener('focusin', fin);
    root.addEventListener('focusout', fout);
    return () => {
      L.stop(); vis.stop(); tr.stop();
      root.removeEventListener('pointerover', over); root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', hideBox);
      root.removeEventListener('focusin', fin); root.removeEventListener('focusout', fout);
      layer.remove();
    };
  }
}
