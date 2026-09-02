// contrast-matrix.mjs — WCAG contrast for every visible text node against its EFFECTIVE
// background: ancestor backgrounds are composited with alpha down to html, so a token that
// only looks fine because a parent paints behind it is measured honestly. A background that
// is still transparent at html is treated as white and flagged bgAssumed.
// Config keys read: theme ("light"|"dark"), themeStrategy ("class"|"media"), keepTheme, maxPairs.
// A theme in the config is applied before measuring (class → html.dark, media → emulated),
// so the gate runs the same script twice, once per theme. What it applied is undone before the
// return — html.dark goes back to the state found on entry, and colorScheme emulation is cleared
// only when THIS script set it — so the next script measures the page it inherited; keepTheme:
// true leaves the applied theme standing for a follow-up measurement.
// Returns: { url, viewport, theme, bgAssumed, truncated,
//            pairs:[{selector,text,fg,bg,ratio,fontSize,weight,required,pass,bgAssumed}],
//            failing:[same shape], counts:{pairs,failing},
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: failing.length === 0.
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

  // the state found on entry, so the toggle below can be handed back exactly as it was
  const hadDark = await page
    .evaluate(() => document.documentElement.classList.contains('dark'))
    .catch(() => null);
  let emulated = false;

  if (config.theme) {
    try {
      if (config.themeStrategy === 'media') {
        await page.emulateMedia({ colorScheme: config.theme === 'dark' ? 'dark' : 'light' });
        emulated = true;
      } else {
        await page.evaluate((t) => {
          document.documentElement.classList.toggle('dark', t === 'dark');
        }, config.theme);
      }
      await page.waitForTimeout(80);
    } catch (e) {
      /* the page keeps the theme it loaded with; `theme` in the result still says what was asked */
    }
  }

  // Every return path passes through this: a measurement script hands the page back unchanged,
  // or the next script in the run measures our theme instead of the site's.
  const restore = async () => {
    if (!config.theme || config.keepTheme === true) return;
    try {
      if (emulated) await page.emulateMedia({ colorScheme: null });
      if (hadDark !== null) {
        await page.evaluate((d) => {
          document.documentElement.classList.toggle('dark', d);
        }, hadDark);
      }
    } catch (e) {
      /* a page that closed under us needs no restoring */
    }
  };

  const data = await page
    .evaluate((max) => {
      const cap = Number.isFinite(max) && max > 0 ? max : 500;
      const cv = document.createElement('canvas');
      cv.width = 1;
      cv.height = 1;
      let ctx = null;
      try {
        ctx = cv.getContext('2d', { willReadFrequently: true });
      } catch (e) {
        ctx = null;
      }
      const cache = new Map();
      const toRgba = (str) => {
        const s = String(str || '').trim();
        if (!s) return null;
        if (cache.has(s)) return cache.get(s);
        let out = null;
        if (s === 'transparent') out = { r: 0, g: 0, b: 0, a: 0 };
        const m = !out && s.indexOf('%') === -1 ? s.match(/^rgba?\(([^)]+)\)$/i) : null;
        if (m) {
          const n = m[1].split(/[\s,]+/).filter(Boolean).map(parseFloat);
          if (n.length >= 3 && n.every((v) => !Number.isNaN(v))) {
            out = { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
          }
        }
        if (!out && ctx) {
          try {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = '#000000';
            ctx.fillStyle = s;
            ctx.fillRect(0, 0, 1, 1);
            const d = ctx.getImageData(0, 0, 1, 1).data;
            out = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
          } catch (e) {
            out = null;
          }
        }
        cache.set(s, out);
        return out;
      };
      const over = (top, bottom) => {
        const a = top.a + bottom.a * (1 - top.a);
        if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
        return {
          r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
          g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
          b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
          a,
        };
      };
      const lum = (c) => {
        const f = (v) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const hex = (c) =>
        '#' +
        [c.r, c.g, c.b]
          .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
          .join('');
      const sel = (el) => {
        const step = (n) => {
          if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) return '#' + n.id;
          const slot = n.getAttribute ? n.getAttribute('data-slot') : null;
          if (slot && /^[\w-]+$/.test(slot)) return n.tagName.toLowerCase() + '[data-slot="' + slot + '"]';
          const tag = n.tagName.toLowerCase();
          const parent = n.parentElement;
          if (!parent) return tag;
          const sibs = Array.prototype.filter.call(parent.children, (c) => c.tagName === n.tagName);
          return sibs.length > 1 ? tag + ':nth-of-type(' + (sibs.indexOf(n) + 1) + ')' : tag;
        };
        const parts = [];
        let n = el;
        for (let i = 0; n && n.nodeType === 1 && i < 5; i++) {
          const s = step(n);
          parts.unshift(s);
          if (s.charAt(0) === '#') break;
          n = n.parentElement;
        }
        return parts.join(' > ');
      };

      const pairs = [];
      let truncated = false;
      let anyAssumed = false;
      const skip = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TITLE: 1, TEMPLATE: 1, HEAD: 1 };
      const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (pairs.length >= cap) {
          truncated = true;
          break;
        }
        try {
          const text = (node.nodeValue || '').replace(/\s+/g, ' ').trim();
          const el = node.parentElement;
          if (text && el && !skip[el.tagName]) {
            const s = getComputedStyle(el);
            const visible =
              s.display !== 'none' &&
              s.visibility !== 'hidden' &&
              parseFloat(s.opacity) > 0 &&
              el.getClientRects().length > 0;
            if (visible) {
              let bg = { r: 0, g: 0, b: 0, a: 0 };
              let n = el;
              while (n && n.nodeType === 1) {
                const ns = getComputedStyle(n);
                const c = toRgba(ns.backgroundColor);
                if (c && c.a > 0) {
                  const o = parseFloat(ns.opacity);
                  bg = over(bg, { r: c.r, g: c.g, b: c.b, a: c.a * (Number.isNaN(o) ? 1 : o) });
                  if (bg.a >= 0.999) break;
                }
                n = n.parentElement;
              }
              let assumed = false;
              if (bg.a < 0.999) {
                bg = over(bg, { r: 255, g: 255, b: 255, a: 1 });
                assumed = true;
                anyAssumed = true;
              }
              const fgRaw = toRgba(s.color) || { r: 0, g: 0, b: 0, a: 1 };
              const fg = over(fgRaw, bg);
              const l1 = lum(fg);
              const l2 = lum(bg);
              const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
              const fontSize = parseFloat(s.fontSize) || 16;
              const weight = parseInt(s.fontWeight, 10) || 400;
              const required = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700) ? 3 : 4.5;
              const rounded = Math.round(ratio * 100) / 100;
              pairs.push({
                selector: sel(el),
                text: text.slice(0, 60),
                fg: hex(fg),
                bg: hex(bg),
                ratio: rounded,
                fontSize: Math.round(fontSize * 10) / 10,
                weight,
                required,
                pass: rounded >= required,
                bgAssumed: assumed,
              });
            }
          }
        } catch (e) {
          /* one unreadable node never stops the sweep */
        }
        node = walker.nextNode();
      }
      return { pairs, truncated, bgAssumed: anyAssumed };
    }, config.maxPairs)
    .catch(() => ({ pairs: [], truncated: false, bgAssumed: false, error: 'evaluate failed' }));

  const pairs = data.pairs || [];
  const failing = pairs.filter((p) => !p.pass);
  let viewport = null;
  try {
    viewport =
      page.viewportSize() ||
      (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  } catch (e) {
    /* a page that closed under us has no viewport; the restore below still runs */
  }
  await restore();
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    bgAssumed: !!data.bgAssumed,
    truncated: !!data.truncated,
    pairs,
    failing,
    counts: { pairs: pairs.length, failing: failing.length },
    ...(data.error ? { error: data.error } : {}),
  };
}
