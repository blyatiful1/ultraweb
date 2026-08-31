#!/usr/bin/env node
// site-check.mjs — the MECHANICAL, executable subset of ultraweb's ship/gate honesty
// checks, runnable against any ultraweb-built site tree. The prose skills own the
// judgment halves (voice, hierarchy, screenshots); this file owns the greppable
// deliverable contract, so CI can mutation-test it (tests/site-check.test.mjs) and
// a build can run it as the pre-pass ship and the gates cite.
// Usage: node scripts/site-check.mjs <site-root>     (exit 1 on any FAIL)
// Dependency-free, no network.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const site = resolve(process.argv[2] ?? '.');
if (!existsSync(site)) { console.error(`no such directory: ${site}`); process.exit(2); }

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'design', 'tests', 'fixtures', 'coverage', 'dist', '.vercel']);
const CONTENT_EXT = /\.(tsx?|jsx?|mjs|css|mdx|md|json)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) yield* walk(p); }
    else yield p;
  }
}
const allFiles = [...walk(site)];
const files = allFiles.filter(p => CONTENT_EXT.test(p));
// dotenv and key material never match CONTENT_EXT — the secret sweep walks them separately.
const SECRET_FILES = /(^|[\\/])\.env(\..+)?$|\.(pem|key|p12|pfx)$/;
const secretScanFiles = [...files, ...allFiles.filter(p => SECRET_FILES.test(p))];
const read = p => readFileSync(p, 'utf8');
const rel = p => relative(site, p).replaceAll('\\', '/');

let fails = 0;
const fail = (check, msg) => { fails++; console.log(`FAIL  [${check}] ${msg}`); };
const pass = check => console.log(`ok    [${check}]`);

// ---- Deployment mode: exactly one WELL-FORMED line in design/BRIEF.md; anything else fails closed to production.
// Counted against the raw occurrence count so a malformed duplicate ("Deployment mode: demo extra") can't hide.
const briefPath = join(site, 'design', 'BRIEF.md');
const brief = existsSync(briefPath) ? read(briefPath) : '';
const rawModeCount = (brief.match(/^Deployment mode:/gim) || []).length;
const modeLines = [...brief.matchAll(/^Deployment mode:\s*(production|staging|demo)\s*$/gim)].map(m => m[1].toLowerCase());
let mode = 'production';
if (rawModeCount === 1 && modeLines.length === 1) {
  mode = modeLines[0];
  pass('deployment-mode');
} else if (rawModeCount === 0) {
  fail('deployment-mode', 'design/BRIEF.md has no "Deployment mode:" line — failing closed to production semantics');
} else {
  fail('deployment-mode', `expected exactly one well-formed "Deployment mode:" line, found ${rawModeCount} occurrence(s) of which ${modeLines.length} valid — failing closed to production semantics`);
}
const production = mode === 'production';

// ---- Fabricated-proof tag: demo/staging-only.
{
  const hits = files.flatMap(p => read(p).includes('UNVERIFIED-PROOF') ? [rel(p)] : []);
  if (hits.length && production) fail('unverified-proof', `UNVERIFIED-PROOF on a production build: ${hits.join(', ')}`);
  else pass('unverified-proof');
}

// ---- Proof store: on production every record must be status:"verified" AND permission:"confirmed",
// fail-closed: a record missing its status counts as unverified, and any proof/testimonial/review
// data module under data/ or content/ is in scope, not just the canonical filename.
{
  const bad = [];
  const storeRe = /(^|\/)(data|content)\/[^/]*(proof|testimonial|review)[^/]*\.(ts|mjs|json)$/i;
  const stores = files.filter(f => storeRe.test(rel(f)));
  for (const p of stores) {
    const src = read(p);
    const statuses = [...src.matchAll(/["']?status["']?\s*:\s*["'](\w+)["']/g)].map(m => m[1]);
    const permissions = [...src.matchAll(/["']?permission["']?\s*:\s*["'](\w+)["']/g)].map(m => m[1]);
    const quoteCount = (src.match(/["']?quote["']?\s*:/g) || []).length;
    for (const s of statuses) if (s !== 'verified') bad.push(`${rel(p)}: status "${s}"`);
    for (const pm of permissions) if (pm !== 'confirmed') bad.push(`${rel(p)}: permission "${pm}" — no confirmed right to publish`);
    if (quoteCount > statuses.length) bad.push(`${rel(p)}: ${quoteCount - statuses.length} record(s) missing status — fail-closed as unverified`);
    if (quoteCount > permissions.length) bad.push(`${rel(p)}: ${quoteCount - permissions.length} record(s) missing permission — fail-closed as unconfirmed`);
  }
  if (bad.length && production) fail('proof-store', `proof records unfit for production: ${bad.join('; ')}`);
  else if (stores.length === 0) console.log('skip  [proof-store] no proof/testimonial/review store under data/ or content/ — a CMS-backed store is not machine-checkable here; ship verifies it by hand');
  else pass('proof-store');
}

// ---- Material claims: unconfirmed material facts never reach production.
{
  const hits = [...brief.matchAll(/^.*material,\s*unconfirmed.*$/gim)].map(m => m[0].trim());
  if (hits.length && production) fail('material-claims', `unconfirmed material claims in BRIEF.md: ${hits.length} (first: "${hits[0].slice(0, 80)}")`);
  else pass('material-claims');
}

// ---- Secrets: ship's greppable patterns; .env.example is the one placeholder-shaped file allowed.
{
  const SECRET = /sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+|re_[A-Za-z0-9]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY|:\/\/[^/@\s"']+:[^@\s"']+@/;
  const hits = secretScanFiles.filter(p => !/\.env\.example$/.test(p) && SECRET.test(read(p))).map(rel);
  if (hits.length) fail('secrets', `secret-shaped values in tracked source: ${hits.join(', ')} — rotate first, then purge`);
  else pass('secrets');
}

// ---- NEXT_PUBLIC_ never fronts a secret.
{
  const hits = [];
  for (const p of files) {
    for (const m of read(p).matchAll(/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PRIVATE|SERVICE_ROLE|WEBHOOK|API_KEY)[A-Z0-9_]*/g)) {
      hits.push(`${rel(p)}: ${m[0]}`);
    }
  }
  if (hits.length) fail('next-public', `secret-suffixed NEXT_PUBLIC_ keys (published to every visitor): ${hits.join('; ')}`);
  else pass('next-public');
}

// ---- .env.example completeness: every key the code reads is documented.
{
  const used = new Set();
  for (const p of files) {
    for (const m of read(p).matchAll(/process\.env(?:\.([A-Z0-9_]+)|\[["']([A-Z0-9_]+)["']\])/g)) {
      used.add(m[1] ?? m[2]);
    }
  }
  used.delete('NODE_ENV');
  const examplePath = join(site, '.env.example');
  const documented = new Set(
    existsSync(examplePath)
      ? [...read(examplePath).matchAll(/^([A-Z0-9_]+)=/gm)].map(m => m[1])
      : [],
  );
  const missing = [...used].filter(k => !documented.has(k));
  if (missing.length) fail('env-example', `keys read by code but absent from .env.example: ${missing.join(', ')}`);
  else pass('env-example');
}

// ---- Anti-slop absolutes (the deterministic half of the taste banned list).
{
  const SLOP = [
    [/from-(purple|violet|fuchsia)-[0-9]+.*to-(blue|indigo|violet)-[0-9]+/, 'purple-to-blue gradient — the AI-slop signature'],
    [/bg-clip-text.*text-transparent.*bg-gradient|bg-gradient.*bg-clip-text.*text-transparent/, 'gradient headline text as a default move'],
    [/[Ll]orem ipsum/, 'lorem ipsum'],
    [/placeholder\.com|placehold\.it|via\.placeholder/, 'placeholder image service'],
    [/href="#"/, 'dead href="#"'],
    [/>Feature [0-9]</, 'stock "Feature N" copy'],
    [/Elevate your|Unlock the power|Empower your|Welcome to our/i, 'dead startup copy'],
    [/★★★★★|Happy Customer|John D\./, 'fabricated-proof tell'],
    [/✨|🚀|🎉/u, 'emoji in production copy'],
  ];
  const hits = [];
  for (const p of files) {
    const src = read(p);
    for (const [re, label] of SLOP) if (re.test(src)) hits.push(`${rel(p)}: ${label}`);
  }
  if (hits.length) fail('anti-slop', hits.join('; '));
  else pass('anti-slop');
}

console.log(`\n${fails ? `${fails} check(s) FAILED` : 'all checks passed'} — mode: ${mode}${production ? '' : ' (sample proof lawful, production checks relaxed accordingly)'}`);
process.exit(fails ? 1 : 0);
