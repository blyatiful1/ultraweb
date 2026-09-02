// overflow-culprits.mjs — does the document scroll sideways at the current viewport, and
// which elements stick out past its right edge. Run it at the narrow breakpoint; the culprit
// list is the fix list, deepest element first.
// overflowX compares documentElement.scrollWidth against documentElement.clientWidth, never
// innerWidth: clientWidth excludes the vertical scrollbar, so measuring against innerWidth
// hides up to ~15px of real overflow. Culprits stay measured against innerWidth — a box is a
// culprit when its right edge crosses the visual viewport, which is what the reader sees.
// Config keys read: tolerance (px slack before an element counts, default 1), theme.
// Returns: { url, viewport, theme, overflowX, scrollWidth, innerWidth, clientWidth,
//            culprits:[{selector,tag,text,left,right,width}], count, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: !overflowX. overflowX === null means unmeasured.
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
    .evaluate((slack) => {
      const cap = 500;
      const tol = Number.isFinite(slack) ? slack : 1;
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
      const w = window.innerWidth;
      const root = document.documentElement;
      const culprits = [];
      for (const el of document.body ? document.body.querySelectorAll('*') : []) {
        if (culprits.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') continue;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          if (r.right <= w + tol) continue;
          culprits.push({
            selector: sel(el),
            tag: el.tagName.toLowerCase(),
            text: String(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
          });
        } catch (e) {
          /* one unreadable node never stops the sweep */
        }
      }
      // the deepest boxes are the ones to fix; ancestors merely inherit the overflow
      culprits.sort((a, b) => b.selector.split('>').length - a.selector.split('>').length);
      return {
        overflowX: root.scrollWidth > root.clientWidth,
        scrollWidth: root.scrollWidth,
        innerWidth: w,
        clientWidth: root.clientWidth,
        culprits,
        truncated,
      };
    }, config.tolerance)
    .catch(() => ({
      overflowX: null,
      scrollWidth: 0,
      innerWidth: 0,
      clientWidth: 0,
      culprits: [],
      truncated: false,
      error: 'evaluate failed',
    }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    overflowX: data.overflowX === null ? null : !!data.overflowX,
    scrollWidth: data.scrollWidth,
    innerWidth: data.innerWidth,
    clientWidth: data.clientWidth,
    culprits: data.culprits,
    count: data.culprits.length,
    truncated: !!data.truncated,
    ...(data.error ? { error: data.error } : {}),
  };
}
