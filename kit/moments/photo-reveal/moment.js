// photo-reveal: media frames wipe open (clip-path) while the picture settles inside the frame.
const mounted = new WeakMap();
const MEDIA = 'img,svg,video,picture,canvas';

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (mounted.has(root)) return mounted.get(root);
  const ds = root.dataset;
  const opt = (k, d) => (options[k] !== undefined ? options[k] : ds[k] !== undefined && ds[k] !== '' ? ds[k] : d);
  const stagger = +opt('stagger', 90) || 0;
  const defFrom = String(opt('from', 'bottom'));
  const wantPar = !['false', 'off', '0'].includes(String(opt('parallax', 'true')));
  const mq = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const par = wantPar && mq('(pointer: fine)') && !mq('(pointer: coarse)') && !reduce;
  const frames = root.hasAttribute('data-reveal') ? [root] : [...root.querySelectorAll('[data-reveal]')];
  const undo = [];
  const timers = new Set();
  const media = new Map();
  let raf = 0, dead = false, io, vio, ro, onScroll;

  const cleanup = () => {
    if (dead) return;
    dead = true;
    mounted.delete(root);
    io && io.disconnect(); vio && vio.disconnect(); ro && ro.disconnect();
    onScroll && removeEventListener('scroll', onScroll);
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    frames.forEach((f) => {
      ['data-revealed', 'data-pr-done', 'data-instant', 'data-parallax-on'].forEach((a) => f.removeAttribute(a));
      f.style.removeProperty('--pr-delay');
      f.style.removeProperty('--pr-y');
    });
    undo.reverse().forEach((u) => u());
  };
  mounted.set(root, cleanup);

  // Reserve each frame's box from the media's width/height attributes (no layout shift).
  frames.forEach((f) => {
    const m = f.querySelector(MEDIA);
    media.set(f, m);
    const w = m && parseFloat(m.getAttribute('width')), h = m && parseFloat(m.getAttribute('height'));
    const ratio = f.getAttribute('data-ratio');
    if (ratio || (w > 0 && h > 0 && !f.style.aspectRatio)) {
      const prev = f.getAttribute('style');
      f.style.aspectRatio = ratio || w + ' / ' + h;
      undo.push(() => (prev === null ? f.removeAttribute('style') : f.setAttribute('style', prev)));
    }
    if (!f.hasAttribute('data-from')) {
      f.setAttribute('data-from', defFrom);
      undo.push(() => f.removeAttribute('data-from'));
    }
  });

  if (reduce || !('IntersectionObserver' in window) || !frames.length) return cleanup;

  root.setAttribute('data-moment-ready', '');
  undo.push(() => root.removeAttribute('data-moment-ready'));

  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

  const reveal = (f, delay, instant) => {
    if (f.hasAttribute('data-revealed')) return;
    const go = () => {
      if (dead || f.hasAttribute('data-revealed')) return;
      f.style.setProperty('--pr-delay', (instant ? 0 : delay) + 'ms');
      if (instant) f.setAttribute('data-instant', '');
      f.setAttribute('data-revealed', '');
      later(() => f.setAttribute('data-pr-done', ''), instant ? 0 : delay + 2000);
    };
    const m = media.get(f);
    if (m && m.tagName === 'IMG' && !m.complete) {
      // late image: wait (bounded) so the wipe never opens on an empty box; a failed image still reveals
      const once = () => { m.removeEventListener('load', once); m.removeEventListener('error', once); go(); };
      m.addEventListener('load', once); m.addEventListener('error', once);
      later(go, 1500);
    } else go();
  };

  io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach((e, i) => { reveal(e.target, i * stagger); io.unobserve(e.target); });
    entries.forEach((e) => {
      // already scrolled past (anchor jump, restored scroll): settle without animating
      if (!e.isIntersecting && e.boundingClientRect.bottom <= 0) { reveal(e.target, 0, true); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  frames.forEach((f) => io.observe(f));

  if (par) {
    // Gentle inner parallax: --pr-y (percent of the picture's own height), cached geometry, one rAF per scroll burst.
    const vis = new Set(), geo = new Map();
    let vh = innerHeight;
    const measure = (f) => { const r = f.getBoundingClientRect(); geo.set(f, { top: r.top + scrollY, h: r.height }); };
    const frame = () => {
      raf = 0;
      vis.forEach((f) => {
        const d = geo.get(f); if (!d) return;
        const p = Math.min(1, Math.max(0, (scrollY + vh - d.top) / (vh + d.h)));
        f.style.setProperty('--pr-y', ((0.5 - p) * 5).toFixed(2));
      });
    };
    onScroll = () => { if (!raf && !dead) raf = requestAnimationFrame(frame); };
    const targets = frames.filter((f) => f.getAttribute('data-parallax') !== 'off');
    targets.forEach((f) => f.setAttribute('data-parallax-on', ''));
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => { vh = innerHeight; targets.forEach(measure); onScroll(); });
      targets.forEach((f) => ro.observe(f));
      ro.observe(document.documentElement);
    }
    vio = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { measure(e.target); vis.add(e.target); } else vis.delete(e.target); });
      onScroll();
    }, { rootMargin: '10% 0px' });
    targets.forEach((f) => vio.observe(f));
    addEventListener('scroll', onScroll, { passive: true });
  }
  return cleanup;
}
