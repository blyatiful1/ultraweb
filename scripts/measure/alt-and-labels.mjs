// alt-and-labels.mjs — every image and every interactive control, with the name a screen
// reader would announce and the four failures that make a site unusable without sight.
// Config keys read: none (theme is echoed from the config when present).
// Returns: { url, viewport, theme, images:[{selector,src,alt,decorative,issue}],
//            controls:[{selector,tag,type,name,labelled,issue}],
//            issues:[{kind:'missing-alt'|'filename-alt'|'unlabelled-control'|'icon-button-no-name', selector, detail}],
//            counts:{images,controls,issues}, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: issues.length === 0.
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
      const rendered = (el) => {
        try {
          const s = getComputedStyle(el);
          return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
        } catch (e) {
          return true;
        }
      };
      const byId = (el) =>
        (el.getAttribute('aria-labelledby') || '')
          .split(/\s+/)
          .filter(Boolean)
          .map((id) => {
            const t = document.getElementById(id);
            return t ? t.textContent : '';
          })
          .join(' ');
      const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
      const nameOf = (el) => {
        let label = '';
        if (el.labels && el.labels.length) label = Array.prototype.map.call(el.labels, (l) => l.textContent).join(' ');
        const img = el.querySelector ? el.querySelector('img[alt], svg title, [aria-label]') : null;
        return clean(
          el.getAttribute('aria-label') ||
            byId(el) ||
            label ||
            el.textContent ||
            el.getAttribute('title') ||
            el.getAttribute('alt') ||
            (el.tagName === 'INPUT' && el.type !== 'text' ? el.value : '') ||
            (img ? img.getAttribute('alt') || img.getAttribute('aria-label') || img.textContent : '')
        ).slice(0, 60);
      };
      const FILENAME = /(\.(png|jpe?g|gif|webp|avif|svg))$|^(img|image|photo|picture|dsc|screenshot|untitled)[-_ ]?\d*$/i;
      const base = (src) => {
        const s = String(src || '');
        const q = s.split('?')[0];
        return q.slice(q.lastIndexOf('/') + 1).slice(0, 80) || s.slice(0, 80);
      };

      const images = [];
      const issues = [];
      for (const el of document.querySelectorAll('img, [role="img"]')) {
        if (images.length >= cap) {
          truncated = true;
          break;
        }
        try {
          if (!rendered(el)) continue;
          const alt = el.hasAttribute('alt') ? el.getAttribute('alt') : el.getAttribute('aria-label');
          const hidden = el.getAttribute('aria-hidden') === 'true';
          const presentational = ['presentation', 'none'].indexOf(el.getAttribute('role') || '') !== -1;
          const decorative = alt === '' || hidden || presentational;
          let issue = null;
          if (alt === null && !decorative) issue = 'missing-alt';
          else if (alt && FILENAME.test(clean(alt))) issue = 'filename-alt';
          const selector = sel(el);
          images.push({ selector, src: base(el.getAttribute('src') || el.getAttribute('srcset')), alt, decorative, issue });
          if (issue) issues.push({ kind: issue, selector, detail: issue === 'missing-alt' ? base(el.getAttribute('src')) : clean(alt) });
        } catch (e) {
          /* one unreadable node never stops the sweep */
        }
      }

      const controls = [];
      const q =
        'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [tabindex]';
      for (const el of document.querySelectorAll(q)) {
        if (controls.length >= cap) {
          truncated = true;
          break;
        }
        try {
          if (!rendered(el)) continue;
          const tag = el.tagName.toLowerCase();
          const type = el.getAttribute('type') || null;
          if (tag === 'input' && (type === 'hidden' || el.type === 'hidden')) continue;
          if (el.getAttribute('aria-hidden') === 'true') continue;
          if (el.getAttribute('tabindex') === '-1' && !/^(a|button|input|select|textarea|summary)$/.test(tag)) continue;
          const name = nameOf(el);
          const labelled = name.length > 0;
          let issue = null;
          if (!labelled) {
            const r = el.getBoundingClientRect();
            const iconish = !clean(el.textContent) && r.width <= 48 && r.height <= 48;
            issue = tag === 'button' || el.getAttribute('role') === 'button' ? (iconish ? 'icon-button-no-name' : 'unlabelled-control') : 'unlabelled-control';
            if (iconish && (tag === 'a' || el.getAttribute('role') === 'link')) issue = 'unlabelled-control';
          }
          const selector = sel(el);
          controls.push({ selector, tag, type, name, labelled, issue });
          if (issue) issues.push({ kind: issue, selector, detail: tag + (type ? '[type=' + type + ']' : '') });
        } catch (e) {
          /* skip */
        }
      }

      return { images, controls, issues, counts: { images: images.length, controls: controls.length, issues: issues.length }, truncated };
    })
    .catch(() => ({ images: [], controls: [], issues: [], counts: { images: 0, controls: 0, issues: 0 }, truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return { url: page.url(), viewport, theme: config.theme || null, ...data };
}
