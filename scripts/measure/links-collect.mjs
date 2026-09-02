// links-collect.mjs — every anchor on the page, split into internal and external, with the
// dead ones named: href="#" placeholders, links with no text, and same-origin targets that
// answer 4xx/5xx. Internal targets are fetched with page.request.get (up to 200 unique), so
// the check costs no navigation and no rendering.
// Config keys read: checkLimit (default 200; 0 disables fetching), theme.
// Returns: { url, viewport, theme, links:[{selector,href,raw,text,external,rel,target}],
//            internal:[href], external:[href], deadHash:[selector+raw], emptyText:[selector+href],
//            checked:[{href,status}], broken:[{href,status}], counts:{links,internal,external,checked,broken}, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: deadHash.length === 0 && emptyText.length === 0 && broken.length === 0.
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
  const limit = Number.isFinite(config.checkLimit) ? Math.max(0, Math.min(config.checkLimit, 200)) : 200;

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
      const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
      const links = [];
      const internal = [];
      const external = [];
      const deadHash = [];
      const emptyText = [];
      const seenIn = new Set();
      const seenEx = new Set();
      for (const el of document.querySelectorAll('a')) {
        if (links.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const raw = el.getAttribute('href');
          const img = el.querySelector('img[alt]');
          const text = clean(
            el.textContent || el.getAttribute('aria-label') || (img ? img.getAttribute('alt') : '') || el.getAttribute('title')
          );
          const selector = sel(el);
          const resolved = raw && raw.trim() ? el.href : '';
          const isSameOrigin = resolved.indexOf(location.origin) === 0;
          const record = {
            selector,
            href: resolved.slice(0, 300),
            raw: raw === null ? null : String(raw).slice(0, 300),
            text: text.slice(0, 60),
            external: !!resolved && !isSameOrigin,
            rel: el.getAttribute('rel'),
            target: el.getAttribute('target'),
          };
          links.push(record);
          const trimmed = raw === null ? '' : String(raw).trim();
          if (trimmed === '' || trimmed === '#') deadHash.push({ selector, raw: trimmed, text: record.text });
          if (!text) emptyText.push({ selector, href: record.href });
          if (!resolved) continue;
          if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(trimmed)) continue;
          if (isSameOrigin) {
            const bare = resolved.split('#')[0];
            if (!seenIn.has(bare)) {
              seenIn.add(bare);
              internal.push(bare);
            }
          } else if (!seenEx.has(resolved)) {
            seenEx.add(resolved);
            external.push(resolved);
          }
        } catch (e) {
          /* one unreadable anchor never stops the sweep */
        }
      }
      return { links, internal, external, deadHash, emptyText, truncated, protocol: location.protocol };
    })
    .catch(() => ({ links: [], internal: [], external: [], deadHash: [], emptyText: [], truncated: false, protocol: '', error: 'evaluate failed' }));

  const checked = [];
  const fetchable = /^https?:$/.test(data.protocol || '') && limit > 0 && page.request;
  if (fetchable) {
    for (const href of data.internal.slice(0, limit)) {
      try {
        const res = await page.request.get(href, { timeout: 10000, maxRedirects: 5 });
        checked.push({ href, status: res.status() });
      } catch (e) {
        checked.push({ href, status: 0, error: String((e && e.message) || e).slice(0, 120) });
      }
    }
  }
  const broken = checked.filter((c) => c.status >= 400 || c.status === 0);
  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    links: data.links,
    internal: data.internal,
    external: data.external,
    deadHash: data.deadHash,
    emptyText: data.emptyText,
    checked,
    broken,
    counts: {
      links: data.links.length,
      internal: data.internal.length,
      external: data.external.length,
      checked: checked.length,
      broken: broken.length,
    },
    truncated: !!data.truncated,
    ...(data.error ? { error: data.error } : {}),
  };
}
