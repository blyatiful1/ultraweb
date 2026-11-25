// text-overlap.mjs — text that runs into other text: two pieces of visible text from different
// elements whose glyphs overlap, as when a figure set too large for its column spills into
// the next one. A page can pass every other check and still be unreadable at one width.
// The page is scrolled once first so scroll reveals have shown their text. Each line of text
// is reduced to an ink box (0.72 of the font size, centred on the line) so that tight leading
// between stacked lines does not count. Text inside SVG, aria-hidden subtrees, fixed or
// sticky bars, and text mostly clipped by an overflow container is left out. Pairs where one
// element contains the other are left out as well (superscripts, drop caps, badges).
// Config keys read: minOverlap (px of horizontal overlap that counts, default 4).
// Returns: { url, viewport, checked, count, collisions:[{a:{selector,text}, b:{selector,text},
//            overlap:{w,h}, at:{x,y}}], truncated, error? }.
// The gate asserts: count === 0.
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
  const minOverlap = Number.isFinite(config.minOverlap) && config.minOverlap > 0 ? config.minOverlap : 4;

  let error = null;
  const fail = (e) => {
    error = 'evaluate failed: ' + String((e && e.message) || e).slice(0, 160);
    return null;
  };

  const dims = await page
    .evaluate(() => ({
      vw: window.innerWidth,
      vh: window.innerHeight,
      total: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0),
    }))
    .catch(fail);
  if (!dims) return { url: page.url(), error };

  // show what scroll reveals hide, then return to the top
  const steps = Math.max(1, Math.min(40, Math.ceil(dims.total / dims.vh)));
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * dims.vh).catch(() => {});
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await page.waitForTimeout(150);

  const data = await page
    .evaluate((minW) => {
      const sx = window.scrollX;
      const sy = window.scrollY;
      const docW = Math.max(document.documentElement.scrollWidth, window.innerWidth);
      const sel = (n) => {
        if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) return '#' + n.id;
        const cls = (n.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0];
        const p = n.parentElement;
        const own = n.tagName.toLowerCase() + (cls ? '.' + cls : '');
        if (!p || p === document.body) return own;
        const pc = (p.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0];
        return (p.id && /^[A-Za-z][\w-]*$/.test(p.id) ? '#' + p.id : p.tagName.toLowerCase() + (pc ? '.' + pc : '')) + ' > ' + own;
      };

      // per element: is it rendered, is it in a fixed or sticky bar, and what clips its content
      const info = new Map();
      const INF = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
      const look = (el) => {
        if (!el || el.nodeType !== 1) return { shown: true, pinned: false, clip: INF };
        if (info.has(el)) return info.get(el);
        const up = look(el.parentElement);
        const cs = getComputedStyle(el);
        const shown = up.shown && cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) >= 0.05 && el.getAttribute('aria-hidden') !== 'true';
        const pinned = up.pinned || cs.position === 'fixed' || cs.position === 'sticky';
        let clip = up.clip;
        if (el !== document.body && el !== document.documentElement && (cs.overflowX !== 'visible' || cs.overflowY !== 'visible')) {
          const r = el.getBoundingClientRect();
          clip = { l: Math.max(clip.l, r.left + sx), t: Math.max(clip.t, r.top + sy), r: Math.min(clip.r, r.right + sx), b: Math.min(clip.b, r.bottom + sy) };
        }
        const out = { shown, pinned, clip };
        info.set(el, out);
        return out;
      };

      const boxes = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let cap = 0;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const raw = node.nodeValue;
        if (!raw || !raw.trim()) continue;
        const el = node.parentElement;
        if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION|TEXTAREA)$/.test(el.tagName) || el.closest('svg')) continue;
        const st = look(el);
        if (!st.shown || st.pinned) continue;
        // a closed <details> keeps its text in the tree with stale boxes; checkVisibility knows
        if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          if (r.width < 3 || r.height < 3) continue;
          const l = r.left + sx;
          const rr = r.right + sx;
          if (rr <= 0 || l >= docW) continue;
          const cy = (r.top + r.bottom) / 2 + sy;
          const half = Math.min(r.height / 2, fs * 0.36);
          const box = { l, r: rr, t: cy - half, b: cy + half };
          const c = st.clip;
          const il = Math.max(box.l, c.l);
          const ir = Math.min(box.r, c.r);
          const it = Math.max(box.t, c.t);
          const ib = Math.min(box.b, c.b);
          const full = (box.r - box.l) * (box.b - box.t);
          if (ir <= il || ib <= it || (ir - il) * (ib - it) < full * 0.6) continue;
          boxes.push({ el, fs, l: il, r: ir, t: it, b: ib, text: raw.replace(/\s+/g, ' ').trim().slice(0, 40) });
          if (++cap >= 8000) break;
        }
        if (cap >= 8000) break;
      }

      boxes.sort((a, b) => a.t - b.t);
      const found = [];
      const seen = new Set();
      const ids = new Map();
      const idOf = (el) => {
        if (!ids.has(el)) ids.set(el, ids.size);
        return ids.get(el);
      };
      let count = 0;
      for (let i = 0; i < boxes.length; i++) {
        const a = boxes[i];
        for (let j = i + 1; j < boxes.length; j++) {
          const b = boxes[j];
          if (b.t >= a.b) break;
          if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
          const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
          const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
          if (w < minW || h < Math.min(a.fs, b.fs) * 0.3) continue;
          const key = idOf(a.el) < idOf(b.el) ? idOf(a.el) + ':' + idOf(b.el) : idOf(b.el) + ':' + idOf(a.el);
          if (seen.has(key)) continue;
          seen.add(key);
          count++;
          if (found.length < 20) {
            found.push({
              a: { selector: sel(a.el), text: a.text },
              b: { selector: sel(b.el), text: b.text },
              overlap: { w: Math.round(w), h: Math.round(h) },
              at: { x: Math.round(Math.max(a.l, b.l)), y: Math.round(Math.max(a.t, b.t)) },
            });
          }
        }
      }
      return { checked: boxes.length, count, collisions: found, truncated: cap >= 8000 || count > found.length };
    }, minOverlap)
    .catch(fail);

  return { url: page.url(), viewport: { width: dims.vw, height: dims.vh }, ...(data || {}), ...(error ? { error } : {}) };
}
