// ultraweb kit — system.js (ESM, no dependencies). Load once at the end of <body>:
//   <script type="module" src="kit/system.js"></script>
// (a) Mounts every [data-moment="<name>"] when it comes within one viewport of the screen:
//     imports ./moments/<name>/moment.js (relative to this file), links its moment.css once,
//     calls mount(el) and keeps the cleanup. A failed import or mount logs one console.warn
//     and leaves the markup as it is. window.ultrawebKit = { mountAll, unmountAll }.
// (b) Opens and closes the mobile-nav <dialog> from system.css.
// Never edit this file.

const BASE = new URL('./moments/', import.meta.url);
const mounted = new Map(); // element -> cleanup function, or 'pending'
let observer = null;

// Links moment.css once; resolves when it has loaded (or failed) so mount never runs unstyled.
const cssReady = new Map(); // name -> Promise
function linkCss(name) {
  if (cssReady.has(name)) return cssReady.get(name);
  const href = new URL(`${name}/moment.css`, BASE).href;
  for (const l of document.querySelectorAll('link[rel="stylesheet"]')) if (l.href === href) return Promise.resolve();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.kitMoment = name;
  const ready = new Promise((r) => {
    link.onload = link.onerror = r;
  });
  document.head.append(link);
  cssReady.set(name, ready);
  return ready;
}

async function mountOne(el) {
  if (mounted.has(el)) return;
  const name = el.dataset.moment;
  if (!/^[a-z0-9-]+$/.test(name || '')) {
    console.warn(`ultraweb kit: data-moment="${name}" is not a valid moment name`);
    return;
  }
  mounted.set(el, 'pending');
  try {
    const [mod] = await Promise.all([import(new URL(`${name}/moment.js`, BASE).href), linkCss(name)]);
    if (typeof mod.default !== 'function') throw new Error('moment.js has no default export');
    if (mounted.get(el) !== 'pending') return; // unmounted while loading
    const cleanup = mod.default(el, {});
    mounted.set(el, typeof cleanup === 'function' ? cleanup : () => {});
  } catch (err) {
    mounted.delete(el);
    console.warn(`ultraweb kit: moment "${name}" did not mount; content left as is. ${err && err.message ? err.message : err}`);
  }
}

export function mountAll(scope = document) {
  const els = scope.querySelectorAll('[data-moment]');
  if (!('IntersectionObserver' in window)) {
    els.forEach(mountOne);
    return;
  }
  observer ||= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        observer.unobserve(e.target);
        mountOne(e.target);
      }
    },
    { rootMargin: '100% 0px 100% 0px' } // within one viewport above or below
  );
  els.forEach((el) => {
    if (!mounted.has(el)) observer.observe(el);
  });
}

export function unmountAll() {
  if (observer) observer.disconnect();
  observer = null;
  for (const [el, cleanup] of mounted) {
    mounted.delete(el);
    if (typeof cleanup !== 'function') continue;
    try {
      cleanup();
    } catch (err) {
      console.warn(`ultraweb kit: cleanup of "${el.dataset.moment}" failed. ${err && err.message}`);
    }
  }
}

// ---- mobile nav: button[data-nav-open="<dialog id>"], dialog button[data-nav-close]
function wireNav() {
  for (const btn of document.querySelectorAll('[data-nav-open]')) {
    const dialog = document.getElementById(btn.dataset.navOpen);
    if (!dialog || typeof dialog.showModal !== 'function' || dialog.dataset.kitWired) continue;
    dialog.dataset.kitWired = '';
    btn.setAttribute('aria-controls', dialog.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      dialog.showModal();
      btn.setAttribute('aria-expanded', 'true');
    });
    dialog.addEventListener('close', () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    });
    dialog.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-nav-close]') || t.closest('a[href]')) dialog.close();
    });
    // a phone rotated to desktop width: close so the page is not left locked
    matchMedia('(min-width: 48rem)').addEventListener('change', (m) => {
      if (m.matches && dialog.open) dialog.close();
    });
  }
}

function start() {
  wireNav();
  mountAll();
}

if (typeof window !== 'undefined') {
  window.ultrawebKit = { mountAll, unmountAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
