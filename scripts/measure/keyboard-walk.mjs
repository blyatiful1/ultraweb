// keyboard-walk.mjs — Tab through the page from the document start and record every stop:
// what it is, whether it paints a visible focus ring, whether it is on screen. The ring test
// reads the focused computed style, blurs, reads it again, and re-focuses — an outline the
// author removed shows up as "no change".
// trap:true means focus is pinned on ONE element (three consecutive identical stops) — always a
// defect. A correct modal CYCLES: the walk wraps back to its first stop, and cycledWithin lists
// the ring's unique selectors in order, so the gate can assert every one sits inside the dialog.
// Config keys read: maxStops (default 200).
// Returns: { url, viewport, theme, stops:[{index,tag,role,href,name,selector,visibleFocusRing,inViewport}],
//            skipLinkFirst, trap, cycledWithin:[selector], count, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: skipLinkFirst && !trap && visibleFocusRing on every stop; inside an open
// modal, cycledWithin non-empty and every selector inside the dialog. null = the walk never ran.
async (page) => {
  const config =
    (await page
      .evaluate(() => {
        try {
          return window.__ultraweb && typeof window.__ultraweb === 'object' ? window.__ultraweb : {};
        } catch (e) {
          return {};
        }
      })
      .catch(() => ({}))) || {};
  const max = Number.isFinite(config.maxStops) && config.maxStops > 0 ? Math.min(config.maxStops, 200) : 200;

  await page
    .evaluate(() => {
      window.scrollTo(0, 0);
      const b = document.body;
      if (!b) return;
      b.setAttribute('tabindex', '-1');
      b.focus();
      b.removeAttribute('tabindex');
    })
    .catch(() => {});

  let error = null;
  const probe = () =>
    page
      .evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body || el === document.documentElement) return null;
        const sel = (n0) => {
          const step = (n) => {
            if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) return '#' + n.id;
            const slot = n.getAttribute ? n.getAttribute('data-slot') : null;
            if (slot && /^[\w-]+$/.test(slot)) return n.tagName.toLowerCase() + '[data-slot="' + slot + '"]';
            const tag = n.tagName.toLowerCase();
            const p = n.parentElement;
            if (!p) return tag;
            const sibs = Array.prototype.filter.call(p.children, (c) => c.tagName === n.tagName);
            return sibs.length > 1 ? tag + ':nth-of-type(' + (sibs.indexOf(n) + 1) + ')' : tag;
          };
          const parts = [];
          let n = n0;
          for (let i = 0; n && n.nodeType === 1 && i < 5; i++) {
            const s = step(n);
            parts.unshift(s);
            if (s.charAt(0) === '#') break;
            n = n.parentElement;
          }
          return parts.join(' > ');
        };
        const labelledby = (n) =>
          (n.getAttribute('aria-labelledby') || '')
            .split(/\s+/)
            .filter(Boolean)
            .map((id) => {
              const t = document.getElementById(id);
              return t ? t.textContent : '';
            })
            .join(' ');
        const nameOf = (n) => {
          const img = n.querySelector ? n.querySelector('img[alt]') : null;
          const labels = n.labels && n.labels.length ? Array.prototype.map.call(n.labels, (l) => l.textContent).join(' ') : '';
          // a checkbox's value is "on", never a name; only button-ish inputs are named by value
          const value = n.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(n.type || '') ? n.value : '';
          const raw =
            n.getAttribute('aria-label') ||
            labelledby(n) ||
            labels ||
            (n.textContent || '') ||
            n.getAttribute('title') ||
            n.getAttribute('alt') ||
            (img ? img.getAttribute('alt') : '') ||
            value ||
            '';
          return String(raw).replace(/\s+/g, ' ').trim().slice(0, 60);
        };
        const pick = (s) => ({
          o: s.outlineStyle + '|' + s.outlineWidth + '|' + s.outlineColor + '|' + s.outlineOffset,
          s: s.boxShadow,
          b: s.borderTopWidth + '|' + s.borderTopStyle + '|' + s.borderTopColor,
        });
        const on = pick(getComputedStyle(el));
        let off = null;
        try {
          el.blur();
          off = pick(getComputedStyle(el));
          el.focus({ preventScroll: true });
        } catch (e) {
          off = null;
        }
        const ring =
          (on.o.indexOf('none|') !== 0 && (on.o.indexOf('auto|') === 0 || parseFloat(on.o.split('|')[1]) > 0)) ||
          (off !== null && (on.s !== off.s || on.b !== off.b || on.o !== off.o));
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('role') || null,
          href: el.getAttribute ? el.getAttribute('href') : null,
          name: nameOf(el),
          selector: sel(el),
          visibleFocusRing: !!ring,
          inViewport: r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth,
        };
      })
      // a probe that throws is a channel failure, not the end of the tab ring — say so
      .catch((e) => {
        error = 'probe failed: ' + String((e && e.message) || e).slice(0, 160);
        return null;
      });

  const stops = [];
  let trap = false;
  let truncated = false;
  let wrapped = false;
  for (let i = 0; i < max; i++) {
    try {
      await page.keyboard.press('Tab');
    } catch (e) {
      error = 'Tab press failed: ' + String((e && e.message) || e).slice(0, 160);
      break;
    }
    const s = await probe();
    if (!s) break;
    stops.push({ index: stops.length, ...s });
    const n = stops.length;
    if (n >= 3 && stops[n - 1].selector === stops[n - 2].selector && stops[n - 2].selector === stops[n - 3].selector) {
      trap = true;
      break;
    }
    if (n > 1 && s.selector === stops[0].selector && s.tag === stops[0].tag) {
      wrapped = true;
      break;
    }
    if (stops.length === max) truncated = true;
  }

  // the wrapping stop repeats stops[0], so the ring is everything before it, first stop first
  const cycledWithin = wrapped ? Array.from(new Set(stops.slice(0, -1).map((s) => s.selector))) : [];
  const first = stops[0] || null;
  const skipLinkFirst = !!(
    first &&
    first.tag === 'a' &&
    typeof first.href === 'string' &&
    first.href.charAt(0) === '#' &&
    /skip|inhalt|content|hauptinhalt/i.test(first.name)
  );
  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    stops,
    skipLinkFirst: error ? null : skipLinkFirst,
    trap: error ? null : trap,
    cycledWithin,
    count: stops.length,
    truncated,
    ...(error ? { error } : {}),
  };
}
