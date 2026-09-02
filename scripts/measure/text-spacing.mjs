// text-spacing.mjs — WCAG 1.4.12: force line-height 1.5, paragraph spacing 2em,
// letter-spacing .12em and word-spacing .16em, then look for text the layout can no longer
// hold. A design that only survives at its authored metrics fails here.
// overflowX compares documentElement.scrollWidth against documentElement.clientWidth, never
// innerWidth: clientWidth excludes the vertical scrollbar, so innerWidth hides ~15px of real
// overflow. Both widths come back so the basis is auditable.
// Config keys read: keep (leave the injected <style> in place for a screenshot), theme.
// Returns: { url, viewport, theme, clipped:[{selector,text,axis,scrollWidth,clientWidth,scrollHeight,clientHeight}],
//            overflowX, scrollWidth, clientWidth, innerWidth, styleKept, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: clipped.length === 0 && !overflowX. overflowX === null means unmeasured.
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

  await page
    .evaluate(() => {
      const id = '__ultraweb-text-spacing';
      if (document.getElementById(id)) return;
      const style = document.createElement('style');
      style.id = id;
      style.textContent =
        '*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }' +
        'p, li, dd, blockquote, figcaption, h1, h2, h3, h4, h5, h6 { margin-bottom: 2em !important; }';
      (document.head || document.documentElement).appendChild(style);
    })
    .catch(() => {});
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});

  const data = await page
    .evaluate(() => {
      const cap = 500;
      let truncated = false;
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
      const clipped = [];
      for (const el of document.body ? document.body.querySelectorAll('*') : []) {
        if (clipped.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
          if (!text) continue;
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') continue;
          // a deliberate scroll container (overflow-x:auto on a wide table) is not clipped text
          const hidesX = /hidden|clip/.test(s.overflowX) || s.textOverflow === 'ellipsis';
          const hidesY = /hidden|clip/.test(s.overflowY);
          const overX = hidesX && el.scrollWidth > el.clientWidth + 1;
          const overY = hidesY && el.scrollHeight > el.clientHeight + 1;
          if (!overX && !overY) continue;
          clipped.push({
            selector: sel(el),
            text: text.slice(0, 60),
            axis: overX && overY ? 'both' : overX ? 'x' : 'y',
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
          });
        } catch (e) {
          /* one unreadable node never stops the sweep */
        }
      }
      const root = document.documentElement;
      const box = { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, innerWidth: window.innerWidth };
      return { clipped, overflowX: root.scrollWidth > root.clientWidth, ...box, truncated };
    })
    .catch(() => ({ clipped: [], overflowX: null, scrollWidth: 0, clientWidth: 0, innerWidth: 0, truncated: false, error: 'evaluate failed' }));

  const styleKept = !!config.keep;
  if (!styleKept) {
    await page
      .evaluate(() => {
        const el = document.getElementById('__ultraweb-text-spacing');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      })
      .catch(() => {});
  }
  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    clipped: data.clipped,
    overflowX: data.overflowX === null ? null : !!data.overflowX,
    scrollWidth: data.scrollWidth,
    clientWidth: data.clientWidth,
    innerWidth: data.innerWidth,
    styleKept,
    truncated: !!data.truncated,
    ...(data.error ? { error: data.error } : {}),
  };
}
