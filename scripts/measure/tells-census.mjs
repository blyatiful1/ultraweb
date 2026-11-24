// tells-census.mjs — a census of the patterns that read as AI-default design, counted per page.
// Report-only: it never fails a run. The judge and design/DIRECTION.md decide whether a pattern is
// argued from the brief or a reflex. Run it on a freshly loaded page BEFORE scrolling, so sections
// that fade or translate in on scroll are still in their hidden state.
// Counts: uppercase + letter-spaced small labels directly above a heading (eyebrows), 01/02/03-style
// numeric markers, links and buttons whose text ends in an arrow glyph, middle-dot-joined meta
// strings, em-dash density in visible text, monospace type used for small labels, the computed
// display and body font families (flagged when one is a reflex choice), the ground lightness plus
// the number of distinct saturated accent hues, and below-the-fold sections hidden until scroll.
// Config keys read: reflexFamilies (array of family names; default Inter, Geist, Space Grotesk,
//                   Fraunces, Instrument Serif, Playfair Display, DM Sans, Manrope, Poppins), theme.
// Returns: { url, viewport, theme,
//            counts:{eyebrows,numberedMarkers,arrowLinks,middleDotMeta,emDashes,emDashPer1000Words,
//                    words,monoLabels,belowFoldSections,revealSections},
//            families:{display,body,displayStack,bodyStack,loaded:[name]},
//            ground:{background,lightness,warm,hues:[{hue,count}],distinctAccentHues},
//            flags:[{id,evidence}], samples:{eyebrows,numberedMarkers,arrowLinks,middleDotMeta,monoLabels},
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: nothing. Every flag is status review; the run never fails.
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
  const reflex = Array.isArray(config.reflexFamilies) && config.reflexFamilies.length
    ? config.reflexFamilies
    : ['Inter', 'Geist', 'Space Grotesk', 'Fraunces', 'Instrument Serif', 'Playfair Display', 'DM Sans', 'Manrope', 'Poppins'];

  const data = await page
    .evaluate((reflexList) => {
      const clip = (v, n) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, n);
      const px = (v) => parseFloat(v) || 0;
      const rendered = (el) => {
        try {
          const s = getComputedStyle(el);
          return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
        } catch (e) {
          return false;
        }
      };
      const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|HEAD|TITLE|SVG|CODE|PRE)$/;
      const all = Array.prototype.filter.call(document.body ? document.body.querySelectorAll('*') : [], (el) => !SKIP.test(el.tagName) && rendered(el));
      const own = (el) =>
        clip(
          Array.prototype.filter.call(el.childNodes, (n) => n.nodeType === 3).map((n) => n.nodeValue).join(' '),
          200
        );
      const fullText = (el) => clip(el.textContent, 200);
      const isHeading = (el) => !!el && /^H[1-6]$/.test(el.tagName);
      const samples = { eyebrows: [], numberedMarkers: [], arrowLinks: [], middleDotMeta: [], monoLabels: [] };
      const keep = (k, v) => {
        if (samples[k].length < 6) samples[k].push(v);
      };

      // ---- eyebrows: uppercase, tracked, small, directly above a heading
      let eyebrows = 0;
      for (const el of all) {
        if (isHeading(el)) continue;
        const t = own(el) || (el.children.length === 0 ? fullText(el) : '');
        if (!t || t.length > 48 || t.length < 3) continue;
        const s = getComputedStyle(el);
        const fs = px(s.fontSize) || 16;
        const upper = s.textTransform === 'uppercase' || (t === t.toUpperCase() && /[A-Z]{3}/.test(t));
        const tracked = px(s.letterSpacing) / fs >= 0.05;
        if (!(upper && tracked && fs <= 15)) continue;
        const next = el.nextElementSibling || (el.parentElement && el.parentElement.nextElementSibling);
        if (isHeading(el.nextElementSibling) || (el.children.length === 0 && el.parentElement && isHeading(el.parentElement.nextElementSibling) && !el.nextElementSibling)) {
          eyebrows++;
          keep('eyebrows', t);
        } else if (next && isHeading(next) && el.parentElement && el.parentElement.children.length <= 2) {
          eyebrows++;
          keep('eyebrows', t);
        }
      }

      // ---- numeric markers: 01 / 02 / (03) / 01 / 04
      let numberedMarkers = 0;
      const NUM = /^\(?0?\d{1,2}\)?(\s*[\/.\-–]\s*0?\d{1,2})?[.)]?$/;
      for (const el of all) {
        if (el.children.length) continue;
        const t = fullText(el);
        if (t.length > 8 || !NUM.test(t) || !/^\(?0\d|^\d{1,2}\s*[\/]\s*\d/.test(t)) continue;
        numberedMarkers++;
        keep('numberedMarkers', t);
      }

      // ---- arrow-suffixed links and buttons
      let arrowLinks = 0;
      const ARROW = /(→|↗|↘|➜|➔|➝|⟶|⇢|»|›|->|=>)\s*$/;
      for (const el of document.querySelectorAll('a[href], button, [role="button"], [role="link"]')) {
        if (!rendered(el)) continue;
        const t = fullText(el);
        if (t.length < 2 || t.length > 80 || !ARROW.test(t)) continue;
        arrowLinks++;
        keep('arrowLinks', t);
      }

      // ---- middle-dot-joined meta strings
      let middleDotMeta = 0;
      for (const el of all) {
        if (el.children.length > 6) continue;
        const t = own(el) || (el.children.length === 0 ? fullText(el) : '');
        if (!t || t.length > 140) continue;
        if ((t.match(/\s[·•∙]\s/g) || []).length >= 1 && /\S\s[·•∙]\s\S/.test(t)) {
          middleDotMeta++;
          keep('middleDotMeta', t);
        }
      }

      // ---- em-dash density in visible text
      const bodyText = clip(document.body ? document.body.innerText : '', 200000);
      const words = (bodyText.match(/\S+/g) || []).length;
      const emDashes = (bodyText.match(/—/g) || []).length;
      const emDashPer1000Words = words ? Math.round((emDashes / words) * 10000) / 10 : 0;

      // ---- monospace for small labels
      const MONO = /(^|,)\s*["']?(ui-monospace|monospace|sfmono-regular|sf mono|menlo|consolas|courier|courier new|jetbrains mono|ibm plex mono|fira code|fira mono|geist mono|space mono|roboto mono|dm mono|source code pro|[\w -]*mono)["']?\s*(,|$)/i;
      let monoLabels = 0;
      for (const el of all) {
        const t = own(el) || (el.children.length === 0 ? fullText(el) : '');
        if (!t || t.length > 40) continue;
        const s = getComputedStyle(el);
        if (px(s.fontSize) > 14.5) continue;
        const stack = s.fontFamily || '';
        const first = stack.split(',')[0] || '';
        if (MONO.test(first) || /(^|,)\s*monospace\s*(,|$)/i.test(stack.split(',').slice(0, 2).join(','))) {
          monoLabels++;
          keep('monoLabels', t);
        }
      }

      // ---- families
      const normFamily = (raw) => {
        let f = String(raw || '').split(',')[0].replace(/["']/g, '').trim();
        f = f.replace(/^__/, '').replace(/_Fallback.*$/i, '').replace(/_[a-f0-9]{5,}$/i, '').replace(/_/g, ' ');
        return f.trim();
      };
      const h = document.querySelector('h1') || document.querySelector('h2');
      const p = document.querySelector('main p, article p, p') || document.body;
      const displayStack = h ? getComputedStyle(h).fontFamily : '';
      const bodyStack = p ? getComputedStyle(p).fontFamily : '';
      const display = normFamily(displayStack);
      const body = normFamily(bodyStack);
      const loaded = [];
      try {
        document.fonts.forEach((f) => {
          if (f.status === 'loaded') {
            const n = normFamily(f.family);
            if (n && loaded.indexOf(n) === -1) loaded.push(n);
          }
        });
      } catch (e) {
        /* no FontFaceSet */
      }
      const lower = reflexList.map((x) => String(x).toLowerCase());
      const isReflex = (name) => lower.indexOf(String(name).toLowerCase()) !== -1;
      const SERIFS = /fraunces|instrument serif|playfair|cormorant|newsreader|dm serif|lora|source serif|eb garamond|georgia|times|libre baskerville|crimson|spectral/i;
      const isSerif = (stack, name) => SERIFS.test(name) || /(^|,)\s*serif\s*$/i.test(String(stack).trim());

      // ---- ground and accent hues
      const rgb = (str) => {
        const m = String(str || '').match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const n = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
        return n.length >= 3 ? { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 } : null;
      };
      const hsl = (c) => {
        const r = c.r / 255, g = c.g / 255, b = c.b / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        const d = max - min;
        let hue = 0, s = 0;
        if (d > 0) {
          s = d / (1 - Math.abs(2 * l - 1));
          if (max === r) hue = ((g - b) / d) % 6;
          else if (max === g) hue = (b - r) / d + 2;
          else hue = (r - g) / d + 4;
          hue = (hue * 60 + 360) % 360;
        }
        return { h: hue, s, l };
      };
      let ground = null;
      for (const el of [document.body, document.documentElement]) {
        const c = el ? rgb(getComputedStyle(el).backgroundColor) : null;
        if (c && c.a > 0.5) {
          ground = c;
          break;
        }
      }
      if (!ground) ground = { r: 255, g: 255, b: 255, a: 1 };
      const gh = hsl(ground);
      const warm = gh.s >= 0.08 && gh.s <= 0.6 && gh.h >= 20 && gh.h <= 60 && ground.r - ground.b >= 8;
      const buckets = new Map();
      const add = (c) => {
        if (!c || c.a < 0.5) return;
        const k = hsl(c);
        if (k.s < 0.45 || k.l < 0.2 || k.l > 0.85) return;
        const b = Math.round(k.h / 30) % 12;
        buckets.set(b, (buckets.get(b) || 0) + 1);
      };
      let seen = 0;
      for (const el of all) {
        if (seen++ > 1500) break;
        const s = getComputedStyle(el);
        add(rgb(s.backgroundColor));
        if (el.tagName === 'A' || el.tagName === 'BUTTON' || /^H[1-6]$/.test(el.tagName) || el.children.length === 0) add(rgb(s.color));
        if (px(s.borderTopWidth) > 0) add(rgb(s.borderTopColor));
      }
      const hues = Array.from(buckets.entries())
        .filter((e) => e[1] >= 2)
        .map((e) => ({ hue: e[0] * 30, count: e[1] }))
        .sort((a, b) => b.count - a.count);

      // ---- reveal-on-scroll sections: below the fold and still faded or shifted
      const main = document.querySelector('main, [role="main"]') || document.body;
      let scope = main;
      for (let i = 0; i < 3; i++) {
        const k = Array.prototype.filter.call(scope.children, (c) => !SKIP.test(c.tagName) && rendered(c));
        if (k.length !== 1) break;
        scope = k[0];
      }
      const vh = window.innerHeight;
      const secs = Array.prototype.filter.call(scope.children, (c) => !SKIP.test(c.tagName) && rendered(c) && c.getBoundingClientRect().height >= 40);
      const below = secs.filter((c) => c.getBoundingClientRect().top > vh * 0.9);
      let revealSections = 0;
      for (const c of below) {
        const probes = [c].concat(Array.prototype.slice.call(c.children, 0, 3));
        const hidden = probes.some((n) => {
          const s = getComputedStyle(n);
          const tf = s.transform;
          const moved = tf && tf !== 'none' && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(tf);
          return parseFloat(s.opacity) < 0.99 || moved;
        });
        if (hidden) revealSections++;
      }

      // ---- flags
      const flags = [];
      if (eyebrows >= 2) flags.push({ id: 'eyebrow-labels', evidence: eyebrows + ' uppercase letter-spaced labels above headings: ' + samples.eyebrows.slice(0, 3).join(' | ') });
      if (numberedMarkers >= 3) flags.push({ id: 'numbered-markers', evidence: numberedMarkers + ' 01/02/03-style markers: ' + samples.numberedMarkers.slice(0, 4).join(' | ') });
      if (arrowLinks >= 3) flags.push({ id: 'arrow-links', evidence: arrowLinks + ' links or buttons ending in an arrow glyph: ' + samples.arrowLinks.slice(0, 3).join(' | ') });
      if (middleDotMeta >= 2) flags.push({ id: 'middle-dot-meta', evidence: middleDotMeta + ' middle-dot-joined meta strings: ' + samples.middleDotMeta.slice(0, 2).join(' | ') });
      if (emDashes >= 5 && emDashPer1000Words >= 4) flags.push({ id: 'em-dash-density', evidence: emDashes + ' em dashes in ' + words + ' words (' + emDashPer1000Words + ' per 1000)' });
      if (monoLabels >= 3) flags.push({ id: 'mono-labels', evidence: monoLabels + ' small labels set in monospace: ' + samples.monoLabels.slice(0, 3).join(' | ') });
      if (isReflex(display)) flags.push({ id: 'reflex-display-family', evidence: 'display family "' + display + '" is on the reflex list' });
      if (isReflex(body)) flags.push({ id: 'reflex-body-family', evidence: 'body family "' + body + '" is on the reflex list' });
      const accentHue = hues.length ? hues[0].hue : null;
      if (gh.l < 0.12 && hues.length <= 1) flags.push({ id: 'near-black-single-accent', evidence: 'ground lightness ' + Math.round(gh.l * 100) + '% with ' + hues.length + ' saturated accent hue' + (hues.length === 1 ? ' (' + hues[0].hue + ' deg)' : 's') });
      if (warm && gh.l > 0.85 && isSerif(displayStack, display) && accentHue !== null && (accentHue <= 45 || accentHue >= 345)) {
        flags.push({ id: 'cream-serif-warm-accent', evidence: 'warm light ground, serif display "' + display + '", warm accent ' + accentHue + ' deg' });
      }
      if (below.length >= 3 && revealSections >= Math.ceil(below.length * 0.6)) {
        flags.push({ id: 'reveal-on-scroll-everywhere', evidence: revealSections + ' of ' + below.length + ' below-the-fold sections start faded or shifted' });
      }

      return {
        counts: { eyebrows, numberedMarkers, arrowLinks, middleDotMeta, emDashes, emDashPer1000Words, words, monoLabels, belowFoldSections: below.length, revealSections },
        families: { display, body, displayStack: clip(displayStack, 160), bodyStack: clip(bodyStack, 160), loaded: loaded.slice(0, 12) },
        ground: {
          background: 'rgb(' + Math.round(ground.r) + ', ' + Math.round(ground.g) + ', ' + Math.round(ground.b) + ')',
          lightness: Math.round(gh.l * 100) / 100,
          warm,
          hues: hues.slice(0, 6),
          distinctAccentHues: hues.length,
        },
        flags,
        samples,
      };
    }, reflex)
    .catch((e) => ({
      counts: {},
      families: {},
      ground: {},
      flags: [],
      samples: {},
      error: 'evaluate failed: ' + String((e && e.message) || e).slice(0, 160),
    }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return { url: page.url(), viewport, theme: config.theme || null, ...data };
}
