// type-lines: text enters line by line from behind a mask. Vanilla ESM, no deps.
const KEY = '__momentTypeLines';
const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
const bool = (v, d) => (v == null ? d : !(v === false || v === 'false' || v === '0'));

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (root[KEY]) return root[KEY];
  const win = root.ownerDocument.defaultView;
  const doc = root.ownerDocument;
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const ds = root.dataset;
  const stagger = num(options.stagger ?? ds.stagger, 70);
  const duration = options.duration ?? ds.duration;
  const trigger = String(options.trigger ?? ds.trigger ?? 'view');
  const once = bool(options.once ?? ds.once, true);

  const oldLabel = root.getAttribute('aria-label');
  const labelled = [];
  const text = root.textContent.replace(/\s+/g, ' ').trim();
  root.setAttribute('aria-label', text);
  root.querySelectorAll('a[href],button,[tabindex]').forEach((el) => {
    if (!el.hasAttribute('aria-label')) {
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      labelled.push(el);
    }
  });

  // split every text node into word masks (inline elements such as <em>/<a> stay intact)
  const words = [];
  const walker = doc.createTreeWalker(root, 4);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (!n.nodeValue.trim() || /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) continue;
    const frag = doc.createDocumentFragment();
    for (const part of n.nodeValue.split(/([ \t\n\r\f]+)/)) {
      if (!part) continue;
      if (/^[ \t\n\r\f]+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); continue; }
      const mask = doc.createElement('span');
      mask.className = 'tl-w';
      mask.setAttribute('aria-hidden', 'true');
      const inner = doc.createElement('span');
      inner.className = 'tl-i';
      inner.textContent = part;
      mask.appendChild(inner);
      frag.appendChild(mask);
      words.push(mask);
    }
    n.parentNode.replaceChild(frag, n);
  }

  root.style.setProperty('--tl-stagger', stagger + 'ms');
  if (duration != null && duration !== '') root.style.setProperty('--tl-dur', num(duration, 900) + 'ms');
  root.setAttribute('data-moment-ready', '');

  let fontsReady = false;
  let played = false;
  let lastW = -1;
  let io = null;
  let raf = 0;
  let dead = false;

  const measure = () => {
    let line = -1;
    let prevTop = -1e9;
    let prevH = 0;
    for (const w of words) {
      const r = w.getBoundingClientRect();
      if (r.top > prevTop + Math.max(prevH * 0.5, 2) || line < 0) { line += 1; prevTop = r.top; prevH = r.height; }
      w.style.setProperty('--l', String(line));
    }
  };
  const play = () => {
    if (played || dead) return;
    played = true;
    raf = win.requestAnimationFrame(() => { raf = win.requestAnimationFrame(() => root.setAttribute('data-in', '')); });
  };
  const reset = () => { played = false; root.removeAttribute('data-in'); };

  const ro = new win.ResizeObserver(() => {
    const w = root.getBoundingClientRect().width;
    if (Math.abs(w - lastW) < 0.5) return;
    lastW = w;
    measure(); // re-split on resize: only line indices change, nothing replays
  });
  ro.observe(root);

  const fonts = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise((r) => win.setTimeout(r, 2000))]).then(() => {
    if (dead) return;
    fontsReady = true;
    lastW = root.getBoundingClientRect().width;
    measure();
    if (trigger === 'load') { play(); return; }
    io = new win.IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { play(); if (once) io.disconnect(); }
        else if (!once) reset();
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    io.observe(root);
  });
  doc.fonts && doc.fonts.addEventListener && doc.fonts.addEventListener('loadingdone', onFonts);
  function onFonts() { if (fontsReady && !dead) { lastW = root.getBoundingClientRect().width; measure(); } }

  const cleanup = () => {
    if (dead) return;
    dead = true;
    ro.disconnect();
    io && io.disconnect();
    win.cancelAnimationFrame(raf);
    doc.fonts && doc.fonts.removeEventListener && doc.fonts.removeEventListener('loadingdone', onFonts);
    for (const m of words) m.replaceWith(doc.createTextNode(m.textContent));
    root.normalize();
    root.removeAttribute('data-moment-ready');
    root.removeAttribute('data-in');
    root.style.removeProperty('--tl-stagger');
    root.style.removeProperty('--tl-dur');
    if (!root.getAttribute('style')) root.removeAttribute('style');
    if (oldLabel == null) root.removeAttribute('aria-label'); else root.setAttribute('aria-label', oldLabel);
    labelled.forEach((el) => el.removeAttribute('aria-label'));
    delete root[KEY];
  };
  root[KEY] = cleanup;
  return cleanup;
}
