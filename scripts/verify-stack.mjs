#!/usr/bin/env node
// verify-stack.mjs — checks stack/versions.json against the live npm registry.
// Usage:
//   node scripts/verify-stack.mjs                      # report; exit 1 on drift, UNREACHABLE, or anomalies
//   node scripts/verify-stack.mjs --write              # fold patch/minor drift, stamp 'verified' — refuses on UNREACHABLE/anomalies
//   node scripts/verify-stack.mjs --write --allow-major  # also fold majors; the flag is an acknowledgement that the
//                                                        # affected STACK.md API facts get re-verified NOW
// Test seam: ULTRAWEB_NPM_SHIM=<script.mjs> routes lookups through `node <script> view <spec> version`
// so the drift POLICY is testable on every OS without npm or network (tests/verify-stack.test.mjs).
// Dependency-free. Requires registry access unless shimmed.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`verify-stack.mjs: compare stack/versions.json with the live npm registry.

Usage:
  node scripts/verify-stack.mjs                         report; exit 1 on drift, UNREACHABLE or anomalies
  node scripts/verify-stack.mjs --write                 fold patch/minor drift and stamp 'verified'
  node scripts/verify-stack.mjs --write --allow-major   also fold major jumps (re-verify STACK.md API facts first)
  node scripts/verify-stack.mjs --help                  this text

Exit codes: 0 all pins match (or --write succeeded), 1 drift, unreachable package or anomaly.
Env: ULTRAWEB_NPM_SHIM=<script.mjs> routes registry lookups through a stub (used by tests).`);
  process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'stack', 'versions.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const write = process.argv.includes('--write');
const allowMajor = process.argv.includes('--allow-major');

const ageDays = Math.floor((Date.now() - new Date(manifest.verified)) / 86400000);
console.log(`stack/versions.json verified ${manifest.verified} (${ageDays} days ago)${ageDays > 30 ? ' — STALE (>30d)' : ''}\n`);

// On Windows npm is a .cmd shim, which Node refuses to execFile without a shell (EINVAL, CVE-2024-27980 hardening).
const shim = process.env.ULTRAWEB_NPM_SHIM;
function npmView(spec) {
  const out = shim
    ? execFileSync(process.execPath, [shim, 'view', spec, 'version'], { encoding: 'utf8', timeout: 30000 })
    : execFileSync('npm', ['view', spec, 'version'], { encoding: 'utf8', timeout: 30000, shell: process.platform === 'win32' });
  return out.trim();
}

// Semver comparison including prereleases: 1.0.0-rc.6 < 1.0.0, rc.2 < rc.10, rc < rc.1.
function parse(v) {
  const [core, pre = ''] = v.replace(/\+.*$/, '').split(/-(.*)/s);
  return { n: core.split('.').map(Number), pre: pre ? pre.split('.') : [] };
}
const cmp = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if ((x.n[i] || 0) !== (y.n[i] || 0)) return (x.n[i] || 0) < (y.n[i] || 0) ? -1 : 1;
  if (!x.pre.length && !y.pre.length) return 0;
  if (!x.pre.length) return 1;
  if (!y.pre.length) return -1;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const [p, q] = [x.pre[i], y.pre[i]];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    if (p === q) continue;
    const [pn, qn] = [/^\d+$/.test(p), /^\d+$/.test(q)];
    if (pn && qn) return Number(p) < Number(q) ? -1 : 1;
    if (pn !== qn) return pn ? -1 : 1;
    return p < q ? -1 : 1;
  }
  return 0;
};
const major = v => v.split('.')[0];

let drift = 0, unreachable = 0, majors = 0, anomalies = 0;
const rows = [];
for (const [pkg, pinned] of Object.entries(manifest.packages)) {
  let live;
  try {
    live = npmView(pkg);
  } catch {
    unreachable++;
    rows.push([pkg, pinned, 'UNREACHABLE', '?']);
    continue;
  }
  if (live === pinned) { rows.push([pkg, pinned, live, 'ok']); continue; }
  // The pinned version must at least EXIST — a 404 pin is a manifest identity error, not drift.
  let pinExists = true;
  try { pinExists = npmView(`${pkg}@${pinned}`) !== ''; } catch { pinExists = false; }
  if (!pinExists) { anomalies++; rows.push([pkg, pinned, live, 'NONEXISTENT PIN']); continue; }
  if (cmp(live, pinned) < 0) { anomalies++; rows.push([pkg, pinned, live, 'DOWNGRADE?!']); continue; }
  drift++;
  const majorJump = major(live) !== major(pinned);
  if (majorJump) majors++;
  rows.push([pkg, pinned, live, majorJump ? 'MAJOR DRIFT' : 'drift']);
  if (write && (!majorJump || allowMajor)) manifest.packages[pkg] = live;
}

// locked-to pairs move together: whatever happened above, re-sync the follower to its anchor.
for (const [pkg, rule] of Object.entries(manifest.pins ?? {})) {
  const anchor = typeof rule === 'string' && rule.startsWith('locked-to:') ? rule.slice('locked-to:'.length) : null;
  if (!anchor || !manifest.packages[anchor]) continue;
  if (manifest.packages[pkg] !== manifest.packages[anchor]) {
    if (write) {
      manifest.packages[pkg] = manifest.packages[anchor];
      rows.push([pkg, manifest.packages[pkg], manifest.packages[anchor], `re-synced to ${anchor}`]);
    } else {
      anomalies++;
      rows.push([pkg, manifest.packages[pkg], manifest.packages[anchor], `LOCKED-TO ${anchor} VIOLATED`]);
    }
  }
}

// majorPins: the pinned CLI major must still be the live latest major.
for (const [pkg, major] of Object.entries(manifest.majorPins ?? {})) {
  if (pkg === '$comment') continue;
  let live;
  try { live = npmView(pkg); } catch { unreachable++; rows.push([`${pkg} (majorPin)`, major, 'UNREACHABLE', '?']); continue; }
  const liveMajor = major(live);
  if (liveMajor !== major) { majors++; drift++; rows.push([`${pkg} (majorPin)`, major, live, 'MAJORPIN DRIFT — bump by hand after checking the CLI changelog']); }
  else rows.push([`${pkg} (majorPin)`, major, live, 'ok']);
}

const w = Math.max(...rows.map(r => r[0].length));
for (const r of rows) console.log(r[0].padEnd(w + 2) + String(r[1]).padEnd(12) + String(r[2]).padEnd(12) + r[3]);

if (write) {
  if (unreachable) {
    console.log(`\nREFUSING --write: ${unreachable} package(s) UNREACHABLE — an unverified manifest is never stamped verified.`);
    process.exit(1);
  }
  if (anomalies) {
    console.log(`\nREFUSING --write: ${anomalies} anomaly(ies) (nonexistent pin / live below pin) — a manifest identity error to fix by hand; auto-folding would launder it.`);
    process.exit(1);
  }
  manifest.verified = new Date().toISOString().slice(0, 10);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  if (majors && !allowMajor) {
    console.log(`\nManifest updated (patch/minor only), verified stamped ${manifest.verified}. ${majors} MAJOR(s) left pinned — fold with --allow-major ONLY after re-verifying the affected STACK.md API facts against the new major.`);
  } else {
    console.log(`\nManifest updated, verified stamped ${manifest.verified}.`);
    if (majors) console.log('MAJOR(s) folded under --allow-major: re-verify the affected STACK.md API facts NOW — the flag is an acknowledgement, not a shortcut.');
  }
} else if (drift || unreachable || anomalies) {
  if (drift) console.log(`\n${drift} package(s) drifted. Re-run with --write to fold patch/minor (majors need --allow-major after a STACK.md re-verify).`);
  if (unreachable) console.log(`${unreachable} package(s) UNREACHABLE — that is an unverified state, never a match. Check network/registry and re-run.`);
  if (anomalies) console.log(`${anomalies} anomaly(ies): a NONEXISTENT PIN or a live version BELOW the pin — investigate by hand, never auto-fold.`);
  process.exit(1);
} else {
  console.log('\nAll pinned versions match the live registry.');
}
