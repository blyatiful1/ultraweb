// Tests for scripts/deal.mjs — the axis dealer behind the dealt mockup candidate.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'deal.mjs');
const run = (args, env = {}) => execFileSync('node', [script, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });
const parse = (out) => Object.fromEntries(out.trim().split('\n').map((l) => l.trim().split(/\s+/)));
const AXES = ['ground', 'type', 'colour', 'layout', 'imagery', 'corners', 'density', 'motion'];

test('a seeded deal is repeatable and covers every axis', () => {
  const a = run(['--seed', '7', '--no-history']);
  const b = run(['--seed', '7', '--no-history']);
  assert.equal(a, b);
  assert.deepEqual(Object.keys(parse(a)), AXES);
});

test('--fix pins an axis and --exclude removes a value', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const d = parse(run(['--seed', String(seed), '--no-history', '--fix', 'imagery=photography', '--exclude', 'ground=dark']));
    assert.equal(d.imagery, 'photography');
    assert.notEqual(d.ground, 'dark');
  }
});

test('immersive values are dealt only on request', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const d = parse(run(['--seed', String(seed), '--no-history']));
    assert.notEqual(d.motion, '3');
    assert.notEqual(d.imagery, 'render-3d');
  }
});

test('deals differ from recent history on at least three axes', () => {
  const home = mkdtempSync(join(tmpdir(), 'uw-deal-'));
  const seen = [];
  for (let i = 0; i < 6; i++) {
    const d = parse(run(['--seed', String(100 + i)], { ULTRAWEB_HOME: home }));
    for (const prev of seen) {
      const differing = AXES.filter((k) => d[k] !== prev[k]).length;
      assert.ok(differing >= 3, `deal ${i} differs from an earlier one on only ${differing} axes`);
    }
    seen.push(d);
  }
  const stored = JSON.parse(readFileSync(join(home, 'history.json'), 'utf8'));
  assert.equal(stored.entries.length, 6);
});

test('record and recent round-trip an approved direction', () => {
  const home = mkdtempSync(join(tmpdir(), 'uw-deal-'));
  assert.match(run(['recent'], { ULTRAWEB_HOME: home }), /no approved/);
  run(['record', '--ground', 'dark', '--type', 'slab', '--layout', 'dense-index'], { ULTRAWEB_HOME: home });
  assert.match(run(['recent'], { ULTRAWEB_HOME: home }), /ground=dark type=slab layout=dense-index/);
});

test('other keys in the history file survive a deal', () => {
  const home = mkdtempSync(join(tmpdir(), 'uw-deal-'));
  writeFileSync(join(home, 'history.json'), JSON.stringify({ moments: [{ name: 'type-lines' }], entries: [] }));
  run(['--seed', '5'], { ULTRAWEB_HOME: home });
  const stored = JSON.parse(readFileSync(join(home, 'history.json'), 'utf8'));
  assert.deepEqual(stored.moments, [{ name: 'type-lines' }]);
  assert.equal(stored.entries.length, 1);
});

test('an unwritable history location does not break the deal', () => {
  // A regular file where the history directory should be: mkdir fails fast with ENOTDIR.
  const blocker = join(mkdtempSync(join(tmpdir(), 'uw-deal-')), 'not-a-dir');
  writeFileSync(blocker, 'x');
  const out = run(['--seed', '3'], { ULTRAWEB_HOME: join(blocker, 'home') });
  assert.deepEqual(Object.keys(parse(out)), AXES);
  assert.equal(existsSync(join(blocker, 'home', 'history.json')), false);
});

test('bad input exits 2 with a message', () => {
  const r = spawnSync('node', [script, '--fix', 'ground=plaid'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /not a value of ground/);
  const r2 = spawnSync('node', [script, 'record', '--ground', 'dark'], { encoding: 'utf8' });
  assert.equal(r2.status, 2);
});
