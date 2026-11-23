// horizontal-rail: sideways row driven by vertical scroll (sticky + translateX), native strip on phones / reduced motion / no JS.
// Native scroll is never intercepted. Focusing an off-screen item scrolls the page to the progress where it is visible.
export default function mount(root, options = {}) {
  if (!root || root.hasAttribute('data-moment-ready')) return () => {};
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const rail = root.querySelector('[data-hr-rail]');
  const track = root.querySelector('[data-hr-track]');
  if (!rail || !track) return () => {};
  const items = [...track.querySelectorAll('[data-hr-item]')];
  if (!items.length) return () => {};

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const showBar = String(options.progress ?? root.dataset.progress ?? 'true') !== 'false';
  const minW = parseInt(options.minWidth ?? root.dataset.minWidth ?? '900', 10) || 900;
  const mqReduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  const mqWide = win.matchMedia('(min-width: ' + minW + 'px)');
  const FOCUSABLE = 'a[href],button,input,select,textarea,[tabindex]';
  const el = (tag, attr) => { const n = doc.createElement(tag); for (const k in attr) n.setAttribute(k, attr[k]); return n; };

  const origRail = { tabindex: rail.getAttribute('tabindex'), role: rail.getAttribute('role'), label: rail.getAttribute('aria-label') };
  if (!rail.getAttribute('role')) rail.setAttribute('role', 'group');
  root.setAttribute('data-moment-ready', '');

  let mode = null;       // 'pinned' | 'native'
  let pin = null, bar = null, barFill = null, controls = null;
  const tabbed = [];
  let ro = null, raf = 0;
  let top = 0, dist = 0, vw = 0, x = 0;
  let lefts = [], rights = [];
  let barShown = false;

  // ---------- pinned ----------
  function measure() {
    if (mode !== 'pinned') return;
    const railH = rail.offsetHeight;
    vw = rail.clientWidth;
    dist = Math.max(0, track.scrollWidth - vw);
    pin.style.height = railH + dist + 'px';
    top = win.scrollY + pin.getBoundingClientRect().top;
    lefts = items.map((it) => it.offsetLeft);
    rights = items.map((it, i) => lefts[i] + it.offsetWidth);
    render();
  }
  function render() {
    raf = 0;
    if (mode !== 'pinned') return;
    const p = dist > 0 ? clamp((win.scrollY - top) / dist, 0, 1) : 0;
    x = p * dist;
    track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
    if (barFill) barFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }
  function schedule() { if (!raf) raf = win.requestAnimationFrame(render); }
  function reveal(i) {
    if (mode !== 'pinned' || i < 0) return;
    const gutter = lefts[0] || 0;
    const cur = clamp(win.scrollY - top, 0, dist);   // fresh: the browser may have scrolled already
    if (lefts[i] - cur >= 0 && rights[i] - cur <= vw) return;
    const wanted = clamp(lefts[i] - gutter, 0, dist);
    win.scrollTo({ top: Math.round(top + wanted), left: win.scrollX, behavior: 'instant' });
  }
  const itemOf = (t) => items.findIndex((it) => it === t || it.contains(t));
  const onFocusIn = (e) => { const i = itemOf(e.target); win.requestAnimationFrame(() => reveal(i)); };   // after the browser's own focus scroll
  const onRailScroll = () => { if (rail.scrollLeft) rail.scrollLeft = 0; if (rail.scrollTop) rail.scrollTop = 0; };
  const onHash = () => {
    const id = decodeURIComponent((win.location.hash || '').slice(1));
    if (!id) return;
    const t = doc.getElementById(id);
    if (t && track.contains(t)) reveal(itemOf(t));
  };

  function buildPinned() {
    mode = 'pinned';
    root.setAttribute('data-hr-mode', 'pinned');
    pin = el('div', { 'data-hr-pin': '' });
    rail.parentNode.insertBefore(pin, rail);
    pin.appendChild(rail);
    rail.removeAttribute('tabindex');
    items.forEach((it) => {
      if (!it.matches(FOCUSABLE) && !it.querySelector(FOCUSABLE)) {
        if (!it.hasAttribute('tabindex')) { it.setAttribute('tabindex', '0'); tabbed.push(it); }
      }
    });
    if (showBar) {
      bar = el('div', { 'data-hr-bar': '', 'aria-hidden': 'true' });
      barFill = el('span', {});
      bar.appendChild(barFill);
      rail.appendChild(bar);
    }
    track.addEventListener('focusin', onFocusIn);
    rail.addEventListener('scroll', onRailScroll, { passive: true });
    win.addEventListener('scroll', schedule, { passive: true });
    win.addEventListener('hashchange', onHash);
    ro = new win.ResizeObserver(measure);
    ro.observe(track); ro.observe(rail); ro.observe(doc.documentElement);
    if (doc.body) ro.observe(doc.body);
    win.addEventListener('load', measure);
    measure();
    onHash();
  }
  function destroyPinned() {
    if (ro) ro.disconnect();
    ro = null;
    if (raf) win.cancelAnimationFrame(raf);
    raf = 0;
    track.removeEventListener('focusin', onFocusIn);
    rail.removeEventListener('scroll', onRailScroll);
    win.removeEventListener('scroll', schedule);
    win.removeEventListener('hashchange', onHash);
    win.removeEventListener('load', measure);
    track.style.transform = '';
    if (!track.getAttribute('style')) track.removeAttribute('style');
    if (bar) bar.remove();
    bar = barFill = null;
    tabbed.splice(0).forEach((it) => it.removeAttribute('tabindex'));
    if (pin) { pin.parentNode.insertBefore(rail, pin); pin.remove(); }
    pin = null;
    root.removeAttribute('data-hr-mode');
    rail.scrollLeft = 0;
  }

  // ---------- native strip ----------
  function step(dir) {
    const first = items[0], second = items[1];
    const w = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    rail.scrollBy({ left: dir * w * (win.innerWidth < 600 ? 1 : 2), behavior: mqReduce.matches ? 'auto' : 'smooth' });
  }
  function updateButtons() {
    if (!controls) return;
    const max = rail.scrollWidth - rail.clientWidth;
    controls.hidden = max <= 2;
    controls.prev.disabled = rail.scrollLeft <= 2;
    controls.next.disabled = rail.scrollLeft >= max - 2;
  }
  function buildNative() {
    mode = 'native';
    root.setAttribute('data-hr-mode', 'native');
    if (!rail.hasAttribute('tabindex')) rail.setAttribute('tabindex', '0');
    const wrap = el('div', { 'data-hr-controls': '' });
    const mk = (label, dir, glyph) => {
      const b = el('button', { type: 'button', 'aria-label': label });
      b.textContent = glyph;
      b.addEventListener('click', () => step(dir));
      return b;
    };
    wrap.prev = mk('Previous items', -1, '←');
    wrap.next = mk('Next items', 1, '→');
    wrap.append(wrap.prev, wrap.next);
    rail.insertAdjacentElement('afterend', wrap);
    controls = wrap;
    rail.addEventListener('scroll', updateButtons, { passive: true });
    ro = new win.ResizeObserver(updateButtons);
    ro.observe(rail); ro.observe(track);
    updateButtons();
  }
  function destroyNative() {
    if (ro) ro.disconnect();
    ro = null;
    rail.removeEventListener('scroll', updateButtons);
    if (controls) controls.remove();
    controls = null;
    root.removeAttribute('data-hr-mode');
  }

  function sync() {
    const want = mqWide.matches && !mqReduce.matches ? 'pinned' : 'native';
    if (want === mode) return;
    if (mode === 'pinned') destroyPinned(); else if (mode === 'native') destroyNative();
    mode = null;
    if (want === 'pinned') buildPinned(); else buildNative();
  }
  const onChange = () => sync();
  const listen = (mq) => (mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange));
  const unlisten = (mq) => (mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange));
  listen(mqReduce); listen(mqWide);
  sync();

  return () => {
    unlisten(mqReduce); unlisten(mqWide);
    if (mode === 'pinned') destroyPinned(); else if (mode === 'native') destroyNative();
    mode = null;
    const restore = (k, v) => (v === null ? rail.removeAttribute(k) : rail.setAttribute(k, v));
    restore('tabindex', origRail.tabindex);
    restore('role', origRail.role);
    root.removeAttribute('data-moment-ready');
  };
}
