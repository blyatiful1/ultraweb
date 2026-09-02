// wallpaper-rhythm.mjs — the anti-wallpaper measurement: top-level sections inside <main>
// (or <body> when there is no main) that all breathe with the identical padding are a page
// laid out by a template, not composed. Fewer than two sections is not a rhythm, so it
// reports 'ok' rather than a false alarm.
// Config keys read: minHeight (a child shorter than this is chrome, not a section; default 40), theme.
// Returns: { url, viewport, theme, root, sections:[{selector,tag,paddingTop,paddingBottom,height}],
//            distinctPaddings, verdict:'ok'|'wallpaper'|'unmeasured', truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: verdict === 'ok'. 'unmeasured' is UNVERIFIED, never a pass.
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

  const data = await page
    .evaluate((minHeight) => {
      const cap = 500;
      const min = Number.isFinite(minHeight) && minHeight >= 0 ? minHeight : 40;
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
      const main = document.querySelector('main, [role="main"]') || document.body;
      if (!main) return { root: null, sections: [], distinctPaddings: 0, verdict: 'ok', truncated: false };
      const sections = [];
      for (const el of main.children) {
        if (sections.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const tag = el.tagName.toLowerCase();
          if (/^(script|style|template|noscript|link|meta|br|hr)$/.test(tag)) continue;
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') continue;
          const r = el.getBoundingClientRect();
          if (r.height < min) continue;
          sections.push({
            selector: sel(el),
            tag,
            paddingTop: s.paddingTop,
            paddingBottom: s.paddingBottom,
            height: Math.round(r.height),
          });
        } catch (e) {
          /* one unreadable section never stops the sweep */
        }
      }
      const distinct = new Set(sections.map((s) => s.paddingTop + '/' + s.paddingBottom)).size;
      return {
        root: sel(main),
        sections,
        distinctPaddings: distinct,
        verdict: sections.length >= 2 && distinct < 2 ? 'wallpaper' : 'ok',
        truncated,
      };
    }, config.minHeight)
    .catch(() => ({ root: null, sections: [], distinctPaddings: 0, verdict: 'unmeasured', truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return { url: page.url(), viewport, theme: config.theme || null, ...data };
}
