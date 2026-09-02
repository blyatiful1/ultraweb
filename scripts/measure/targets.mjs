// targets.mjs — interactive elements whose rendered box is smaller than the threshold in
// either dimension. The accessibility gate seeds 24 (WCAG 2.2 target size, minimum); the
// responsive gate seeds 44 at 375px, where a thumb is the pointer.
// Config keys read: threshold (default 24), theme.
// Returns: { url, viewport, theme, threshold, small:[{selector,text,tag,w,h}], count, checked, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: small.length === 0.
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
  const threshold = Number.isFinite(config.threshold) && config.threshold > 0 ? config.threshold : 24;

  const data = await page
    .evaluate((min) => {
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
      const q =
        'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"], [role="menuitem"], [tabindex]:not([tabindex="-1"])';
      const small = [];
      let checked = 0;
      for (const el of document.querySelectorAll(q)) {
        if (small.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden' || el.getAttribute('aria-hidden') === 'true') continue;
          if (el.disabled) continue;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          checked++;
          // an inline link inside a paragraph is text, not a target — WCAG 2.2 exempts it
          const inlineInText =
            el.tagName === 'A' &&
            s.display.indexOf('inline') === 0 &&
            el.parentElement &&
            /^(p|li|td|dd|blockquote|span|figcaption|small)$/.test(el.parentElement.tagName.toLowerCase());
          if (inlineInText) continue;
          const w = Math.round(r.width * 10) / 10;
          const h = Math.round(r.height * 10) / 10;
          if (w < min || h < min) {
            small.push({
              selector: sel(el),
              tag: el.tagName.toLowerCase(),
              text: String(el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60),
              w,
              h,
            });
          }
        } catch (e) {
          /* one unreadable node never stops the sweep */
        }
      }
      return { small, checked, truncated };
    }, threshold)
    .catch(() => ({ small: [], checked: 0, truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    threshold,
    small: data.small,
    count: data.small.length,
    checked: data.checked,
    truncated: !!data.truncated,
    ...(data.error ? { error: data.error } : {}),
  };
}
