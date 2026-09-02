// landmarks-headings.mjs — the page's structural skeleton: landmark regions and the heading
// outline, plus the structural defects a screen-reader user hits first.
// Config keys read: none (theme is echoed from the config when present).
// Returns: { url, viewport, theme, landmarks:[{role,label,selector}], headings:[{level,text,selector}],
//            issues:[{kind:'no-main'|'no-nav'|'no-h1'|'multiple-h1'|'skipped-level'|'empty-heading', detail, selector}],
//            truncated,
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
      const visible = (el) => {
        try {
          const s = getComputedStyle(el);
          return s.display !== 'none' && s.visibility !== 'hidden';
        } catch (e) {
          return true;
        }
      };
      const labelOf = (el) => {
        const by = (el.getAttribute('aria-labelledby') || '')
          .split(/\s+/)
          .filter(Boolean)
          .map((id) => {
            const t = document.getElementById(id);
            return t ? t.textContent : '';
          })
          .join(' ');
        return String(el.getAttribute('aria-label') || by || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 60);
      };
      const IMPLICIT = {
        MAIN: 'main',
        NAV: 'navigation',
        HEADER: 'banner',
        FOOTER: 'contentinfo',
        ASIDE: 'complementary',
        FORM: 'form',
        SECTION: 'region',
        SEARCH: 'search',
      };
      const landmarks = [];
      const nodes = document.querySelectorAll(
        'main, nav, header, footer, aside, form, section, search, [role]'
      );
      let truncated = false;
      for (const el of nodes) {
        if (landmarks.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const explicit = (el.getAttribute('role') || '').trim().toLowerCase();
          let role = explicit || IMPLICIT[el.tagName] || null;
          if (!role) continue;
          const label = labelOf(el);
          // an unlabelled section/form is not a landmark
          if (!explicit && (el.tagName === 'SECTION' || el.tagName === 'FORM') && !label) continue;
          if ((el.tagName === 'HEADER' || el.tagName === 'FOOTER') && el.closest('main, article, section, aside'))
            continue;
          landmarks.push({ role, label, selector: sel(el) });
        } catch (e) {
          /* one unreadable node never stops the sweep */
        }
      }

      const headings = [];
      for (const el of document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')) {
        if (headings.length >= cap) {
          truncated = true;
          break;
        }
        try {
          if (!visible(el)) continue;
          const m = el.tagName.match(/^H([1-6])$/);
          const level = m ? Number(m[1]) : Number(el.getAttribute('aria-level')) || 2;
          headings.push({
            level,
            text: String(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
            selector: sel(el),
          });
        } catch (e) {
          /* skip */
        }
      }

      const issues = [];
      const has = (role) => landmarks.some((l) => l.role === role);
      if (!has('main')) issues.push({ kind: 'no-main', detail: 'no <main> and no [role="main"]', selector: 'html' });
      if (!has('navigation'))
        issues.push({ kind: 'no-nav', detail: 'no <nav> and no [role="navigation"]', selector: 'html' });
      const h1s = headings.filter((h) => h.level === 1);
      if (h1s.length === 0) issues.push({ kind: 'no-h1', detail: 'the page has no level-1 heading', selector: 'html' });
      if (h1s.length > 1)
        issues.push({
          kind: 'multiple-h1',
          detail: h1s.length + ' h1 elements: ' + h1s.map((h) => h.text || '(empty)').join(' | ').slice(0, 120),
          selector: h1s[1].selector,
        });
      let prev = 0;
      for (const h of headings) {
        if (!h.text) issues.push({ kind: 'empty-heading', detail: 'h' + h.level + ' has no text', selector: h.selector });
        if (prev && h.level > prev + 1)
          issues.push({
            kind: 'skipped-level',
            detail: 'h' + prev + ' followed by h' + h.level + ' ("' + (h.text || '') + '")',
            selector: h.selector,
          });
        prev = h.level;
      }
      return { landmarks, headings, issues, truncated };
    })
    .catch(() => ({ landmarks: [], headings: [], issues: [], truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return { url: page.url(), viewport, theme: config.theme || null, ...data };
}
