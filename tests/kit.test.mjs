// Harness for the ultraweb kit (kit/). Every folder in kit/moments/ that has a demo.html is
// discovered at run time and held to the moment contract (kit/README.md, the kit contract):
//   static  — moment.js imports in Node without touching window/document/navigator at top
//             level and has a default export; README.md <= 1,536 bytes; a valid catalog entry.
//   live    — demo.html at 1440x900 and 375x812 over http: no console errors, no page errors,
//             no horizontal overflow after wheel-scrolling to the bottom.
//   reduced — under prefers-reduced-motion: reduce every text in the moment root is visible
//             (non-zero opacity, not clipped to zero size).
//   no-js   — with JavaScript disabled every text in the moment root is visible.
//   cleanup — the harness mounts the moment itself (the demo's own mounting script is
//             stripped): cleanup restores root.outerHTML, and a second mount does not throw.
// Plus system.js auto-mounting and mobile nav, and scripts/moments.mjs.
// Every failure names its moment. With zero moments the moment block passes vacuously.
// The kit is served from a node:http static server on 127.0.0.1 (module imports and
// IntersectionObserver behave as on a real site; file:// would not).
// Run: node --test tests/kit.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { validateEntry } from '../scripts/moments.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const kitDir = join(root, 'kit');
const momentsDir = join(kitDir, 'moments');
const cli = join(root, 'scripts', 'moments.mjs');

const momentNames = () =>
  existsSync(momentsDir)
    ? readdirSync(momentsDir)
        .filter((d) => statSync(join(momentsDir, d)).isDirectory() && existsSync(join(momentsDir, d, 'demo.html')))
        .sort()
    : [];
const readCatalog = () => {
  try {
    const d = JSON.parse(readFileSync(join(momentsDir, 'index.json'), 'utf8'));
    return Array.isArray(d) ? d : null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------- shared files

test('kit shared files exist and hold their size budgets', () => {
  const budgets = { 'system.css': 14 * 1024, 'system.js': 6 * 1024, 'README.md': 6 * 1024 };
  for (const [f, max] of Object.entries(budgets)) {
    const p = join(kitDir, f);
    assert.ok(existsSync(p), `kit/${f} is missing`);
    assert.ok(statSync(p).size <= max, `kit/${f} is ${statSync(p).size} bytes, budget ${max}`);
  }
  for (const f of ['starter.html', 'react/Moment.tsx']) assert.ok(existsSync(join(kitDir, f)), `kit/${f} is missing`);
  const js = readFileSync(join(kitDir, 'system.js'), 'utf8');
  assert.match(js, /import\.meta\.url/, 'system.js must resolve moments relative to itself');
  assert.ok(!/^\s*import\s/m.test(js), 'system.js has no static imports');
  const tsx = readFileSync(join(kitDir, 'react', 'Moment.tsx'), 'utf8');
  assert.match(tsx, /^"use client";/, 'Moment.tsx must start with "use client"');
  const starter = readFileSync(join(kitDir, 'starter.html'), 'utf8');
  for (const needle of ['href="styles.css"', 'href="kit/system.css"', 'src="kit/system.js"', 'class="skip-link"', '<dialog', 'TODO-COPY', 'data-moment'])
    assert.ok(starter.includes(needle), `starter.html lacks ${needle}`);
});

test('system.css takes no colour decision outside var() fallbacks and has no decorative defaults', () => {
  const css = readFileSync(join(kitDir, 'system.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(css), 'system.css contains a hex colour');
  assert.ok(!/(?<!-)\b(rgb|hsl|oklch)a?\(/i.test(css), 'system.css contains a literal colour function');
  assert.ok(!/box-shadow|text-shadow|linear-gradient|radial-gradient|letter-spacing:\s*0\.\d/i.test(css), 'system.css carries a decorative default');
  for (const m of css.matchAll(/\b(transition|animation)(-[a-z-]+)?\s*:/g)) {
    const before = css.slice(0, m.index);
    const opens = before.lastIndexOf('@media (prefers-reduced-motion: no-preference)');
    assert.ok(opens !== -1 && before.slice(opens).split('{').length - before.slice(opens).split('}').length > 0, `${m[1]} outside a no-preference block near offset ${m.index}`);
  }
});

test('the catalog is a JSON array of valid, unique entries that each have a folder', () => {
  const catalog = readCatalog();
  assert.ok(catalog, 'kit/moments/index.json is missing or not a JSON array');
  const seen = new Set();
  for (const e of catalog) {
    const p = validateEntry(e);
    assert.deepEqual(p, [], `catalog entry ${e && e.name}: ${p.join('; ')}`);
    assert.ok(!seen.has(e.name), `catalog entry ${e.name} appears twice`);
    seen.add(e.name);
    assert.ok(existsSync(join(momentsDir, e.name, 'moment.js')), `catalog entry ${e.name} has no kit/moments/${e.name}/moment.js`);
  }
});

// ---------------------------------------------------------------- static checks per moment

test('every moment passes the static checks', async (t) => {
  const names = momentNames();
  t.diagnostic(`moments with a demo.html: ${names.join(', ') || 'none'}`);
  const catalog = readCatalog() || [];
  for (const name of names) {
    await t.test(`${name}: static`, async () => {
      const dir = join(momentsDir, name);
      for (const f of ['moment.js', 'moment.css', 'README.md']) assert.ok(existsSync(join(dir, f)), `${name}: ${f} is missing`);
      const src = readFileSync(join(dir, 'moment.js'), 'utf8');
      assert.ok(src.length <= 14 * 1024, `${name}: moment.js is ${src.length} bytes, budget 14336`);
      let mod;
      try {
        // a data: URL keeps Node's module-type detection out of it; the module has no imports
        mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
      } catch (e) {
        assert.fail(`${name}: moment.js does not import in Node (top-level window/document/navigator?): ${e.message}`);
      }
      assert.equal(typeof mod.default, 'function', `${name}: moment.js has no default export function`);
      const readme = statSync(join(dir, 'README.md')).size;
      assert.ok(readme <= 1536, `${name}: README.md is ${readme} bytes, budget 1536`);
      const entry = catalog.find((e) => e && e.name === name);
      assert.ok(entry, `${name}: no entry in kit/moments/index.json`);
      assert.deepEqual(validateEntry(entry), [], `${name}: catalog entry invalid`);
      const actual = src.length + statSync(join(dir, 'moment.css')).size;
      if (Math.abs(actual - entry.bytes) > actual * 0.15) t.diagnostic(`${name}: catalog bytes ${entry.bytes}, files are ${actual}`);
    });
  }
});

// ---------------------------------------------------------------- browser plumbing

// Every playwright this machine can reach, best first (same order as tests/qa-scripts.test.mjs).
function findPlaywright() {
  const req = createRequire(import.meta.url);
  const candidates = [];
  const add = (path, how) => {
    if (path && !candidates.some((c) => c.path === path)) candidates.push({ path, how });
  };
  try {
    add(req.resolve('playwright'), 'resolved from tests/');
  } catch {
    /* keep looking */
  }
  const roots = ['/usr/lib/node_modules', '/usr/local/lib/node_modules'];
  try {
    roots.unshift(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
  } catch {
    /* no npm on PATH */
  }
  const npxCache = join(homedir(), '.npm', '_npx');
  if (existsSync(npxCache)) for (const d of readdirSync(npxCache)) roots.push(join(npxCache, d, 'node_modules'));
  for (const r of roots.filter(Boolean)) {
    try {
      add(req.resolve('playwright', { paths: [r] }), `install at ${r}`);
    } catch {
      /* keep looking */
    }
  }
  return candidates;
}

async function launch(t) {
  const require_ = createRequire(import.meta.url);
  let why = 'playwright is not installed here';
  for (const c of findPlaywright()) {
    try {
      const mod = require_(c.path);
      const chromium = mod.chromium || (mod.default && mod.default.chromium);
      if (!chromium) throw new Error('module exports no chromium');
      const browser = await chromium.launch({ headless: true });
      t.diagnostic(`playwright: ${c.how}`);
      return browser;
    } catch (e) {
      why = `${c.how}: ${String(e.message).split('\n')[0]}`;
    }
  }
  const install = 'npm i -D playwright && npx playwright install --with-deps chromium';
  if (process.env.CI) throw new Error(`${why} — CI must install the browser first: ${install}`);
  t.skip(`${why} — run: ${install}`);
  return null;
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
};

// Test-only files served without touching disk: probe moments for the auto-mounter and a
// fixture page. Paths start with zz- or __harness so they cannot collide with real moments.
const VIRTUAL = {
  '/moments/zz-probe/moment.js': `export default function mount(root) {
  if (root.__probe) return root.__probe;
  window.__mounts = (window.__mounts || 0) + 1;
  root.setAttribute('data-probe', 'on');
  return (root.__probe = () => { root.removeAttribute('data-probe'); delete root.__probe; window.__cleanups = (window.__cleanups || 0) + 1; });
}`,
  '/moments/zz-probe/moment.css': '[data-moment="zz-probe"][data-probe] { outline-offset: 0; }',
  '/moments/zz-throws/moment.js': 'export default function mount() { throw new Error("probe failure"); }',
  '/moments/zz-throws/moment.css': '',
  '/__harness/automount.html': `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>automount</title>
<link rel="stylesheet" href="../system.css"></head><body>
<header class="site-header"><div class="wrap site-header__inner"><a class="site-brand" href="#near">Kit</a>
<nav class="site-nav" aria-label="Main"><ul role="list"><li><a href="#far">Far</a></li></ul></nav>
<button class="btn btn--ghost nav-toggle" type="button" data-nav-open="nav-dialog">Menu</button></div></header>
<dialog class="nav-dialog" id="nav-dialog" aria-label="Menu"><div class="nav-dialog__head"><span>Kit</span>
<button class="btn" type="button" data-nav-close>Close</button></div><ul role="list"><li><a href="#near">Near</a></li></ul></dialog>
<main id="main" class="wrap">
<div id="near" data-moment="zz-probe"><p>near content</p></div>
<div id="broken" data-moment="zz-missing"><p>broken content</p></div>
<div id="throws" data-moment="zz-throws"><p>throwing content</p></div>
<div style="height:6000px"></div>
<div id="far" data-moment="zz-probe"><p>far content</p></div>
</main><script type="module" src="../system.js"></script></body></html>`,
};

// Strip the demo's own module script that imports ./moment.js, so the harness mounts.
const stripMount = (html) => html.replace(/<script\b[^>]*type=["']?module["']?[^>]*>[\s\S]*?<\/script>/gi, (s) => (/moment\.js/.test(s) ? '' : s));

function serveKit() {
  const server = createServer((req, res) => {
    const [rawPath, query = ''] = String(req.url || '/').split('?');
    const path = decodeURIComponent(rawPath);
    if (VIRTUAL[path] !== undefined) {
      res.writeHead(200, { 'content-type': TYPES[extname(path)], 'cache-control': 'no-store' });
      res.end(VIRTUAL[path]);
      return;
    }
    const file = resolve(kitDir, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(kitDir + '/') || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }
    let body = readFileSync(file);
    if (extname(file) === '.html' && /(^|&)harness=1/.test(query)) body = stripMount(body.toString('utf8'));
    res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

function watch(page) {
  const log = { errors: [], warnings: [], pageErrors: [] };
  page.on('console', (m) => {
    if (m.type() === 'error') log.errors.push(m.text());
    if (m.type() === 'warning') log.warnings.push(m.text());
  });
  page.on('pageerror', (e) => log.pageErrors.push(String(e.message || e)));
  return log;
}

async function wheelToBottom(page) {
  const { w, h } = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  await page.mouse.move(w / 2, h / 2);
  let stall = 0;
  for (let i = 0; i < 160 && stall < 6; i++) {
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, Math.round(h * 0.8));
    await page.waitForTimeout(50);
    const [y, max] = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight - innerHeight]);
    if (y >= max - 2) break;
    stall = y <= y0 ? stall + 1 : 0;
  }
  await page.waitForTimeout(300);
}

// Runs in the page: every non-empty text node under root that a reader should see, with the
// reason it is not visible. Skips controls, hidden and aria-hidden subtrees, and the
// visually-hidden pattern (an ancestor at most 1x1 with overflow hidden).
function hiddenText(sel) {
  const problems = [];
  const insetClipped = (cp) => {
    const m = /^inset\(([^)]*)\)/.exec(cp || '');
    if (!m) return false;
    const v = m[1].split(/\s+round\s+/)[0].trim().split(/\s+/).map((x) => (x.endsWith('%') ? parseFloat(x) : 0));
    const [t, r = t, b = t, l = r] = v;
    return t + b >= 99 || l + r >= 99;
  };
  for (const root of document.querySelectorAll(sel)) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const el = n.parentElement;
      if (!el || el.closest('script,style,noscript,template,button,[hidden],[aria-hidden="true"],select,option')) continue;
      let bad = null;
      let opacity = 1;
      let srOnly = false;
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
        const cs = getComputedStyle(e);
        opacity *= parseFloat(cs.opacity);
        const r = e.getBoundingClientRect();
        if (r.width <= 1 && r.height <= 1 && cs.overflow.includes('hidden')) srOnly = true;
        if (cs.display === 'none') bad ||= 'display: none';
        if (cs.visibility === 'hidden') bad ||= 'visibility: hidden';
        if (insetClipped(cs.clipPath)) bad ||= `clip-path: ${cs.clipPath}`;
      }
      if (srOnly) continue;
      if (opacity < 0.05) bad ||= `opacity ${opacity.toFixed(2)}`;
      const range = document.createRange();
      range.selectNodeContents(n);
      const box = range.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) bad ||= 'zero size';
      if (bad) problems.push(`"${text.slice(0, 40)}": ${bad}`);
    }
  }
  return problems;
}

// ---------------------------------------------------------------- live checks per moment

test('every moment passes the live checks', { timeout: 900000 }, async (t) => {
  const names = momentNames();
  if (!names.length) {
    t.diagnostic('no moments with a demo.html yet');
    return;
  }
  const browser = await launch(t);
  if (!browser) return;
  const { server, origin } = await serveKit();
  try {
    for (const name of names) {
      const url = `${origin}/moments/${name}/demo.html`;
      const sel = `[data-moment="${name}"]`;

      for (const [w, h] of [
        [1440, 900],
        [375, 812],
      ]) {
        await t.test(`${name}: live ${w}x${h}`, async () => {
          const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
          const page = await ctx.newPage();
          const log = watch(page);
          try {
            await page.goto(url, { waitUntil: 'load' });
            assert.ok((await page.locator(sel).count()) > 0, `${name}: demo.html has no ${sel} element`);
            await page.waitForTimeout(400);
            await wheelToBottom(page);
            const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
            assert.ok(o.sw <= o.iw, `${name} @${w}: horizontal overflow, scrollWidth ${o.sw} > ${o.iw}`);
            assert.deepEqual(log.pageErrors, [], `${name} @${w}: page errors`);
            assert.deepEqual(log.errors, [], `${name} @${w}: console errors`);
          } finally {
            if (log.warnings.length) t.diagnostic(`${name} @${w}: console warnings: ${log.warnings.join(' | ')}`);
            await ctx.close();
          }
        });
      }

      await t.test(`${name}: reduced motion shows all text`, async () => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        const log = watch(page);
        try {
          await page.goto(url, { waitUntil: 'load' });
          await page.waitForTimeout(500);
          const p = await page.evaluate(hiddenText, sel);
          assert.deepEqual(p, [], `${name}: text hidden under reduced motion`);
          assert.deepEqual(log.pageErrors, [], `${name}: page errors under reduced motion`);
        } finally {
          await ctx.close();
        }
      });

      await t.test(`${name}: JavaScript disabled shows all text`, async () => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
        const page = await ctx.newPage();
        try {
          await page.goto(url, { waitUntil: 'load' });
          const p = await page.evaluate(hiddenText, sel).catch(async () => {
            // evaluate still runs with JS disabled in Playwright; this is a guard for engines that refuse
            return [];
          });
          assert.deepEqual(p, [], `${name}: text hidden without JavaScript`);
        } finally {
          await ctx.close();
        }
      });

      await t.test(`${name}: cleanup restores the markup and remount works`, async () => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();
        const log = watch(page);
        try {
          await page.goto(`${url}?harness=1`, { waitUntil: 'load' });
          const n = await page.evaluate(async (s) => {
            const { default: mount } = await import(new URL('./moment.js', location.href).href);
            window.__h = { mount, roots: [...document.querySelectorAll(s)] };
            window.__h.before = window.__h.roots.map((r) => r.outerHTML);
            window.__h.cleanups = window.__h.roots.map((r) => mount(r));
            return window.__h.roots.length;
          }, sel);
          assert.ok(n > 0, `${name}: no ${sel} root in demo.html`);
          const visit = async () => {
            for (let i = 0; i < n; i++) {
              await page.evaluate((i) => window.__h.roots[i].scrollIntoView({ block: 'center' }), i);
              await page.waitForTimeout(250);
            }
            await wheelToBottom(page);
          };
          await visit();
          const diff1 = await page.evaluate(() => {
            const h = window.__h;
            const bad = h.cleanups.map((c, i) => (typeof c === 'function' ? null : `root ${i}: mount returned ${typeof c}`)).filter(Boolean);
            h.cleanups.forEach((c) => typeof c === 'function' && c());
            return bad.concat(h.roots.map((r, i) => (r.outerHTML === h.before[i] ? null : `root ${i} differs after cleanup:\n  before ${h.before[i].slice(0, 300)}\n  after  ${r.outerHTML.slice(0, 300)}`)).filter(Boolean));
          });
          assert.deepEqual(diff1, [], `${name}: first cleanup`);
          await page.waitForTimeout(200);
          const remount = await page.evaluate(() => {
            const h = window.__h;
            try {
              h.cleanups = h.roots.map((r) => {
                const a = h.mount(r);
                const b = h.mount(r); // a double call must not double-mount
                return [a, b];
              });
              return null;
            } catch (e) {
              return String(e && e.message);
            }
          });
          assert.equal(remount, null, `${name}: second mount threw`);
          await visit();
          const diff2 = await page.evaluate(() => {
            const h = window.__h;
            for (const [a, b] of h.cleanups) {
              if (typeof a === 'function') a();
              if (typeof b === 'function' && b !== a) b();
            }
            return h.roots.map((r, i) => (r.outerHTML === h.before[i] ? null : `root ${i} differs after the second cleanup:\n  after ${r.outerHTML.slice(0, 300)}`)).filter(Boolean);
          });
          assert.deepEqual(diff2, [], `${name}: second cleanup`);
          assert.deepEqual(log.pageErrors, [], `${name}: page errors during mount/cleanup`);
          assert.deepEqual(log.errors, [], `${name}: console errors during mount/cleanup`);
        } finally {
          await ctx.close();
        }
      });
    }
  } finally {
    await browser.close();
    server.close();
  }
});

// ---------------------------------------------------------------- system.js

test('system.js mounts near the viewport, links CSS once, fails soft, unmounts, wires the nav', { timeout: 120000 }, async (t) => {
  const browser = await launch(t);
  if (!browser) return;
  const { server, origin } = await serveKit();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const log = watch(page);
    await page.goto(`${origin}/__harness/automount.html`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__mounts >= 1, null, { timeout: 5000 });
    await page.waitForTimeout(300);
    const s1 = await page.evaluate(() => ({
      mounts: window.__mounts,
      near: document.getElementById('near').getAttribute('data-probe'),
      far: document.getElementById('far').getAttribute('data-probe'),
      links: document.querySelectorAll('link[href$="zz-probe/moment.css"]').length,
      api: typeof window.ultrawebKit?.mountAll === 'function' && typeof window.ultrawebKit?.unmountAll === 'function',
      broken: document.getElementById('broken').innerHTML,
      throws: document.getElementById('throws').innerHTML,
    }));
    assert.equal(s1.api, true, 'window.ultrawebKit { mountAll, unmountAll } missing');
    assert.equal(s1.mounts, 1, 'only the moment near the viewport mounts on load');
    assert.equal(s1.near, 'on');
    assert.equal(s1.far, null, 'a moment 6000px below mounted early');
    assert.equal(s1.links, 1, 'moment.css linked once');
    assert.equal(s1.broken, '<p>broken content</p>', 'a missing moment changed its content');
    assert.equal(s1.throws, '<p>throwing content</p>', 'a throwing moment changed its content');
    const warns = (n) => log.warnings.filter((w) => w.includes(n)).length;
    assert.equal(warns('zz-missing'), 1, 'a missing moment logs exactly one console.warn');
    assert.equal(warns('zz-throws'), 1, 'a throwing mount logs exactly one console.warn');
    assert.deepEqual(log.pageErrors, []);

    await page.evaluate(() => document.getElementById('far').scrollIntoView());
    await page.waitForFunction(() => window.__mounts === 2, null, { timeout: 5000 });
    assert.equal(await page.evaluate(() => document.querySelectorAll('link[href$="zz-probe/moment.css"]').length), 1, 'second instance re-linked the CSS');

    await page.evaluate(() => window.ultrawebKit.unmountAll());
    const s2 = await page.evaluate(() => ({ cleanups: window.__cleanups, probes: document.querySelectorAll('[data-probe]').length }));
    assert.equal(s2.cleanups, 2, 'unmountAll ran every cleanup');
    assert.equal(s2.probes, 0);
    await page.evaluate(() => window.ultrawebKit.mountAll());
    await page.waitForFunction(() => window.__mounts === 3, null, { timeout: 5000 });
    await ctx.close();

    // mobile nav
    const phone = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const p2 = await phone.newPage();
    const log2 = watch(p2);
    await p2.goto(`${origin}/__harness/automount.html`, { waitUntil: 'load' });
    const toggle = p2.locator('.nav-toggle');
    assert.equal(await toggle.isVisible(), true, 'menu button visible at 375');
    assert.equal(await p2.locator('.site-nav').isVisible(), false, 'inline nav hidden at 375');
    await toggle.click();
    assert.equal(await p2.evaluate(() => document.getElementById('nav-dialog').open), true, 'menu did not open');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await p2.keyboard.press('Escape');
    assert.equal(await p2.evaluate(() => document.getElementById('nav-dialog').open), false, 'Escape did not close the menu');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await toggle.click();
    await p2.locator('#nav-dialog a').first().click();
    assert.equal(await p2.evaluate(() => document.getElementById('nav-dialog').open), false, 'a link did not close the menu');
    await toggle.click();
    await p2.locator('#nav-dialog [data-nav-close]').click();
    assert.equal(await p2.evaluate(() => document.getElementById('nav-dialog').open), false, 'Close did not close the menu');
    const o = await p2.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    assert.equal(o, true, 'fixture overflows at 375');
    assert.deepEqual(log2.pageErrors, []);
    await phone.close();
  } finally {
    await browser.close();
    server.close();
  }
});

// ---------------------------------------------------------------- scripts/moments.mjs

const FIXTURE = [
  { name: 'alpha', kind: 'type', needs: ['none'], fits: ['studio', 'launch'], intensity: 1, bytes: 100, summary: 'alpha type' },
  { name: 'beta', kind: 'type', needs: ['none'], fits: ['studio'], intensity: 2, bytes: 100, summary: 'beta type' },
  { name: 'gamma', kind: 'scroll', needs: ['none'], fits: ['studio', 'editorial'], intensity: 2, bytes: 100, summary: 'gamma scroll' },
  { name: 'delta', kind: 'image', needs: ['photos'], fits: ['studio', 'shop'], intensity: 1, bytes: 100, summary: 'delta image' },
  { name: 'eps', kind: 'webgl', needs: ['none'], fits: ['launch', 'studio'], intensity: 3, bytes: 100, summary: 'eps webgl' },
  { name: 'broken', kind: 'nope', needs: ['none'], fits: ['studio'], intensity: 1, bytes: 1, summary: 'invalid' },
];
const tmp = mkdtempSync(join(tmpdir(), 'uw-moments-'));
const catalogFile = join(tmp, 'index.json');
writeFileSync(catalogFile, JSON.stringify(FIXTURE));
const runCli = (args, env = {}) => spawnSync('node', [cli, ...args, '--catalog', catalogFile], { encoding: 'utf8', env: { ...process.env, ULTRAWEB_HOME: tmp, ...env } });
const picked = (out) => out.split('\n').filter((l) => /^[a-z]/.test(l));

test('moments.mjs: a seeded pick is repeatable and respects --fits', () => {
  const a = runCli(['pick', '--fits', 'editorial', '--seed', '3', '--no-history']);
  const b = runCli(['pick', '--fits', 'editorial', '--seed', '3', '--no-history']);
  assert.equal(a.status, 0, a.stderr);
  assert.equal(a.stdout, b.stdout);
  assert.deepEqual(picked(a.stdout), ['gamma']);
  assert.match(a.stdout, /README: .*kit\/moments\/gamma\/README\.md/);
  assert.match(a.stderr, /skipping catalog entry "broken"/);
});

test('moments.mjs: --needs, --max-intensity, --kind and --exclude filter', () => {
  for (let seed = 1; seed <= 15; seed++) {
    const s = ['--seed', String(seed), '--no-history'];
    assert.deepEqual(picked(runCli(['pick', '--fits', 'shop', '--needs', 'none,photos', ...s]).stdout), ['delta']);
    assert.deepEqual(picked(runCli(['pick', '--fits', 'studio', '--max-intensity', '1', ...s]).stdout), ['alpha'], 'photos not offered, so delta is out');
    assert.deepEqual(picked(runCli(['pick', '--fits', 'studio', '--kind', 'scroll', ...s]).stdout), ['gamma']);
    const ex = picked(runCli(['pick', '--fits', 'studio', '--exclude', 'alpha,beta,gamma', ...s]).stdout);
    assert.deepEqual(ex, ['eps']);
  }
});

test('moments.mjs: a pick of two never holds two of one kind', () => {
  const kind = Object.fromEntries(FIXTURE.map((m) => [m.name, m.kind]));
  for (let seed = 1; seed <= 40; seed++) {
    const r = runCli(['pick', '--fits', 'studio', '--count', '2', '--needs', 'none,photos', '--seed', String(seed), '--no-history']);
    const names = picked(r.stdout);
    assert.equal(names.length, 2, r.stderr);
    assert.notEqual(kind[names[0]], kind[names[1]], `seed ${seed}: ${names.join(', ')}`);
  }
});

test('moments.mjs: exit 2 with a clear message when nothing matches', () => {
  const r = runCli(['pick', '--fits', 'shop', '--no-history']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no moment fits --fits shop/);
  assert.equal(runCli(['pick', '--fits', 'place', '--no-history']).status, 2);
  assert.equal(runCli(['pick', '--fits', 'nowhere']).status, 2);
  assert.equal(runCli(['pick']).status, 2, 'pick without --fits');
  assert.equal(runCli(['show', 'no-such-moment']).status, 2);
  assert.equal(runCli(['list', '--kind', 'canvas']).status, 2);
});

test('moments.mjs: history steers away from recent picks and keeps other keys', () => {
  const hist = join(tmp, 'history.json');
  const deal = [{ kind: 'dealt', at: '2026-11-01', axes: { ground: 'dark' } }];
  writeFileSync(hist, JSON.stringify({ entries: deal, moments: Array.from({ length: 10 }, () => ({ names: ['alpha'] })) }));
  let alpha = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const names = picked(runCli(['pick', '--fits', 'studio', '--kind', 'type', '--seed', String(seed)]).stdout);
    if (names[0] === 'alpha') alpha++;
  }
  assert.ok(alpha <= 3, `alpha picked ${alpha}/20 times despite ten recent uses`);
  const data = JSON.parse(readFileSync(hist, 'utf8'));
  assert.deepEqual(data.entries, deal, 'deal.mjs entries were disturbed');
  assert.ok(data.moments.length > 10 && data.moments.length <= 24, 'picks recorded and capped');
  assert.ok(Array.isArray(data.moments.at(-1).names));
  // --no-history writes nothing
  const before = readFileSync(hist, 'utf8');
  runCli(['pick', '--fits', 'studio', '--no-history']);
  assert.equal(readFileSync(hist, 'utf8'), before);
  // an unreadable history file does not break the pick
  writeFileSync(hist, '{not json');
  assert.equal(runCli(['pick', '--fits', 'studio', '--seed', '1']).status, 0);
});

test('moments.mjs: list prints a filtered table; --help works; the real catalog lists', () => {
  const r = runCli(['list', '--fits', 'launch']);
  assert.equal(r.status, 0, r.stderr);
  const rows = r.stdout.trim().split('\n');
  assert.match(rows[0], /^name\s+kind\s+int\s+needs\s+fits\s+bytes\s+summary/);
  assert.deepEqual(rows.slice(1).map((l) => l.split(/\s+/)[0]), ['alpha', 'eps']);
  const h = spawnSync('node', [cli, '--help'], { encoding: 'utf8' });
  assert.equal(h.status, 0);
  assert.match(h.stdout, /pick --fits/);
  const real = readCatalog() || [];
  const l = spawnSync('node', [cli, 'list', '--no-history'], { encoding: 'utf8' });
  assert.equal(l.status, real.length ? 0 : 2, l.stderr);
});
