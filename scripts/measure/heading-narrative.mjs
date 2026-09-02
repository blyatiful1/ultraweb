// heading-narrative.mjs — the heading outline as narrative evidence. Whether the outline
// alone tells the page's story is JUDGMENT (the Lead rules on it); generic filler headings
// and empty headings are MEASURED here.
// Config keys read: none (theme is echoed from the config when present).
// Returns: { url, viewport, theme, outline:[{level,text,selector}], generic:[text], empty:n,
//            counts:{headings,generic}, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: generic.length === 0 && empty === 0; the Lead reads `outline` and rules
// on whether it carries the page without the body copy.
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
      const GENERIC = /^(features|our services|welcome|about( us)?|services|solutions|why us|get started|learn more)$/i;
      const outline = [];
      const generic = [];
      let empty = 0;
      for (const el of document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')) {
        if (outline.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') continue;
          const m = el.tagName.match(/^H([1-6])$/);
          const level = m ? Number(m[1]) : Number(el.getAttribute('aria-level')) || 2;
          const text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
          outline.push({ level, text: text.slice(0, 80), selector: sel(el) });
          if (!text) empty++;
          else if (GENERIC.test(text)) generic.push(text);
        } catch (e) {
          /* one unreadable heading never stops the sweep */
        }
      }
      return { outline, generic, empty, counts: { headings: outline.length, generic: generic.length }, truncated };
    })
    .catch(() => ({ outline: [], generic: [], empty: 0, counts: { headings: 0, generic: 0 }, truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return { url: page.url(), viewport, theme: config.theme || null, ...data };
}
