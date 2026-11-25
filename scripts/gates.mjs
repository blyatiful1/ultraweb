#!/usr/bin/env node
// gates.mjs — the single, Node-runnable gate runner for ultraweb v2.
// Drives a real browser (Playwright, resolved from the project, then the plugin, then globally)
// against a running site, runs the measurement library in scripts/measure/*.mjs per route and
// viewport, applies each script's documented "The gate asserts:" rule, and writes qa/gates.json,
// qa/GATES.md, qa/shots/*.png and qa/raw/*.json. Zero npm dependencies of its own.
// Exit codes: 0 PASS, 1 FAIL, 3 UNVERIFIED or cannot run.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- every threshold in one place ------------------------------------------------------
export const THRESHOLDS = {
  targetMinPx: 24, // WCAG 2.2 target size (minimum), run at the desktop viewport
  targetMinMobilePx: 44, // house floor at 375 px
  contrastNormal: 4.5,
  contrastLarge: 3,
  jsBudgetKB: 140, // cold-load JS transfer, marketing-site default; override with --js-budget
  fontBudgetKB: 300, // total font transfer on a cold load
  clsMax: 0.05,
  lcpMaxMs: 2500, // observed on the local production server
  viewports: [375, 768, 1440],
  quickViewports: [375, 1440],
  maxRoutes: 25,
  maxWaivers: 5,
  escalateRound: 4,
  navTimeoutMs: 30000,
};

const GATES = ['code', 'content', 'a11y', 'responsive', 'perf', 'tells'];
const HELP = `ultraweb gates: measure a running site and write qa/gates.json

Usage:
  node <plugin>/scripts/gates.mjs --url <base-url> [--routes /,/pricing] [--project <dir>]
       [--out <dir>] [--only code,content,a11y,responsive,perf,tells] [--quick]
       [--js-budget <kB>] [--lighthouse] [--done "<reason>"]

Options:
  --url <base-url>    the running production server, e.g. http://localhost:3100 (required)
  --routes a,b        routes to check; else qa/routes.txt (one per line); else crawl same-origin
                      links from / (cap ${THRESHOLDS.maxRoutes})
  --project <dir>     project root (default: current directory)
  --out <dir>         output directory (default: <project>/qa)
  --only <gates>      comma list from: ${GATES.join(', ')}
  --quick             homepage only, 375 and 1440 px, light theme only
  --js-budget <kB>    cold-load JavaScript budget in kB (default ${THRESHOLDS.jsBudgetKB})
  --lighthouse        also run Lighthouse when it is installed (report-only)
  --done "<reason>"   write qa/gates-done.json so the Stop hook stands down; runs nothing
  --help              this text

Statuses: pass | fail | review | skip | error | waived. Verdict: FAIL when any unwaived fail,
UNVERIFIED when no browser or any error, else PASS. review items never fail the run.
Waivers: qa/waivers.json, at most ${THRESHOLDS.maxWaivers} entries {check, route?, selector?, reason}.
Exit: 0 PASS, 1 FAIL, 3 UNVERIFIED or cannot run. --quick runs are not counted as rounds and a
PASS clears the count; at ${THRESHOLDS.escalateRound} counted failing rounds in a row an ESCALATE: line is printed.
`;

// ---- args ------------------------------------------------------------------------------
function parseArgs(argv) {
  const a = { only: null, quick: false, lighthouse: false, help: false, jsBudget: null };
  const need = (i, name) => {
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error(`${name} needs a value`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--help' || t === '-h') a.help = true;
    else if (t === '--quick') a.quick = true;
    else if (t === '--lighthouse') a.lighthouse = true;
    else if (t === '--url') a.url = need(i++, t);
    else if (t === '--routes') a.routes = need(i++, t);
    else if (t === '--project') a.project = need(i++, t);
    else if (t === '--out') a.out = need(i++, t);
    else if (t === '--only') a.only = need(i++, t).split(',').map((s) => s.trim()).filter(Boolean);
    else if (t === '--done') a.done = need(i++, t);
    else if (t === '--js-budget') a.jsBudget = Number(need(i++, t));
    else throw new Error(`unknown argument ${t}`);
  }
  if (a.only) {
    const bad = a.only.filter((g) => !GATES.includes(g));
    if (bad.length) throw new Error(`--only: unknown gate ${bad.join(', ')} (known: ${GATES.join(', ')})`);
  }
  if (a.jsBudget !== null && !(a.jsBudget > 0)) throw new Error('--js-budget must be a positive number of kB');
  return a;
}

// ---- resolution of playwright and axe-core ----------------------------------------------
function globalRoots() {
  const roots = [];
  try {
    roots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15000 }).trim());
  } catch {
    /* no npm on PATH */
  }
  roots.push('/usr/lib/node_modules', '/usr/local/lib/node_modules');
  return roots.filter(Boolean);
}

function playwrightCandidates(project) {
  const out = [];
  const bases = [['project', project], ['plugin', PLUGIN]];
  for (const [how, base] of bases) {
    for (const name of ['playwright', 'playwright-core']) {
      try {
        out.push({ how: `${name} from the ${how}`, path: createRequire(join(base, 'noop.js')).resolve(name) });
      } catch {
        /* not here */
      }
    }
  }
  for (const r of globalRoots()) {
    for (const name of ['playwright', 'playwright-core']) {
      try {
        out.push({ how: `${name} installed globally (${r})`, path: createRequire(join(r, 'noop.js')).resolve(name) });
      } catch {
        /* not here */
      }
    }
  }
  const seen = new Set();
  return out.filter((c) => (seen.has(c.path) ? false : seen.add(c.path)));
}

async function launchBrowser(project) {
  const cands = playwrightCandidates(project);
  if (!cands.length) return { error: 'no-playwright' };
  const req = createRequire(import.meta.url);
  let last = null;
  for (const c of cands) {
    try {
      const mod = req(c.path);
      const chromium = mod.chromium || (mod.default && mod.default.chromium);
      if (!chromium) throw new Error('module exports no chromium');
      const browser = await chromium.launch({ headless: true });
      return { browser, how: c.how };
    } catch (e) {
      last = `${c.how}: ${String(e.message).split('\n')[0]}`;
    }
  }
  return { error: 'no-browser', detail: last };
}

function findAxePath(project) {
  const dirs = [join(project, 'node_modules'), join(PLUGIN, 'node_modules'), ...globalRoots()];
  for (const d of dirs) {
    const p = join(d, 'axe-core', 'axe.min.js');
    if (existsSync(p)) return p;
  }
  return null;
}

// ---- measure library loader (the same way tests/qa-scripts.test.mjs loads it) ----------
const measureCache = new Map();
function measure(name) {
  if (!measureCache.has(name)) {
    const src = readFileSync(join(PLUGIN, 'scripts', 'measure', `${name}.mjs`), 'utf8').replace(/\r\n/g, '\n');
    const body = src.replace(/^(?:[ \t]*(?:\/\/[^\n]*)?\n)+/, '');
    measureCache.set(name, new Function('return (' + body + ')')());
  }
  return measureCache.get(name);
}

// ---- small helpers -----------------------------------------------------------------------
const slug = (route) => (route === '/' || route === '' ? 'home' : route.replace(/^\/+|\/+$/g, '').replace(/[^A-Za-z0-9]+/g, '-').slice(0, 60) || 'home');
const clip = (s, n = 160) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (p, fallback = null) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
};

// ---- the run -----------------------------------------------------------------------------
async function run(args) {
  const project = resolve(args.project || process.cwd());
  const qa = resolve(args.out || join(project, 'qa'));
  const budgetKB = args.jsBudget ?? THRESHOLDS.jsBudgetKB;
  const gates = new Set(args.only || GATES);
  mkdirSync(join(qa, 'shots'), { recursive: true });
  mkdirSync(join(qa, 'raw'), { recursive: true });

  const previous = readJson(join(qa, 'gates.json'), null);
  // A round is one counted attempt at the gates. Quick runs are for looking and do not
  // count; a PASS clears the count, so ESCALATE means four counted failures in a row.
  const prevRound = previous && Number.isFinite(previous.round) ? previous.round : 0;
  const base0 = previous && previous.verdict === 'PASS' ? 0 : prevRound;
  const round = args.quick ? Math.max(base0, 0) : base0 + 1;

  const records = [];
  const rec = (id, ctx, status, summary, evidence = []) => {
    records.push({
      id,
      gate: id.split('.')[0],
      route: ctx.route ?? null,
      viewport: ctx.viewport ?? null,
      theme: ctx.theme ?? null,
      status,
      summary: clip(summary, 200),
      evidence: evidence.slice(0, 8).map((e) => (typeof e === 'string' ? { detail: clip(e, 200) } : { selector: e.selector ? clip(e.selector, 160) : undefined, detail: clip(e.detail, 200) })),
    });
  };
  const raw = (name, data) => {
    try {
      writeFileSync(join(qa, 'raw', `${name}.json`), JSON.stringify(data, null, 1));
    } catch {
      /* raw output is best effort */
    }
  };

  const meta = { url: args.url || null, project, out: qa, thresholds: { ...THRESHOLDS, jsBudgetKB: budgetKB }, args: { only: [...gates], quick: args.quick, lighthouse: args.lighthouse } };

  // ---- code gate (no browser needed) ----
  if (gates.has('code')) runCode(project, rec);

  const needsBrowser = ['content', 'a11y', 'responsive', 'perf', 'tells'].some((g) => gates.has(g));
  let browser = null;
  let routes = [];
  if (needsBrowser) {
    if (!args.url) return finish({ fatal: 'missing --url' });
    const launched = await launchBrowser(project);
    if (launched.error === 'no-playwright') {
      process.stdout.write('Playwright not found (looked in the project, the plugin and the global install). Install it with:\n  npm i -D playwright && npx playwright install chromium\n');
      return 3;
    }
    if (launched.error) {
      rec('browser.launch', {}, 'error', `chromium would not launch: ${launched.detail}. Run: npx playwright install chromium`);
      return finish({ noBrowser: true });
    }
    browser = launched.browser;
    meta.playwright = launched.how;
    try {
      routes = await resolveRoutes(browser, args, project, qa);
    } catch (e) {
      rec('content.reachable', {}, 'error', `cannot reach ${args.url}: ${clip(e.message)}`);
      await browser.close();
      return finish({ noBrowser: false });
    }
    if (args.quick) routes = routes.slice(0, 1);
    meta.routes = routes;
    try {
      await runBrowserGates(browser, args, project, qa, gates, routes, budgetKB, rec, raw);
    } finally {
      await browser.close();
    }
  }
  return finish({});

  function finish({ fatal, noBrowser }) {
    if (fatal) {
      process.stderr.write(`gates: ${fatal}\n`);
      return 3;
    }
    return writeOutputs(qa, round, meta, records, noBrowser);
  }
}

// ---- routes -----------------------------------------------------------------------------
async function resolveRoutes(browser, args, project, qa) {
  const norm = (r) => {
    const s = String(r).trim();
    if (!s) return null;
    return s.startsWith('/') ? s : `/${s}`;
  };
  if (args.routes) return [...new Set(args.routes.split(',').map(norm).filter(Boolean))].slice(0, THRESHOLDS.maxRoutes);
  for (const f of [join(project, 'qa', 'routes.txt'), join(qa, 'routes.txt')]) {
    if (existsSync(f)) {
      const list = readFileSync(f, 'utf8').split('\n').map((l) => l.replace(/#.*$/, '').trim()).filter(Boolean).map(norm).filter(Boolean);
      if (list.length) return [...new Set(list)].slice(0, THRESHOLDS.maxRoutes);
    }
  }
  // crawl same-origin links from / (breadth first, capped)
  const origin = new URL(args.url).origin;
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const found = ['/'];
  const queue = ['/'];
  try {
    while (queue.length && found.length < THRESHOLDS.maxRoutes) {
      const route = queue.shift();
      let resp;
      try {
        resp = await page.goto(new URL(route, args.url).href, { waitUntil: 'load', timeout: THRESHOLDS.navTimeoutMs });
      } catch (e) {
        if (route === '/') throw e;
        continue;
      }
      if (route === '/' && resp && resp.status() >= 500) throw new Error(`HTTP ${resp.status()} on /`);
      const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.href)).catch(() => []);
      for (const h of hrefs) {
        let u;
        try {
          u = new URL(h);
        } catch {
          continue;
        }
        if (u.origin !== origin || u.pathname.startsWith('/_next/')) continue;
        if (/\.[a-z0-9]{2,5}$/i.test(u.pathname) && !/\.html?$/i.test(u.pathname)) continue;
        const p = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, '') : '/';
        if (!found.includes(p) && found.length < THRESHOLDS.maxRoutes) {
          found.push(p);
          queue.push(p);
        }
      }
    }
  } finally {
    await ctx.close();
  }
  return found;
}

// ---- code gate ----------------------------------------------------------------------------
function runCode(project, rec) {
  const hasPkg = existsSync(join(project, 'package.json'));
  const hasTree = ['app', 'src', 'site', 'pages'].some((d) => existsSync(join(project, d)));
  const ctx = {};
  if (!hasPkg && !hasTree) {
    rec('code.site-check', ctx, 'skip', 'no package.json or source tree in the project');
    return;
  }
  // tsc
  if (existsSync(join(project, 'tsconfig.json'))) {
    const bin = join(project, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
    if (!existsSync(bin)) rec('code.tsc', ctx, 'skip', 'tsc is not installed in the project (npm install first)');
    else {
      const r = spawnSync(bin, ['--noEmit'], { cwd: project, encoding: 'utf8', timeout: 240000, shell: process.platform === 'win32' });
      if (r.error) rec('code.tsc', ctx, 'error', `tsc did not run: ${r.error.message}`);
      else if (r.status !== 0) rec('code.tsc', ctx, 'fail', `tsc --noEmit exited ${r.status}`, (r.stdout + r.stderr).split('\n').filter(Boolean).slice(0, 6));
      else rec('code.tsc', ctx, 'pass', 'tsc --noEmit clean');
    }
  } else rec('code.tsc', ctx, 'skip', 'no tsconfig.json');
  // lint script
  const pkg = readJson(join(project, 'package.json'), {});
  if (pkg && pkg.scripts && pkg.scripts.lint) {
    const r = spawnSync('npm', ['run', '--silent', 'lint'], { cwd: project, encoding: 'utf8', timeout: 240000, shell: process.platform === 'win32' });
    if (r.error) rec('code.lint', ctx, 'error', `lint did not run: ${r.error.message}`);
    else if (r.status !== 0) rec('code.lint', ctx, 'fail', `npm run lint exited ${r.status}`, (r.stdout + r.stderr).split('\n').filter(Boolean).slice(0, 6));
    else rec('code.lint', ctx, 'pass', 'lint script clean');
  } else rec('code.lint', ctx, 'skip', 'no lint script in package.json');
  // site-check (subprocess, existing CLI)
  const sc = join(PLUGIN, 'scripts', 'site-check.mjs');
  if (!existsSync(sc)) {
    rec('code.site-check', ctx, 'skip', 'scripts/site-check.mjs not found in the plugin');
    return;
  }
  const r = spawnSync(process.execPath, [sc, project], { encoding: 'utf8', timeout: 120000 });
  const lines = (r.stdout || '').split('\n');
  const fails = lines.filter((l) => /^FAIL/.test(l));
  if (r.error || r.status === 2 || r.status === null) rec('code.site-check', ctx, 'error', `site-check did not run: ${r.error ? r.error.message : clip(r.stderr)}`);
  else if (r.status === 1) rec('code.site-check', ctx, 'fail', `${fails.length} site-check failure(s)`, fails.map((l) => l.replace(/^FAIL\s+/, '')));
  else rec('code.site-check', ctx, 'pass', 'site-check: all checks passed');
}

// ---- browser gates ------------------------------------------------------------------------
async function runBrowserGates(browser, args, project, qa, gates, routes, budgetKB, rec, raw) {
  const axePath = findAxePath(project);
  const viewports = args.quick ? THRESHOLDS.quickViewports : THRESHOLDS.viewports;
  const T = THRESHOLDS;
  const metaSeen = []; // [{route,title,description}] for the uniqueness check
  let themeStrategy = undefined; // 'class' | 'media' | null once detected

  const open = async (route, width) => {
    const ctx = await browser.newContext({ viewport: { width, height: width < 500 ? 812 : 900 } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(T.navTimeoutMs);
    let resp = null;
    try {
      resp = await page.goto(new URL(route, args.url).href, { waitUntil: 'networkidle', timeout: T.navTimeoutMs });
    } catch {
      try {
        resp = await page.goto(new URL(route, args.url).href, { waitUntil: 'load', timeout: T.navTimeoutMs });
      } catch (e) {
        await ctx.close();
        throw e;
      }
    }
    return { ctx, page, status: resp ? resp.status() : 0 };
  };
  const settle = async (page) => {
    // walk the page once so lazy content and reveal-on-scroll states resolve, then return to the top
    await page
      .evaluate(async () => {
        const h = Math.min(document.documentElement.scrollHeight, 30000);
        for (let y = 0; y < h; y += Math.max(300, window.innerHeight * 0.8)) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      })
      .catch(() => {});
    await sleep(500);
  };
  const seed = (page, cfg) => page.evaluate((c) => { window.__ultraweb = c; }, cfg);
  const overlapRec = (ctx, r) => {
    const ev = (r.collisions || []).slice(0, 8).map((c) => ({ selector: c.a.selector, detail: `"${c.a.text}" runs into "${c.b.text}" (${c.b.selector}) by ${c.overlap.w}x${c.overlap.h}px at y=${c.at.y}` }));
    rec('responsive.text-overlap', ctx, r.count ? 'fail' : 'pass', r.count ? `${r.count} place(s) where text runs into other text` : `${r.checked} lines of text, none overlapping`, ev);
  };
  const call = async (name, page, cfg, ctx, id, fn) => {
    try {
      await seed(page, cfg);
      const res = await measure(name)(page);
      raw(`${name}-${slug(ctx.route)}-${ctx.viewport}${ctx.theme ? '-' + ctx.theme : ''}`, res);
      if (!res || res.error) {
        rec(id, ctx, 'error', `${name}: ${clip(res && res.error ? res.error : 'no result')}`);
        return;
      }
      fn(res);
    } catch (e) {
      rec(id, ctx, 'error', `${name} threw: ${clip(e.message)}`);
    }
  };
  const detectTheme = async (page) => {
    const bg = () => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor + '|' + getComputedStyle(document.body).backgroundColor + '|' + getComputedStyle(document.body).color);
    try {
      const base = await bg();
      await page.emulateMedia({ colorScheme: 'dark' });
      await sleep(150);
      const m = await bg();
      await page.emulateMedia({ colorScheme: null });
      await sleep(100);
      if (m !== base) return 'media';
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await sleep(150);
      const c = await bg();
      await page.evaluate(() => document.documentElement.classList.remove('dark'));
      return c !== base ? 'class' : null;
    } catch {
      return null;
    }
  };
  const applyTheme = async (page, theme, strategy) => {
    if (strategy === 'media') await page.emulateMedia({ colorScheme: theme });
    else await page.evaluate((t) => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
    await sleep(150);
  };
  const shoot = async (page, route, width, theme) => {
    const file = join(qa, 'shots', `${slug(route)}-${width}${theme ? '-' + theme : ''}.png`);
    const h = await page.evaluate(() => Math.min(document.documentElement.scrollHeight, 7000)).catch(() => 900);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: Math.max(h, 300) }, fullPage: true });
    return file;
  };

  for (const route of routes) {
    // ---------- desktop pass: content, a11y, rhythm, screenshots ----------
    const wideNeeded = ['content', 'a11y', 'tells', 'responsive'].some((g) => gates.has(g));
    if (wideNeeded) {
      let opened;
      const ctx1440 = { route, viewport: 1440, theme: 'light' };
      try {
        opened = await open(route, 1440);
      } catch (e) {
        rec('content.reachable', ctx1440, 'error', `cannot load ${route}: ${clip(e.message)}`);
        continue;
      }
      const { ctx, page, status } = opened;
      try {
        // the 404 page itself is supposed to answer 404
        const is404Page = status === 404 && /(^|\/)404(\.html)?\/?$/.test(route);
        if ((status >= 400 || status === 0) && !is404Page) {
          rec('content.status', ctx1440, 'fail', `${route} answered HTTP ${status}`);
          await ctx.close();
          continue;
        }
        await settle(page);
        if (themeStrategy === undefined && gates.has('a11y') && !args.quick) themeStrategy = await detectTheme(page);
        const base = { theme: 'light', themeStrategy: themeStrategy || 'class', axePath: axePath || undefined };

        if (gates.has('content')) {
          await call('links-collect', page, { ...base, checkLimit: 200 }, ctx1440, 'content.links', (r) => {
            const ev = [
              ...r.deadHash.map((d) => ({ selector: d.selector, detail: `dead href="${d.raw}"` })),
              ...r.emptyText.map((d) => ({ selector: d.selector, detail: `link with no text -> ${d.href}` })),
              ...r.broken.map((d) => ({ detail: `HTTP ${d.status} ${d.href}` })),
            ];
            rec('content.links', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} dead or broken link(s)` : `${r.counts.links} links, ${r.counts.checked} checked`, ev);
          });
          await call('heading-narrative', page, base, ctx1440, 'content.headings', (r) => {
            const ev = [...r.generic.map((g) => ({ detail: `generic heading "${g}"` })), ...(r.empty ? [{ detail: `${r.empty} empty heading(s)` }] : [])];
            rec('content.headings', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} generic or empty heading issue(s)` : `${r.counts.headings} headings`, ev);
          });
          try {
            const m = await page.evaluate(() => {
              const q = (s, a) => { const e = document.querySelector(s); return e ? (a ? e.getAttribute(a) : e.textContent) : null; };
              const text = (document.body ? document.body.innerText : '').slice(0, 200000);
              return {
                title: (document.title || '').trim(),
                description: (q('meta[name="description"]', 'content') || '').trim(),
                canonical: q('link[rel="canonical"]', 'href'),
                ogTitle: q('meta[property="og:title"]', 'content'),
                lang: document.documentElement.getAttribute('lang'),
                text,
              };
            });
            raw(`metadata-${slug(route)}`, { ...m, text: undefined });
            const miss = [];
            if (!m.title) miss.push('missing <title>');
            if (!m.description) miss.push('missing meta description');
            if (!m.lang) miss.push('missing <html lang>');
            rec('content.metadata', ctx1440, miss.length ? 'fail' : 'pass', miss.length ? miss.join('; ') : 'title, description and lang present', miss);
            metaSeen.push({ route, title: m.title, description: m.description });
            const PLACE = [
              [/lorem ipsum|dolor sit amet/i, 'lorem ipsum'],
              [/TODO-COPY/, 'unreplaced TODO-COPY marker from the kit starter'],
              [/\b(TODO|TBD|FIXME)\b/, 'TODO/TBD marker'],
              [/your (text|headline|title|content|company name) here|insert (text|headline) here|heading goes here|sample text|placeholder text/i, 'template placeholder copy'],
              [/\bFeature [0-9]\b/, 'stock "Feature N" copy'],
              [/\b(John|Jane) Doe\b/, 'John/Jane Doe'],
            ];
            const hits = PLACE.filter(([re]) => re.test(m.text)).map(([, label]) => label);
            const imgs = await page.evaluate(() => Array.from(document.images).filter((i) => { try { return /(^|\.)(placehold\.(co|it)|placeholder\.com|picsum\.photos|dummyimage\.com|placekitten\.com|loremflickr\.com)$/i.test(new URL(i.src, location.href).hostname); } catch (e) { return false; } }).map((i) => i.src)).catch(() => []);
            for (const i of imgs) hits.push(`placeholder image ${clip(i, 80)}`);
            rec('content.placeholder', ctx1440, hits.length ? 'fail' : 'pass', hits.length ? `placeholder content: ${hits.join(', ')}` : 'no placeholder text or images', hits);
            const assumed = await page.evaluate(() => Array.from(document.querySelectorAll('[data-assumed]')).map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60))).catch(() => []);
            rec('content.assumed', ctx1440, assumed.length ? 'review' : 'pass', assumed.length ? `${assumed.length} drafted fact(s) marked data-assumed: the owner must confirm each before production` : 'no drafted facts marked data-assumed', assumed);
            const standins = await page.evaluate(() => Array.from(document.querySelectorAll('img[data-standin]')).map((e) => e.getAttribute('src') || '')).catch(() => []);
            rec('content.standins', ctx1440, standins.length ? 'review' : 'pass', standins.length ? `${standins.length} stand-in photograph(s): the owner must replace or approve each before production` : 'no stand-in photographs', standins.map((x) => clip(x, 80)));
          } catch (e) {
            rec('content.metadata', ctx1440, 'error', `metadata read threw: ${clip(e.message)}`);
          }
        }

        if (gates.has('a11y')) {
          await call('axe', page, base, ctx1440, 'a11y.axe', (r) => {
            if (!r.source) return rec('a11y.axe', ctx1440, 'error', 'axe-core unavailable (no project copy, no network)');
            const ev = r.violations.map((v) => ({ selector: v.nodes[0] && v.nodes[0].target, detail: `${v.id} (${v.impact}): ${v.help}` }));
            if (ev.length) return rec('a11y.axe', ctx1440, 'fail', `${ev.length} axe violation type(s) [${r.source}]`, ev);
            const inc = (r.incompleteItems || []).map((v) => ({ selector: v.nodes[0] && v.nodes[0].target, detail: `needs review: ${v.id}: ${v.help}` }));
            if (inc.length) return rec('a11y.axe', ctx1440, 'review', `${inc.length} axe item(s) need a human look, first: ${clip(inc[0].detail, 110)}${inc[0].selector ? ' at ' + clip(inc[0].selector, 60) : ''} [${r.source}]`, inc);
            rec('a11y.axe', ctx1440, 'pass', `axe clean [${r.source}]`);
          });
          const themes = ['light'];
          if (themeStrategy) themes.push('dark');
          for (const theme of themes) {
            const c = { route, viewport: 1440, theme };
            await call('contrast-matrix', page, { ...base, theme, themeStrategy: themeStrategy || 'class', normal: T.contrastNormal, large: T.contrastLarge }, c, 'a11y.contrast', (r) => {
              const ev = r.failing.map((p) => ({ selector: p.selector, detail: `${p.ratio}:1 < ${p.required}:1 "${p.text}" ${p.fg} on ${p.bg}` }));
              if (ev.length) return rec('a11y.contrast', c, 'fail', `${r.failing.length} of ${r.counts.pairs} text runs below contrast`, ev);
              const seen = new Set();
              const rv = r.reviewing.filter((p) => (seen.has(p.selector) ? false : seen.add(p.selector))).map((p) => ({ selector: p.selector, detail: `${p.reviewReason}: "${p.text}"` }));
              if (rv.length) return rec('a11y.contrast', c, 'review', `${rv.length} text run(s) over an image or gradient need a look`, rv);
              rec('a11y.contrast', c, 'pass', `${r.counts.pairs} text runs pass`);
            });
          }
          await call('keyboard-walk', page, base, ctx1440, 'a11y.keyboard', (r) => {
            const ev = [];
            if (r.count === 0) return rec('a11y.keyboard', ctx1440, 'review', 'no tab stops found (nothing focusable)');
            if (!r.skipLinkFirst) ev.push({ detail: 'the first tab stop is not a skip link' });
            if (r.trap) ev.push({ detail: 'keyboard focus is trapped on one element' });
            for (const s of r.stops.filter((x) => x.visibleFocusRing === false)) ev.push({ selector: s.selector, detail: 'no visible focus ring' });
            rec('a11y.keyboard', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} keyboard issue(s) over ${r.count} stops` : `${r.count} stops, skip link first, rings visible`, ev);
          });
          await call('landmarks-headings', page, base, ctx1440, 'a11y.landmarks', (r) => {
            // a navigation landmark is expected on the home page; a 404 or a legal page may do without
            const ev = r.issues.filter((i) => i.kind !== 'no-nav' || route === '/').map((i) => ({ selector: i.selector, detail: `${i.kind}: ${i.detail}` }));
            rec('a11y.landmarks', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} landmark or heading issue(s)` : 'landmarks and heading order fine', ev);
          });
          await call('alt-and-labels', page, base, ctx1440, 'a11y.alt-labels', (r) => {
            const ev = r.issues.map((i) => ({ selector: i.selector, detail: `${i.kind}: ${i.detail}` }));
            rec('a11y.alt-labels', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} alt or label issue(s)` : `${r.counts.images} images, ${r.counts.controls} controls named`, ev);
          });
          await call('targets', page, { ...base, threshold: T.targetMinPx }, ctx1440, 'a11y.targets-24', (r) => {
            const ev = r.small.map((s) => ({ selector: s.selector, detail: `${s.w}x${s.h}px "${s.text}"` }));
            rec('a11y.targets-24', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} target(s) under ${T.targetMinPx}px` : `${r.checked} targets checked`, ev);
          });
          await call('forms-a11y', page, base, ctx1440, 'a11y.forms', (r) => {
            if (!r.counts.forms) return rec('a11y.forms', ctx1440, 'skip', 'no forms on this route');
            const ev = r.issues.map((i) => ({ selector: i.selector, detail: `${i.kind}: ${i.detail}` }));
            rec('a11y.forms', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} form issue(s)` : `${r.counts.fields} fields fine`, ev);
          });
          await call('text-spacing', page, base, ctx1440, 'a11y.text-spacing', (r) => {
            const ev = r.clipped.map((c) => ({ selector: c.selector, detail: `clipped on ${c.axis}: "${c.text}"` }));
            if (r.overflowX) ev.push({ detail: 'page scrolls sideways under WCAG 1.4.12 spacing' });
            rec('a11y.text-spacing', ctx1440, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} text-spacing issue(s)` : 'text survives 1.4.12 spacing', ev);
          });
        }

        if (gates.has('tells')) {
          await call('wallpaper-rhythm', page, base, ctx1440, 'tells.rhythm', (r) => {
            if (r.verdict === 'ok') return rec('tells.rhythm', ctx1440, 'pass', `${r.sections.length} sections, ${r.distinctPaddings} distinct spacings`);
            if (r.verdict === 'wallpaper') return rec('tells.rhythm', ctx1440, 'review', r.reason || 'identical section spacing', r.sections.slice(0, 4).map((s) => ({ selector: s.carrier || s.selector, detail: `${s.paddingTop}/${s.paddingBottom}` })));
            rec('tells.rhythm', ctx1440, 'skip', r.reason || 'rhythm not measurable on this page');
          });
        }

        if (gates.has('responsive')) {
          await call('overflow-culprits', page, base, ctx1440, 'responsive.overflow', (r) => {
            const bad = r.overflowX === true;
            rec('responsive.overflow', ctx1440, bad ? 'fail' : 'pass', bad ? `scrolls sideways: scrollWidth ${r.scrollWidth} > ${r.clientWidth}` : 'no horizontal overflow', r.culprits.slice(0, 5).map((c) => ({ selector: c.selector, detail: `right edge ${c.right}px` })));
          });
          await call('text-overlap', page, base, ctx1440, 'responsive.text-overlap', (r) => overlapRec(ctx1440, r));
          try {
            await shoot(page, route, 1440, 'light');
            if (themeStrategy && !args.quick) {
              await applyTheme(page, 'dark', themeStrategy);
              await shoot(page, route, 1440, 'dark');
              await applyTheme(page, 'light', themeStrategy);
              if (themeStrategy === 'media') await page.emulateMedia({ colorScheme: null });
            }
            rec('responsive.shots', ctx1440, 'pass', `screenshot written to ${join(qa, 'shots', `${slug(route)}-1440-light.png`)}`);
          } catch (e) {
            rec('responsive.shots', ctx1440, 'error', `screenshot failed: ${clip(e.message)}`);
          }
        }
      } finally {
        await ctx.close();
      }
    }

    // ---------- other viewports ----------
    for (const width of viewports.filter((w) => w !== 1440)) {
      if (!gates.has('responsive') && !(gates.has('a11y') && width === 375)) continue;
      const cv = { route, viewport: width, theme: 'light' };
      let o;
      try {
        o = await open(route, width);
      } catch (e) {
        rec('responsive.overflow', cv, 'error', `cannot load ${route} at ${width}: ${clip(e.message)}`);
        continue;
      }
      try {
        if (o.status >= 400 || o.status === 0) continue;
        await settle(o.page);
        const base = { theme: 'light', themeStrategy: 'class' };
        if (gates.has('responsive')) {
          await call('overflow-culprits', o.page, base, cv, 'responsive.overflow', (r) => {
            const bad = r.overflowX === true;
            rec('responsive.overflow', cv, bad ? 'fail' : 'pass', bad ? `scrolls sideways: scrollWidth ${r.scrollWidth} > ${r.clientWidth}` : 'no horizontal overflow', r.culprits.slice(0, 5).map((c) => ({ selector: c.selector, detail: `right edge ${c.right}px` })));
          });
          await call('text-overlap', o.page, base, cv, 'responsive.text-overlap', (r) => overlapRec(cv, r));
          if (width === 375) {
            await call('targets', o.page, { ...base, threshold: T.targetMinMobilePx }, cv, 'responsive.targets-44', (r) => {
              const ev = r.small.map((s) => ({ selector: s.selector, detail: `${s.w}x${s.h}px "${s.text}"` }));
              rec('responsive.targets-44', cv, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} target(s) under ${T.targetMinMobilePx}px at 375` : `${r.checked} targets checked`, ev);
            });
          }
          try {
            await shoot(o.page, route, width, null);
            rec('responsive.shots', cv, 'pass', `screenshot written to ${join(qa, 'shots', `${slug(route)}-${width}.png`)}`);
          } catch (e) {
            rec('responsive.shots', cv, 'error', `screenshot failed: ${clip(e.message)}`);
          }
        }
        if (gates.has('a11y') && width === 375) {
          await call('text-spacing', o.page, base, cv, 'a11y.text-spacing', (r) => {
            const ev = r.clipped.map((c) => ({ selector: c.selector, detail: `clipped on ${c.axis}: "${c.text}"` }));
            if (r.overflowX) ev.push({ detail: 'page scrolls sideways under WCAG 1.4.12 spacing' });
            rec('a11y.text-spacing', cv, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} text-spacing issue(s)` : 'text survives 1.4.12 spacing', ev);
          });
        }
      } finally {
        await o.ctx.close();
      }
    }

    // ---------- perf: fresh contexts, observed vitals ----------
    if (gates.has('perf')) {
      for (const width of viewports.filter((w) => w === 375 || w === 1440)) {
        const cp = { route, viewport: width, theme: null };
        let ctx;
        try {
          ctx = await browser.newContext({ viewport: { width, height: width < 500 ? 812 : 900 } });
          const page = await ctx.newPage();
          page.setDefaultTimeout(T.navTimeoutMs);
          await page.addInitScript(() => {
            window.__vit = { lcp: 0, cls: 0, lcpEl: null };
            try {
              new PerformanceObserver((l) => {
                for (const e of l.getEntries()) {
                  window.__vit.lcp = e.startTime;
                  window.__vit.lcpEl = e.element ? e.element.tagName.toLowerCase() : null;
                }
              }).observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) { /* unsupported */ }
            try {
              new PerformanceObserver((l) => {
                for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vit.cls += e.value;
              }).observe({ type: 'layout-shift', buffered: true });
            } catch (e) { /* unsupported */ }
          });
          const resp = await page.goto(new URL(route, args.url).href, { waitUntil: 'networkidle', timeout: T.navTimeoutMs }).catch(() => page.goto(new URL(route, args.url).href, { waitUntil: 'load', timeout: T.navTimeoutMs }));
          if (!resp || resp.status() >= 400) {
            rec('perf.lcp', cp, 'skip', `HTTP ${resp ? resp.status() : 0}`);
            await ctx.close();
            continue;
          }
          await sleep(1200);
          await settle(page);
          const v = await page.evaluate(() => window.__vit || { lcp: 0, cls: 0 });
          raw(`vitals-${slug(route)}-${width}`, v);
          if (!v.lcp) rec('perf.lcp', cp, 'review', 'no largest-contentful-paint entry was observed');
          else rec('perf.lcp', cp, v.lcp <= T.lcpMaxMs ? 'pass' : 'fail', `LCP ${Math.round(v.lcp)} ms (limit ${T.lcpMaxMs})${v.lcpEl ? ` on <${v.lcpEl}>` : ''}`);
          const cls = Math.round(v.cls * 1000) / 1000;
          rec('perf.cls', cp, cls <= T.clsMax ? 'pass' : 'fail', `CLS ${cls} (limit ${T.clsMax})`);
          if (width === 1440) {
            const cp2 = { route, viewport: 1440, theme: null };
            await call('cold-load-js', page, {}, cp2, 'perf.js-budget', (r) => {
              const bytes = r.totalTransfer || r.totalEncoded;
              if (r.count > 0 && !bytes) return rec('perf.js-budget', cp2, 'review', `${r.count} script(s) but the browser exposed no transfer size (cross-origin timing hidden or all cached)`);
              const kb = Math.round((bytes / 1024) * 10) / 10;
              const top = [...r.scripts].sort((a, b) => (b.transferSize || b.encodedBodySize) - (a.transferSize || a.encodedBodySize)).slice(0, 4).map((s) => ({ detail: `${Math.round((s.transferSize || s.encodedBodySize) / 1024)} kB ${s.name.slice(-70)}` }));
              rec('perf.js-budget', cp2, kb <= budgetKB ? 'pass' : 'fail', `${kb} kB cold JavaScript across ${r.count} files (budget ${budgetKB} kB)`, kb > budgetKB ? top : []);
            });
            try {
              await page.evaluate(() => document.fonts.ready);
            } catch { /* no fonts API */ }
            await call('font-requests', page, {}, cp2, 'perf.fonts', (r) => {
              const kb = Math.round(((r.totalTransfer || 0) / 1024) * 10) / 10;
              const ev = r.errored.map((f) => ({ detail: `font face "${f}" failed to load` }));
              if (kb > T.fontBudgetKB) ev.push({ detail: `${kb} kB of font files (budget ${T.fontBudgetKB} kB)` });
              rec('perf.fonts', cp2, ev.length ? 'fail' : 'pass', ev.length ? `${ev.length} font issue(s)` : `${r.count} font file(s), ${kb} kB`, ev);
            });
          }
        } catch (e) {
          rec('perf.lcp', cp, 'error', `vitals run threw: ${clip(e.message)}`);
        } finally {
          if (ctx) await ctx.close().catch(() => {});
        }
      }
      if (args.lighthouse) {
        const r = spawnSync('npx', ['--no-install', 'lighthouse', new URL(route, args.url).href, '--quiet', '--output=json', '--only-categories=performance', '--chrome-flags=--headless --no-sandbox'], { encoding: 'utf8', timeout: 180000, maxBuffer: 64 * 1024 * 1024 });
        const cl = { route, viewport: null, theme: null };
        try {
          const j = JSON.parse(r.stdout);
          const score = Math.round(j.categories.performance.score * 100);
          rec('perf.lighthouse', cl, score >= 90 ? 'pass' : 'review', `Lighthouse performance ${score}`);
        } catch {
          rec('perf.lighthouse', cl, 'skip', 'lighthouse is not installed or did not return JSON');
        }
      }
    }

    // ---------- tells census: a fresh, unscrolled page ----------
    if (gates.has('tells')) {
      const ct = { route, viewport: 1440, theme: 'light' };
      let o;
      try {
        o = await open(route, 1440);
        if (o.status < 400) {
          await sleep(700);
          await call('tells-census', o.page, { theme: 'light' }, ct, 'tells.census', (r) => {
            if (!r.flags.length) return rec('tells.census', ct, 'pass', `no tells flagged (${r.families.display || '?'} / ${r.families.body || '?'})`);
            rec('tells.census', ct, 'review', `${r.flags.length} tell(s): ${r.flags.map((f) => f.id).join(', ')}`, r.flags.map((f) => ({ detail: `${f.id}: ${f.evidence}` })));
          });
          await call('density', o.page, {}, ct, 'tells.empty-screens', (r) => {
            const cov = (r.slices || []).map((x) => Math.round(x.coverage * 100)).join(' ');
            // short pages (a 404, a legal stub) may be sparse; only an outright empty screen fails them
            const judged = Math.max(1, (r.slices || []).length - 1);
            if ((r.empty || []).length || (judged >= 3 && r.sparseShare > 0.5)) {
              rec('tells.empty-screens', ct, 'fail', `${(r.empty || []).length} empty and ${(r.sparse || []).length} sparse of ${(r.slices || []).length} screens (percent of each screen carrying text or media: ${cov})`, (r.empty.length ? r.empty : r.sparse).map((i) => ({ detail: `screen ${i + 1}, about ${i * r.viewport.height}px down the page, is nearly bare ground` })));
            } else rec('tells.empty-screens', ct, 'pass', `no empty screen (percent carrying text or media: ${cov})`);
            if (route === '/' && r.first) {
              const f = r.first;
              if (f.headingPx < 72 && f.mediaShare < 0.4) rec('tells.first-screen', ct, 'fail', `the first screen is timid: its largest heading is ${f.headingPx}px and pictures cover ${Math.round(f.mediaShare * 100)}% of it. Set the headline at 72px or more, or let a picture or drawn scene fill at least 40% of the screen`, [{ detail: `largest heading: "${f.heading}"` }]);
              else rec('tells.first-screen', ct, 'pass', `first screen carried by ${f.headingPx >= 72 ? `a ${f.headingPx}px headline` : `pictures over ${Math.round(f.mediaShare * 100)}% of it`}`);
            }
            const st = r.smallText || { share: 0, examples: [] };
            if (st.share > 0.3) rec('tells.small-text', ct, 'fail', `${Math.round(st.share * 100)}% of body copy is set under 16px (median ${r.bodyPx}px)`, st.examples.map((e) => ({ selector: e.selector, detail: `${e.px}px: ${e.text}` })));
            else rec('tells.small-text', ct, 'pass', `body copy median ${r.bodyPx ?? '?'}px, ${Math.round(st.share * 100)}% under 16px`);
            const g = r.grounds || { sections: 0, distinct: 0 };
            if (g.sections >= 5 && g.distinct <= 1) rec('tells.one-ground', ct, 'review', `${g.sections} sections share one ground: a second ground or one colour band gives the page rhythm`);
            else rec('tells.one-ground', ct, 'pass', `${g.distinct} ground(s) across ${g.sections} section(s)`);
          });
        }
      } catch (e) {
        rec('tells.census', ct, 'error', `census could not load ${route}: ${clip(e.message)}`);
      } finally {
        if (o) await o.ctx.close().catch(() => {});
      }
    }
  }

  // metadata uniqueness across routes
  if (gates.has('content') && metaSeen.length > 1) {
    for (const key of ['title', 'description']) {
      const by = new Map();
      for (const m of metaSeen) if (m[key]) by.set(m[key], [...(by.get(m[key]) || []), m.route]);
      const dups = [...by.entries()].filter(([, r]) => r.length > 1);
      rec(`content.${key}-unique`, {}, dups.length ? 'fail' : 'pass', dups.length ? `${dups.length} duplicated ${key}(s) across routes` : `${key} unique across ${metaSeen.length} routes`, dups.map(([v, r]) => ({ detail: `"${clip(v, 70)}" on ${r.join(', ')}` })));
    }
  }
}

// ---- outputs ------------------------------------------------------------------------------
const ORDER = { fail: 0, error: 1, review: 2, waived: 3, pass: 4, skip: 5 };

function applyWaivers(records, qa) {
  const w = readJson(join(qa, 'waivers.json'), null);
  const list = Array.isArray(w) ? w : w && Array.isArray(w.waivers) ? w.waivers : [];
  const used = list.slice(0, THRESHOLDS.maxWaivers).filter((x) => x && x.check && x.reason);
  const note = list.length > THRESHOLDS.maxWaivers ? `waivers.json has ${list.length} entries; only the first ${THRESHOLDS.maxWaivers} are honoured` : null;
  for (const r of records) {
    if (r.status !== 'fail') continue;
    const hit = used.find((x) => x.check === r.id && (!x.route || x.route === r.route) && (!x.selector || r.evidence.some((e) => e.selector && e.selector.includes(x.selector))));
    if (hit) {
      r.status = 'waived';
      r.waiver = clip(hit.reason, 160);
    }
  }
  return note;
}

function writeOutputs(qa, round, meta, records, noBrowser) {
  const waiverNote = applyWaivers(records, qa);
  const fails = records.filter((r) => r.status === 'fail');
  const errors = records.filter((r) => r.status === 'error');
  let verdict = 'PASS';
  if (fails.length) verdict = 'FAIL';
  else if (errors.length || noBrowser) verdict = 'UNVERIFIED';

  // per-check summary
  const byId = new Map();
  for (const r of records) {
    const e = byId.get(r.id) || { id: r.id, gate: r.gate, status: 'skip', counts: {}, first: null };
    e.counts[r.status] = (e.counts[r.status] || 0) + 1;
    if (ORDER[r.status] < ORDER[e.status] || (e.status === 'skip' && r.status !== 'skip')) {
      e.status = r.status;
      e.first = r;
    } else if (!e.first) e.first = r;
    byId.set(r.id, e);
  }
  const checks = [...byId.values()].sort((a, b) => GATES.indexOf(a.gate) - GATES.indexOf(b.gate) || a.id.localeCompare(b.id));

  const escalate = verdict === 'FAIL' && round >= THRESHOLDS.escalateRound;
  const out = {
    round,
    verdict,
    at: new Date().toISOString(),
    ...meta,
    waiverNote,
    escalate,
    totals: records.reduce((t, r) => ((t[r.status] = (t[r.status] || 0) + 1), t), {}),
    checks: checks.map((c) => ({ id: c.id, status: c.status, counts: c.counts })),
    records,
  };
  mkdirSync(qa, { recursive: true });
  writeFileSync(join(qa, 'gates.json'), JSON.stringify(out, null, 2) + '\n');

  const md = [];
  md.push(`# Gates round ${round}: ${verdict}`, '', `${meta.url || '(no url)'} at ${out.at}. Routes: ${(meta.routes || []).join(', ') || 'n/a'}`, '');
  md.push('| Check | Status | Detail |', '|---|---|---|');
  for (const c of checks) {
    const f = c.first;
    md.push(`| ${c.id} | ${c.status}${Object.keys(c.counts).length > 1 ? ` (${Object.entries(c.counts).map(([k, v]) => `${v} ${k}`).join(', ')})` : ''} | ${(f ? f.summary : '').replace(/\|/g, '/')}${f && f.route ? ` [${f.route}${f.viewport ? ' @' + f.viewport : ''}]` : ''} |`);
  }
  const detail = records.filter((r) => ['fail', 'error', 'review', 'waived'].includes(r.status));
  if (detail.length) {
    md.push('', '## Findings', '');
    for (const r of detail.sort((a, b) => ORDER[a.status] - ORDER[b.status])) {
      md.push(`### ${r.status.toUpperCase()} ${r.id}${r.route ? ` ${r.route}` : ''}${r.viewport ? ` @${r.viewport}` : ''}${r.theme ? ` ${r.theme}` : ''}`, r.summary);
      if (r.waiver) md.push(`Waived: ${r.waiver}`);
      for (const e of r.evidence) md.push(`- ${e.selector ? '`' + e.selector + '` ' : ''}${e.detail}`);
      md.push('');
    }
  }
  if (waiverNote) md.push(waiverNote);
  writeFileSync(join(qa, 'GATES.md'), md.join('\n') + '\n');

  // stdout: at most 60 lines
  const lines = [];
  lines.push(`ultraweb gates round ${round}: ${verdict}   (${meta.url || 'no url'}; ${(meta.routes || []).length} route(s))`);
  lines.push(`totals: ${Object.entries(out.totals).map(([k, v]) => `${v} ${k}`).join(', ') || 'nothing ran'}`);
  for (const c of checks) {
    const f = c.first;
    lines.push(`${c.status.toUpperCase().padEnd(7)} ${c.id.padEnd(22)} ${clip(f ? f.summary : '', 80)}${f && f.route && c.status !== 'pass' ? ` [${f.route}]` : ''}`);
  }
  const failing = records.filter((r) => r.status === 'fail');
  if (failing.length) {
    lines.push('first failures:');
    for (const r of failing.slice(0, 8)) {
      const e = r.evidence[0];
      lines.push(`  ${r.id} ${r.route || ''}${r.viewport ? ' @' + r.viewport : ''}${e ? ' | ' + (e.selector ? e.selector + ' ' : '') + clip(e.detail, 70) : ''}`);
    }
  }
  if (waiverNote) lines.push(waiverNote);
  if (escalate) lines.push(`ESCALATE: round ${round} still FAIL. Stop fixing and report the failing check ids to the user.`);
  lines.push(`wrote ${join(qa, 'gates.json')}, GATES.md, shots/, raw/`);
  const trimmed = lines.length > 60 ? [...lines.slice(0, 58), `... ${lines.length - 59} more lines in GATES.md`, lines[lines.length - 1]] : lines;
  process.stdout.write(trimmed.join('\n') + '\n');
  return verdict === 'PASS' ? 0 : verdict === 'FAIL' ? 1 : 3;
}

// ---- entry --------------------------------------------------------------------------------
async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`gates: ${e.message}\n\n${HELP}`);
    return 3;
  }
  if (args.help) {
    process.stdout.write(HELP);
    return 0;
  }
  if (args.done !== undefined) {
    const project = resolve(args.project || process.cwd());
    const qa = resolve(args.out || join(project, 'qa'));
    mkdirSync(qa, { recursive: true });
    const cur = readJson(join(qa, 'gates.json'), {});
    writeFileSync(join(qa, 'gates-done.json'), JSON.stringify({ reason: args.done, at: new Date().toISOString(), round: cur.round ?? null, verdict: cur.verdict ?? null }, null, 2) + '\n');
    process.stdout.write(`recorded ${join(qa, 'gates-done.json')}; the Stop hook stands down\n`);
    return 0;
  }
  const codeOnly = args.only && args.only.every((g) => g === 'code');
  if (!args.url && !codeOnly) {
    process.stderr.write(`gates: --url is required\n\n${HELP}`);
    return 3;
  }
  try {
    if (args.url) new URL(args.url);
  } catch {
    process.stderr.write(`gates: --url is not a valid URL: ${args.url}\n`);
    return 3;
  }
  return run(args);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().then((code) => process.exit(code), (e) => {
    process.stderr.write(`gates: internal error: ${e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n') : e}\n`);
    process.exit(3);
  });
}
