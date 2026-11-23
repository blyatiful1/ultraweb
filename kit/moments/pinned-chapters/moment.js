// pinned-chapters: sticky media column that follows the chapter crossing the viewport line.
// Pure CSS sticky + IntersectionObserver. Never scroll-jacks. Stacked on phones / reduced motion / no JS.
export default function mount(root, options = {}) {
  if (!root || root.hasAttribute('data-moment-ready')) return () => {};
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const chapters = [...root.querySelectorAll('[data-pc-chapter]')];
  if (chapters.length < 2) return () => {};

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const th = clamp(parseFloat(options.threshold ?? root.dataset.threshold ?? '0.5') || 0.5, 0.15, 0.85);
  let tr = String(options.transition ?? root.dataset.transition ?? 'fade');
  if (!['fade', 'slide', 'clip'].includes(tr)) tr = 'fade';
  const mqReduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  const mqWide = win.matchMedia('(min-width: 900px)');
  const addedIds = [];
  let built = null;
  let active = 0;

  chapters.forEach((ch, i) => {
    if (!ch.id) { ch.id = 'pc-' + (i + 1) + '-' + Math.random().toString(36).slice(2, 6); addedIds.push(ch); }
  });
  root.setAttribute('data-moment-ready', '');
  root.setAttribute('data-pc-transition', tr);

  const titleOf = (ch, i) => {
    if (ch.dataset.pcTitle) return ch.dataset.pcTitle;
    const h = ch.querySelector('h1,h2,h3,h4');
    return (h ? h.textContent : 'Chapter ' + (i + 1)).trim();
  };
  const el = (tag, attr) => {
    const n = doc.createElement(tag);
    for (const k in attr) n.setAttribute(k, attr[k]);
    return n;
  };
  const pad = (n) => String(n).padStart(2, '0');

  function setActive(i) {
    if (!built) return;
    active = i;
    built.panels.forEach((p, k) => {
      if (!p) return;
      const s = k === i ? 'active' : k < i ? 'before' : 'after';
      p.setAttribute('data-pc-state', s);
      if (s === 'active') p.removeAttribute('aria-hidden'); else p.setAttribute('aria-hidden', 'true');
    });
    built.links.forEach((a, k) => {
      if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    chapters.forEach((ch, k) => { if (k === i) ch.setAttribute('data-pc-active', ''); else ch.removeAttribute('data-pc-active'); });
    built.count.textContent = pad(i + 1) + ' / ' + pad(chapters.length);
  }

  function build() {
    if (built) return;
    const col = el('div', { 'data-pc-col': '' });
    const sticky = el('div', { 'data-pc-sticky': '' });
    const stage = el('div', { 'data-pc-stage': '' });
    const nav = el('nav', { 'data-pc-progress': '', 'aria-label': root.dataset.progressLabel || 'Chapters' });
    const count = el('p', { 'data-pc-count': '', 'aria-hidden': 'true' });
    const ol = el('ol', {});
    const links = [];
    const holders = [];
    const panels = chapters.map((ch, i) => {
      const m = ch.querySelector('[data-pc-media]');
      if (m) {
        const ph = doc.createComment('pc-media');
        m.replaceWith(ph);
        stage.appendChild(m);
        holders.push([ph, m]);
      }
      const li = doc.createElement('li');
      const a = el('a', { href: '#' + ch.id });
      const num = el('span', { 'data-pc-num': '' });
      num.textContent = pad(i + 1);
      const lab = el('span', { 'data-pc-label': '' });
      lab.textContent = titleOf(ch, i);
      a.append(num, lab);
      li.appendChild(a);
      ol.appendChild(li);
      links.push(a);
      return m;
    });
    nav.append(count, ol);
    sticky.append(stage, nav);
    col.appendChild(sticky);
    col.style.gridRow = '1 / span ' + chapters.length;
    root.insertBefore(col, root.firstChild);
    root.setAttribute('data-pc-mode', 'pinned');

    const pct = (th * 100).toFixed(2);
    const io = new win.IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) setActive(chapters.indexOf(e.target));
      }
    }, { rootMargin: '-' + Math.max(0, th * 100 - 1).toFixed(2) + '% 0px -' + Math.max(0, (1 - th) * 100 - 1).toFixed(2) + '% 0px', threshold: 0 });
    chapters.forEach((c) => io.observe(c));
    built = { col, panels, links, holders, io, count, pct };

    // initial state from real geometry (page may load already scrolled)
    const line = win.innerHeight * th;
    let start = 0;
    chapters.forEach((c, i) => { if (c.getBoundingClientRect().top <= line) start = i; });
    setActive(start);
  }

  function destroy() {
    if (!built) return;
    built.io.disconnect();
    built.holders.forEach(([ph, m]) => {
      ph.replaceWith(m);
      m.removeAttribute('data-pc-state');
      m.removeAttribute('aria-hidden');
    });
    built.col.remove();
    chapters.forEach((c) => c.removeAttribute('data-pc-active'));
    root.removeAttribute('data-pc-mode');
    built = null;
  }

  function sync() {
    if (mqWide.matches && !mqReduce.matches) build(); else destroy();
  }
  const onChange = () => sync();
  const listen = (mq) => (mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange));
  const unlisten = (mq) => (mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange));
  listen(mqReduce); listen(mqWide);
  sync();

  return () => {
    unlisten(mqReduce); unlisten(mqWide);
    destroy();
    addedIds.forEach((c) => c.removeAttribute('id'));
    root.removeAttribute('data-moment-ready');
    root.removeAttribute('data-pc-transition');
  };
}
