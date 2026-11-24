// type-scrub: words go from muted to full colour in reading order as the element scrolls through.
const KEY = '__momentTypeScrub';
const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (root[KEY]) return root[KEY];
  const win = root.ownerDocument.defaultView;
  const doc = root.ownerDocument;
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const ds = root.dataset;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const start = clamp01(num(options.start ?? ds.start, 0.85)); // element top at this fraction of viewport height = 0%
  const end = clamp01(num(options.end ?? ds.end, 0.35)); // element bottom at this fraction = 100%
  const muted = clamp01(num(options.muted ?? ds.muted, 0.18));
  const engine = String(options.engine ?? ds.engine ?? 'auto');
  const useCss = engine !== 'js' && !!(win.CSS && win.CSS.supports && win.CSS.supports('animation-timeline: view()'));

  const oldLabel = root.getAttribute('aria-label');
  const labelled = [];
  // aria-label is not allowed on a paragraph or a generic element, so those get a visually
  // hidden copy of the text instead of a label.
  const noName = !root.hasAttribute('role') && /^(P|DIV|SPAN|EM|STRONG|I|B|CODE|SMALL)$/.test(root.nodeName);
  let sr = null;
  if (noName) {
    sr = doc.createElement('span');
    sr.setAttribute('data-uw-sr', '');
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    sr.textContent = root.textContent.replace(/\s+/g, ' ').trim();
    root.insertBefore(sr, root.firstChild);
  } else root.setAttribute('aria-label', root.textContent.replace(/\s+/g, ' ').trim());
  root.querySelectorAll('a[href],button,[tabindex]').forEach((el) => {
    if (!el.hasAttribute('aria-label')) {
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      labelled.push(el);
    }
  });

  const words = [];
  const walker = doc.createTreeWalker(root, 4);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (!n.nodeValue.trim() || /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName) || n.parentNode === sr) continue;
    const frag = doc.createDocumentFragment();
    for (const part of n.nodeValue.split(/([ \t\n\r\f]+)/)) {
      if (!part) continue;
      if (/^[ \t\n\r\f]+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); continue; }
      const w = doc.createElement('span');
      w.className = 'ts-w';
      w.setAttribute('aria-hidden', 'true');
      w.style.setProperty('--i', String(words.length));
      w.textContent = part;
      frag.appendChild(w);
      words.push(w);
    }
    n.parentNode.replaceChild(frag, n);
  }
  root.style.setProperty('--n', String(words.length));
  root.style.setProperty('--ts-m', String(muted));

  let raf = 0;
  let dead = false;
  let top = 0;
  let height = 0;
  let vh = 0;
  let ro = null;
  let io = null;
  let onScroll = null;

  if (useCss) {
    root.style.animationTimeline = `view(block ${(end * 100).toFixed(2)}% ${((1 - start) * 100).toFixed(2)}%)`;
    root.setAttribute('data-ts-engine', 'css');
  } else {
    root.setAttribute('data-ts-engine', 'js');
    const refresh = () => {
      const r = root.getBoundingClientRect();
      top = r.top + win.scrollY;
      height = r.height;
      vh = win.innerHeight;
    };
    const update = () => {
      raf = 0;
      const p = clamp01((vh * start - (top - win.scrollY)) / (vh * (start - end) + height || 1));
      root.style.setProperty('--tsp', p.toFixed(4));
    };
    const queue = () => { if (!raf && !dead) raf = win.requestAnimationFrame(update); };
    refresh();
    update();
    onScroll = queue;
    const onResize = () => { refresh(); queue(); };
    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', onResize, { passive: true });
    ro = new win.ResizeObserver(onResize);
    ro.observe(root);
    ro.observe(doc.body);
    doc.fonts && doc.fonts.ready && doc.fonts.ready.then(onResize);
    io = new win.IntersectionObserver((e) => { if (e[0].isIntersecting) onResize(); }, { rootMargin: '50% 0px' });
    io.observe(root);
    root._tsResize = onResize;
  }
  root.setAttribute('data-moment-ready', '');

  const cleanup = () => {
    if (dead) return;
    dead = true;
    win.cancelAnimationFrame(raf);
    if (onScroll) {
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', root._tsResize);
      delete root._tsResize;
    }
    ro && ro.disconnect();
    io && io.disconnect();
    for (const w of words) w.replaceWith(doc.createTextNode(w.textContent));
    if (sr) sr.remove();
    root.normalize();
    root.removeAttribute('data-moment-ready');
    root.removeAttribute('data-ts-engine');
    ['--n', '--ts-m', '--tsp', 'animation-timeline'].forEach((p) => root.style.removeProperty(p));
    if (!root.getAttribute('style')) root.removeAttribute('style');
    if (!noName) { if (oldLabel == null) root.removeAttribute('aria-label'); else root.setAttribute('aria-label', oldLabel); }
    labelled.forEach((el) => el.removeAttribute('aria-label'));
    delete root[KEY];
  };
  root[KEY] = cleanup;
  return cleanup;
}
