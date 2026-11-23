// page-curtain: page-to-page transition for multi-page static sites.
// Cross-document View Transitions where supported (styles live in moment.css); otherwise a token-coloured curtain.
const mounted = new WeakMap();
const NAV = 'pc:nav', CUR = 'pc:curtain';

export default function mount(root, options = {}) {
  root = root || document.body;
  if (mounted.has(root)) return mounted.get(root);
  const ds = root.dataset;
  const opt = (k, d) => (options[k] !== undefined ? options[k] : ds[k] !== undefined && ds[k] !== '' ? ds[k] : d);
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} },
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasVT = typeof CSSViewTransitionRule !== 'undefined';
  const want = String(opt('mode', 'auto'));
  const useCurtain = !reduce && (want === 'curtain' || (want === 'auto' && !hasVT));
  const failsafe = +opt('timeout', 4000) || 4000;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  let dead = false, curtain = null, live = null, state = 'idle', pending = '', focusEl = null, focusHad = null;

  const arrived = (() => {
    const flag = store.get(NAV); store.del(NAV);
    let nt = ''; try { nt = performance.getEntriesByType('navigation')[0].type; } catch (e) {}
    return !!flag && Date.now() - +flag.split('|')[0] < 15000 || nt === 'back_forward';
  })();
  const curtainFlag = store.get(CUR); store.del(CUR);
  const covered = useCurtain && !!curtainFlag && Date.now() - +curtainFlag < 6000;

  // live region (polite) for the new page's title
  live = document.createElement('div');
  live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); live.setAttribute('data-pc-live', '');
  live.className = 'pc-live';
  document.body.appendChild(live);

  if (useCurtain) {
    curtain = document.createElement('div');
    curtain.className = 'pc-curtain'; curtain.setAttribute('aria-hidden', 'true');
    curtain.setAttribute('data-state', covered ? 'covered' : 'idle');
    document.body.appendChild(curtain);
  }
  document.documentElement.removeAttribute('data-pc-arriving'); // the head snippet's first-paint cover; ours takes over now

  const announce = () => {
    if (!arrived) return;
    later(() => { live.textContent = document.title; }, 250);
    const t = root.querySelector('[data-pc-focus]') || document.querySelector('main, [role="main"]') || document.querySelector('h1');
    if (t && !location.hash && !(document.activeElement && document.activeElement !== document.body)) {
      focusHad = t.getAttribute('tabindex');
      if (focusHad === null) t.setAttribute('tabindex', '-1');
      focusEl = t;
      t.focus({ preventScroll: true });
    }
  };

  // ---- curtain ----
  const dur = () => {
    const d = curtain ? parseFloat(getComputedStyle(curtain).transitionDuration) : 0;
    return (d > 0 ? d * 1000 : 450);
  };
  const reset = () => { if (curtain) curtain.setAttribute('data-state', 'idle'); state = 'idle'; pending = ''; };
  const uncover = () => {
    if (!curtain || curtain.getAttribute('data-state') === 'idle') { state = 'idle'; return; }
    state = 'uncovering';
    curtain.setAttribute('data-state', 'leaving');
    later(reset, dur() + 80);
  };
  const cover = (href) => {
    state = 'covering'; pending = href;
    curtain.setAttribute('data-state', 'covered');
    // hard timeout: never wait on transitionend alone
    later(() => {
      if (dead || state !== 'covering') return;
      state = 'leaving-page';
      store.set(NAV, Date.now() + '|' + location.href);
      store.set(CUR, String(Date.now()));
      location.assign(pending);
      // a slow, failed or download navigation must not leave the curtain up
      later(() => { if (!dead && state === 'leaving-page') { store.del(CUR); uncover(); } }, failsafe);
    }, dur() + 60);
  };

  const eligible = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return null;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return null;
    const tg = a.getAttribute('target'); if (tg && tg !== '_self') return null;
    if (/\bexternal\b/.test(a.getAttribute('rel') || '')) return null;
    let u; try { u = new URL(a.href, location.href); } catch (err) { return null; }
    if (!/^https?:$/.test(u.protocol) || u.origin !== location.origin) return null;
    if (u.pathname === location.pathname && u.search === location.search) return null; // hash-only or same page
    return u.href;
  };
  const onClick = (e) => {
    const href = eligible(e);
    if (!href) return;
    if (!useCurtain) { store.set(NAV, Date.now() + '|' + location.href); return; }   // native View Transitions or reduced motion: just remember for focus/announce
    if (state === 'leaving-page' || state === 'uncovering') return;                 // let the browser handle it
    e.preventDefault();
    if (state === 'covering') { pending = href; return; }                          // rapid clicks: last one wins, one navigation
    cover(href);
  };
  const onShow = (e) => {
    if (dead) return;
    if (e.persisted) {                       // back/forward cache restore: the page may be frozen under the curtain
      store.del(CUR); store.del(NAV);
      if (curtain) { state = 'covered'; curtain.setAttribute('data-state', 'covered'); requestAnimationFrame(() => requestAnimationFrame(uncover)); }
      live.textContent = ''; later(() => { live.textContent = document.title; }, 250);
    }
  };
  document.addEventListener('click', onClick);
  addEventListener('pageshow', onShow);

  if (covered) {
    state = 'covered';
    // uncover on pageshow of this page; if pageshow already fired or never comes, a bounded fallback
    if (document.readyState === 'complete') requestAnimationFrame(() => requestAnimationFrame(() => { if (state === 'covered') uncover(); }));
    later(() => { if (state === 'covered') uncover(); }, 1200);
    const once = () => { removeEventListener('pageshow', once); requestAnimationFrame(() => { if (state === 'covered') uncover(); }); };
    addEventListener('pageshow', once);
  }
  announce();

  const cleanup = () => {
    if (dead) return;
    dead = true; mounted.delete(root);
    document.removeEventListener('click', onClick); removeEventListener('pageshow', onShow);
    timers.forEach(clearTimeout);
    curtain && curtain.remove(); live && live.remove();
    if (focusEl && focusHad === null) focusEl.removeAttribute('tabindex');
  };
  mounted.set(root, cleanup);
  return cleanup;
}
