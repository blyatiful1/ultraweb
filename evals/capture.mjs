#!/usr/bin/env node
// capture.mjs — screenshots + contact sheets (+ gates verdict) for one eval run.
// Usage: node evals/capture.mjs --run <run-id> --url <url> [--routes /,/about] [--root <evals dir>]
// Output: evals/runs/<run-id>/shots/{desktop,mobile}-<route>-NN.png, *-full.png,
//         contact-desktop.png, contact-mobile.png; meta.json gets a "qa" block when gates.mjs exists.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { resolvePlaywright, parseArgs, slug } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
if (!args.run || !args.url) { console.error('usage: node evals/capture.mjs --run <run-id> --url <url> [--routes /,/about]'); process.exit(2); }
const root = resolve(args.root || here);
const runDir = join(root, 'runs', args.run);
const shotDir = join(runDir, 'shots');
mkdirSync(shotDir, { recursive: true });
const base = new URL(args.url);
const routes = String(args.routes || '/').split(',').map((s) => s.trim()).filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAP = 8;

const pw = resolvePlaywright();
if (!pw) { console.error('playwright not found (project, then global). Install it, then retry.'); process.exit(3); }

const VIEWS = [
  { name: 'desktop', opts: { viewport: { width: 1440, height: 900 } } },
  { name: 'mobile', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
];

const browser = await pw.chromium.launch();
const made = { desktop: [], mobile: [] };
for (const v of VIEWS) {
  const ctx = await browser.newContext(v.opts);
  const page = await ctx.newPage();
  for (const route of routes) {
    const url = new URL(route, base).href;
    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); }
    catch (e) { await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {}); }
    await sleep(2000);
    const vh = v.opts.viewport.height;
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const n = Math.max(1, Math.min(CAP, Math.ceil(h / vh)));
    const s = slug(route);
    for (let i = 0; i < n; i++) {
      if (i > 0) { await page.mouse.move(100, 100); await page.mouse.wheel(0, vh); await sleep(1200); }
      const f = `${v.name}-${s}-${String(i + 1).padStart(2, '0')}.png`;
      await page.screenshot({ path: join(shotDir, f) });
      made[v.name].push(f);
    }
    await page.evaluate(() => scrollTo(0, 0)); await sleep(600);
    const full = `${v.name}-${s}-full.png`;
    await page.screenshot({ path: join(shotDir, full), fullPage: true }).catch(() => {});
  }
  await ctx.close();
}

// Contact sheets: render a grid of the step shots with Playwright and screenshot it.
const b64 = (f) => 'data:image/png;base64,' + readFileSync(join(shotDir, f)).toString('base64');
for (const v of VIEWS) {
  const files = made[v.name];
  const w = v.name === 'desktop' ? 360 : 195;
  const cols = v.name === 'desktop' ? 4 : 6;
  const html = `<body style="margin:0;background:#222;font:11px sans-serif;color:#ccc"><div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px;padding:8px;width:max-content">${files
    .map((f) => `<figure style="margin:0"><img src="${b64(f)}" style="width:${w}px;display:block"><figcaption>${f}</figcaption></figure>`).join('')}</div></body>`;
  const ctx = await browser.newContext({ viewport: { width: cols * (w + 8) + 8, height: 600 } });
  const p = await ctx.newPage();
  await p.setContent(html);
  await p.screenshot({ path: join(shotDir, `contact-${v.name}.png`), fullPage: true });
  await ctx.close();
}
await browser.close();

// meta.json
const metaPath = join(runDir, 'meta.json');
let meta = {};
try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); } catch {}
meta.run = meta.run || args.run;
meta.url = meta.url || args.url;
meta.capture = { at: new Date().toISOString(), routes, shots: made.desktop.length + made.mobile.length };

// gates (optional, silent when absent)
const gates = resolve(here, '..', 'scripts', 'gates.mjs');
if (existsSync(gates)) {
  const out = join(runDir, 'qa');
  const r = spawnSync(process.execPath, [gates, '--url', args.url, '--routes', routes.join(','), '--only', 'a11y,responsive,perf,tells', '--out', out],
    { encoding: 'utf8', timeout: 600000, cwd: process.cwd() });
  let verdict = { 0: 'PASS', 1: 'FAIL', 3: 'UNVERIFIED' }[r.status] || 'UNVERIFIED';
  const gj = join(out, 'gates.json');
  let summary = null;
  try { const g = JSON.parse(readFileSync(gj, 'utf8')); verdict = g.verdict || verdict; summary = g.checks ? Object.fromEntries(Object.entries(g.checks).map(([k, c]) => [k, c.status || c])) : null; } catch {}
  meta.qa = { verdict, exit: r.status, ...(summary ? { checks: summary } : {}) };
}
writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
console.log(`captured ${made.desktop.length} desktop + ${made.mobile.length} mobile step shots -> ${shotDir}${meta.qa ? ` · gates ${meta.qa.verdict}` : ''}`);
