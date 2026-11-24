// wallpaper-rhythm.mjs — the anti-wallpaper measurement: the top-level sections inside <main>
// (or <body> when there is no main) that all breathe with the identical vertical spacing are a
// page laid out by a template, not composed. The spacing is read from the element that actually
// carries it: single-child wrappers are walked into (main > div > sections, section > div.py-24),
// and margins count beside padding.
// Fewer than three sections, or sections whose spacing is zero everywhere (the rhythm lives in
// gaps or inner elements), cannot be judged: the verdict is 'unmeasured', never a false 'ok'.
// Config keys read: minHeight (a child shorter than this is chrome, not a section; default 40), theme.
// Returns: { url, viewport, theme, root, sections:[{selector,tag,carrier,paddingTop,paddingBottom,spacingTop,
//            spacingBottom,height}], distinctPaddings, verdict:'ok'|'wallpaper'|'unmeasured', reason,
//            truncated, error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: verdict === 'ok'. 'wallpaper' and 'unmeasured' are review (the judge looks); a
// run that threw is UNVERIFIED, never a pass.
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
      const rendered = (el) => {
        if (/^(script|style|template|noscript|link|meta|br|hr)$/.test(el.tagName.toLowerCase())) return false;
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
        return el.getBoundingClientRect().height >= 1;
      };
      const kids = (el) => Array.prototype.filter.call(el.children, rendered);
      const px = (v) => parseFloat(v) || 0;

      let root = document.querySelector('main, [role="main"]') || document.body;
      if (!root) return { root: null, sections: [], distinctPaddings: 0, verdict: 'unmeasured', reason: 'no document body', truncated: false };
      // a lone wrapper (main > div#app, body > div#__next) is not the section list: walk into it
      for (let depth = 0; depth < 3; depth++) {
        const k = kids(root);
        if (k.length !== 1) break;
        root = k[0];
      }
      const sections = [];
      for (const el of root.children) {
        if (sections.length >= cap) {
          truncated = true;
          break;
        }
        try {
          if (!rendered(el)) continue;
          const outer = el.getBoundingClientRect();
          if (outer.height < min) continue;
          // the element that actually carries the spacing: walk into single-child wrappers while the spacing is zero
          let carrier = el;
          for (let depth = 0; depth < 3; depth++) {
            const cs = getComputedStyle(carrier);
            if (px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.marginTop) + px(cs.marginBottom) > 0) break;
            const k = kids(carrier);
            if (k.length !== 1) break;
            carrier = k[0];
          }
          const s = getComputedStyle(carrier);
          const o = getComputedStyle(el);
          sections.push({
            selector: sel(el),
            tag: el.tagName.toLowerCase(),
            carrier: carrier === el ? null : sel(carrier),
            paddingTop: s.paddingTop,
            paddingBottom: s.paddingBottom,
            spacingTop: Math.round((px(s.paddingTop) + px(s.marginTop) + px(o.marginTop)) * 10) / 10,
            spacingBottom: Math.round((px(s.paddingBottom) + px(s.marginBottom) + px(o.marginBottom)) * 10) / 10,
            height: Math.round(outer.height),
          });
        } catch (e) {
          /* one unreadable section never stops the sweep */
        }
      }
      const distinct = new Set(sections.map((s) => s.spacingTop + '/' + s.spacingBottom)).size;
      const allZero = sections.length > 0 && sections.every((s) => s.spacingTop === 0 && s.spacingBottom === 0);
      let verdict = 'ok';
      let reason = null;
      if (sections.length === 0) {
        verdict = 'unmeasured';
        reason = 'no section-height children found under ' + sel(root);
      } else if (sections.length < 3) {
        verdict = 'unmeasured';
        reason = 'fewer than three sections is not a rhythm';
      } else if (allZero) {
        verdict = 'unmeasured';
        reason = 'no vertical padding or margin on any section or single-child wrapper; the rhythm lives in gaps or inner elements';
      } else if (distinct < 2) {
        verdict = 'wallpaper';
        reason = sections.length + ' sections share one vertical spacing';
      }
      return { root: sel(root), sections, distinctPaddings: distinct, verdict, reason, truncated };
    }, config.minHeight)
    .catch(() => ({ root: null, sections: [], distinctPaddings: 0, verdict: 'unmeasured', reason: null, truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return { url: page.url(), viewport, theme: config.theme || null, ...data };
}
