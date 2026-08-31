// Branch tests for scripts/verify-stack.mjs drift POLICY, via the ULTRAWEB_NPM_SHIM
// seam — no npm, no network, runs identically on every OS (the Windows spawn branch
// differs only in HOW npm is invoked; the policy under test is shared).
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shim = join(root, 'tests', 'fixtures', 'fake-npm.mjs');

// verify-stack resolves the manifest relative to its own location, so give each
// case its own scripts/ + stack/ tree.
function run({ packages, registry, args = [] }) {
  const dir = mkdtempSync(join(tmpdir(), 'ultraweb-vstack-'));
  try {
    mkdirSync(join(dir, 'scripts'));
    mkdirSync(join(dir, 'stack'));
    cpSync(join(root, 'scripts', 'verify-stack.mjs'), join(dir, 'scripts', 'verify-stack.mjs'));
    const manifest = { verified: '2026-08-01', packages, pins: {}, gated: [] };
    writeFileSync(join(dir, 'stack', 'versions.json'), JSON.stringify(manifest, null, 2));
    let code = 0, out = '';
    try {
      out = execFileSync(process.execPath, [join(dir, 'scripts', 'verify-stack.mjs'), ...args], {
        encoding: 'utf8',
        env: { ...process.env, ULTRAWEB_NPM_SHIM: shim, FAKE_REGISTRY: JSON.stringify(registry) },
      });
    } catch (e) {
      code = e.status;
      out = String(e.stdout ?? '') + String(e.stderr ?? '');
    }
    const after = JSON.parse(readFileSync(join(dir, 'stack', 'versions.json'), 'utf8'));
    return { code, out, after };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('all pins matching → exit 0', () => {
  const r = run({ packages: { alpha: '1.2.3' }, registry: { alpha: '1.2.3' } });
  assert.equal(r.code, 0);
  assert.match(r.out, /All pinned versions match/);
});

test('UNREACHABLE is reported and exits 1 — never a fake match', () => {
  const r = run({ packages: { alpha: '1.2.3' }, registry: {} });
  assert.equal(r.code, 1);
  assert.match(r.out, /UNREACHABLE/);
  assert.doesNotMatch(r.out, /All pinned versions match/);
});

test('--write refuses to stamp with an UNREACHABLE package', () => {
  const r = run({ packages: { alpha: '1.2.3' }, registry: {}, args: ['--write'] });
  assert.equal(r.code, 1);
  assert.match(r.out, /REFUSING --write/);
  assert.equal(r.after.verified, '2026-08-01', 'verified date must not be restamped');
});

test('--write folds patch/minor drift and stamps verified', () => {
  const r = run({
    packages: { alpha: '1.2.3' },
    registry: { alpha: '1.3.0', 'alpha@1.2.3': '1.2.3' },
    args: ['--write'],
  });
  assert.equal(r.code, 0, r.out);
  assert.equal(r.after.packages.alpha, '1.3.0');
  assert.notEqual(r.after.verified, '2026-08-01');
});

test('--write leaves a MAJOR pinned without --allow-major', () => {
  const r = run({
    packages: { alpha: '1.2.3' },
    registry: { alpha: '2.0.0', 'alpha@1.2.3': '1.2.3' },
    args: ['--write'],
  });
  assert.equal(r.code, 0, r.out);
  assert.equal(r.after.packages.alpha, '1.2.3', 'major must not fold silently');
  assert.match(r.out, /MAJOR\(s\) left pinned/);
});

test('--write --allow-major folds the major and demands the STACK.md re-verify', () => {
  const r = run({
    packages: { alpha: '1.2.3' },
    registry: { alpha: '2.0.0', 'alpha@1.2.3': '1.2.3' },
    args: ['--write', '--allow-major'],
  });
  assert.equal(r.code, 0, r.out);
  assert.equal(r.after.packages.alpha, '2.0.0');
  assert.match(r.out, /re-verify the affected STACK\.md API facts/);
});

test('a nonexistent pin is an anomaly, and --write refuses to launder it', () => {
  const report = run({ packages: { alpha: '9.9.9' }, registry: { alpha: '1.0.0' } });
  assert.equal(report.code, 1);
  // assert the classified ROW, not the generic anomaly summary — a deleted branch
  // degrades this case to DOWNGRADE, which still prints the summary sentence
  assert.match(report.out, /^alpha\s+9\.9\.9\s+1\.0\.0\s+NONEXISTENT PIN$/m);
  assert.doesNotMatch(report.out, /DOWNGRADE/);
  const write = run({ packages: { alpha: '9.9.9' }, registry: { alpha: '1.0.0' }, args: ['--write'] });
  assert.equal(write.code, 1);
  assert.match(write.out, /REFUSING --write/);
  assert.equal(write.after.packages.alpha, '9.9.9');
});

test('a live version below the pin is a DOWNGRADE anomaly, never auto-folded', () => {
  const r = run({
    packages: { alpha: '1.5.0' },
    registry: { alpha: '1.2.0', 'alpha@1.5.0': '1.5.0' },
    args: ['--write'],
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /DOWNGRADE/);
  assert.equal(r.after.packages.alpha, '1.5.0');
});
