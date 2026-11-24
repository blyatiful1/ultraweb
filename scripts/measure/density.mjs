// density.mjs — how much of each screen of the page carries something to look at or read.
// A careful build can pass every other check and still be mostly empty ground with small
// type. This scrolls the page one viewport at a time (so scroll reveals and sticky sections
// show what a visitor sees), adds up the area of visible text, media and controls on each
// screen, then reports long runs of small body text and how many different grounds the
// top-level sections use.
// Config keys read: sparse (default 0.07), empty (default 0.02), minFont (default 16).
// Returns: { url, viewport, slices:[{index, coverage}], sparse:[index], empty:[index],
//            sparseShare, smallText:{share, examples:[{selector, px, text}]}, bodyPx,
//            grounds:{sections, distinct}, error? }.
// The gate asserts: empty.length === 0 and sparseShare <= 0.5 and smallText.share <= 0.3;
// grounds is advisory. The last screen (usually the footer) is left out of the verdict.
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
  const sparseAt = Number.isFinite(config.sparse) && config.sparse > 0 ? config.sparse : 0.07;
  const minFont = Number.isFinite(config.minFont) && config.minFont > 0 ? config.minFont : 16;

  const emptyAt = Number.isFinite(config.empty) && config.empty >= 0 ? config.empty : 0.02;
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
  const count = Math.max(1, Math.min(40, Math.ceil(dims.total / dims.vh)));

  // coverage of the screen currently in view
  const screen = () =>
    page.evaluate(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let ink = 0;
      const add = (r) => {
        const w = Math.min(vw, r.right) - Math.max(0, r.left);
        const h = Math.min(vh, r.bottom) - Math.max(0, r.top);
        if (w >= 1 && h >= 1) ink += w * h;
      };
      const shownCache = new Map();
      const shown = (el) => {
        if (shownCache.has(el)) return shownCache.get(el);
        let ok = true;
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) {
            ok = false;
            break;
          }
        }
        shownCache.set(el, ok);
        return ok;
      };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.nodeValue || !node.nodeValue.trim()) continue;
        const parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(parent.tagName) || !shown(parent)) continue;
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) if (r.bottom > 0 && r.top < vh) add(r);
      }
      for (const el of document.querySelectorAll('img, svg, canvas, video, iframe, input, select, textarea, button')) {
        if (el.tagName.toLowerCase() !== 'svg' && el.closest('svg')) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= vh || r.width < 24 || r.height < 24 || !shown(el)) continue;
        add(r);
      }
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= vh || r.width < 80 || r.height < 80) continue;
        const bg = getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none' && /url\(/.test(bg) && shown(el)) add(r);
      }
      return Math.min(1, Math.round((ink / (vw * vh)) * 1000) / 1000);
    });

  const slices = [];
  for (let i = 0; i < count; i++) {
    const ok = await page
      .evaluate((y) => window.scrollTo(0, y), i * dims.vh)
      .then(() => true)
      .catch(fail);
    if (!ok) break;
    await page.waitForTimeout(350);
    const coverage = await screen().catch(fail);
    if (coverage === null) break;
    slices.push({ index: i, coverage });
  }
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  const judged = slices.length > 1 ? slices.slice(0, -1) : slices;
  const sparse = judged.filter((s) => s.coverage < sparseAt).map((s) => s.index);
  const empty = judged.filter((s) => s.coverage < emptyAt).map((s) => s.index);

  const rest = await page
    .evaluate(
      ({ minFont }) => {
        const shown = (el) => {
          for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
            const cs = getComputedStyle(e);
            if (cs.display === 'none' || cs.visibility === 'hidden') return false;
          }
          return true;
        };
        const sel = (n) => {
          if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) return '#' + n.id;
          const cls = (n.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0];
          return n.tagName.toLowerCase() + (cls ? '.' + cls : '');
        };
        let chars = 0;
        let smallChars = 0;
        const examples = [];
        const sizes = [];
        for (const el of document.querySelectorAll('p, li, dd, blockquote, td')) {
          if (el.querySelector('p, li, dd, blockquote, td')) continue;
          const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
          if (text.length < 60 || !shown(el)) continue;
          if (el.closest('footer, nav, small, figcaption, [data-small-ok]')) continue;
          const px = parseFloat(getComputedStyle(el).fontSize);
          chars += text.length;
          sizes.push(px);
          if (px < minFont - 0.01) {
            smallChars += text.length;
            if (examples.length < 6) examples.push({ selector: sel(el), px: Math.round(px * 10) / 10, text: text.slice(0, 60) });
          }
        }
        sizes.sort((a, b) => a - b);
        const blocks = [...document.querySelectorAll('main > *, body > section, body > header, body > footer')].filter((el) => shown(el) && el.getBoundingClientRect().height >= 160);
        const ground = (el) => {
          for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
            const cs = getComputedStyle(e);
            if (cs.backgroundImage && cs.backgroundImage !== 'none') return 'image:' + cs.backgroundImage.slice(0, 40);
            const m = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor);
            if (m) {
              const p = m[1].split(/[ ,/]+/).map(Number);
              if (p.length < 4 || p[3] > 0.05) return p.slice(0, 3).map((v) => Math.round(v / 12)).join(',');
            } else if (cs.backgroundColor && cs.backgroundColor !== 'transparent') {
              return cs.backgroundColor;
            }
          }
          return 'page';
        };
        return {
          smallText: { share: chars ? Math.round((smallChars / chars) * 100) / 100 : 0, examples },
          bodyPx: sizes.length ? sizes[Math.floor(sizes.length / 2)] : null,
          grounds: { sections: blocks.length, distinct: new Set(blocks.map(ground)).size },
        };
      },
      { minFont }
    )
    .catch(fail);

  const data = {
    viewport: { width: dims.vw, height: dims.vh },
    slices,
    sparse,
    empty,
    sparseShare: judged.length ? Math.round((sparse.length / judged.length) * 100) / 100 : 0,
    ...(rest || {}),
  };

  return { url: page.url(), ...(data || {}), ...(error ? { error } : {}) };
}
