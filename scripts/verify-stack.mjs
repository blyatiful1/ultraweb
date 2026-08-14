#!/usr/bin/env node
// verify-stack.mjs — checks stack/versions.json against the live npm registry.
// Usage:
//   node scripts/verify-stack.mjs           # report drift, exit 1 if any
//   node scripts/verify-stack.mjs --write   # fold drift into the manifest, stamp 'verified'
// Dependency-free. Requires network access to the npm registry.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'stack', 'versions.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const write = process.argv.includes('--write');

const ageDays = Math.floor((Date.now() - new Date(manifest.verified)) / 86400000);
console.log(`stack/versions.json verified ${manifest.verified} (${ageDays} days ago)${ageDays > 30 ? ' — STALE (>30d)' : ''}\n`);

let drift = 0;
const rows = [];
for (const [pkg, pinned] of Object.entries(manifest.packages)) {
  let live;
  try {
    live = execFileSync('npm', ['view', pkg, 'version'], { encoding: 'utf8', timeout: 30000 }).trim();
  } catch {
    rows.push([pkg, pinned, 'UNREACHABLE', '?']);
    continue;
  }
  const same = live === pinned;
  if (!same) drift++;
  const majorJump = live.split('.')[0] !== pinned.split('.')[0];
  rows.push([pkg, pinned, live, same ? 'ok' : majorJump ? 'MAJOR DRIFT' : 'drift']);
  if (write && !same) manifest.packages[pkg] = live;
}

const w = [Math.max(...rows.map(r => r[0].length)), 10, 10];
for (const r of rows) console.log(r[0].padEnd(w[0] + 2) + r[1].padEnd(12) + r[2].padEnd(12) + r[3]);

if (write) {
  manifest.verified = new Date().toISOString().slice(0, 10);
  delete manifest.observedDrift;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nManifest updated, verified stamped ${manifest.verified}.`);
  console.log('Now reconcile STACK.md prose: any API fact tied to a MAJOR-drifted package must be re-verified against its docs, not assumed.');
} else if (drift) {
  console.log(`\n${drift} package(s) drifted. Re-run with --write to fold in (then re-verify MAJOR-drifted API facts in STACK.md).`);
  process.exit(1);
} else {
  console.log('\nAll pinned versions match the live registry.');
}
