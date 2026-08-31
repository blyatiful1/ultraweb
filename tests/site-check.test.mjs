// Mutation tests for scripts/site-check.mjs — prove each mechanical honesty check
// actually fails when its defect is present, against a frozen known-good site
// fixture (tests/fixtures/site-clean). This tests the deliverable contract the
// ship/gate skills cite, not just the prose corpus.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checker = join(root, 'scripts', 'site-check.mjs');
const fixture = join(root, 'tests', 'fixtures', 'site-clean');

function check(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'ultraweb-site-'));
  try {
    cpSync(fixture, dir, { recursive: true });
    if (mutate) mutate(dir);
    try {
      const out = execFileSync(process.execPath, [checker, dir], { encoding: 'utf8' });
      return { code: 0, out };
    } catch (e) {
      return { code: e.status, out: String(e.stdout ?? '') + String(e.stderr ?? '') };
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const append = (dir, file, text) => writeFileSync(join(dir, file), readFileSync(join(dir, file), 'utf8') + text);
const setBriefMode = (dir, mode) => {
  const p = join(dir, 'design', 'BRIEF.md');
  writeFileSync(p, readFileSync(p, 'utf8').replace(/^Deployment mode:.*$/m, `Deployment mode: ${mode}`));
};

test('the clean fixture passes every check', () => {
  const r = check(null);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /all checks passed/);
});

test('UNVERIFIED-PROOF fails on production, passes on demo', () => {
  const mutate = (dir) => append(dir, 'components/hero.tsx', '\n// UNVERIFIED-PROOF sample below\n');
  const prod = check(mutate);
  assert.equal(prod.code, 1);
  assert.match(prod.out, /FAIL {2}\[unverified-proof\]/);
  const demo = check((dir) => { mutate(dir); setBriefMode(dir, 'demo'); });
  assert.equal(demo.code, 0, demo.out);
});

test('a non-verified proof record fails on production', () => {
  const r = check((dir) => append(dir, 'data/proof.ts',
    '\nexport const extra = { status: "sample", quote: "Sample quote", attribution: { name: "Demo" }, source: "generated", permission: "unknown", verifiedAt: "2026-01-01" };\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[proof-store\]/);
});

test('an unconfirmed material claim in BRIEF fails on production', () => {
  const r = check((dir) => append(dir, 'design/BRIEF.md', '\n- Opens daily 08:00 — material, unconfirmed\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[material-claims\]/);
});

test('a secret-shaped value in source fails', () => {
  const r = check((dir) => append(dir, 'app/page.tsx', '\nconst k = "sk_live_' + 'x'.repeat(12) + '";\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[secrets\]/);
});

test('a secret behind NEXT_PUBLIC_ fails', () => {
  const r = check((dir) => append(dir, 'app/page.tsx', '\nconst pk = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[next-public\]/);
});

test('an env key missing from .env.example fails', () => {
  const r = check((dir) => append(dir, 'app/page.tsx', '\nconst extra = process.env.RESEND_API_KEY;\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[env-example\].*RESEND_API_KEY/);
});

test('banned-list slop fails', () => {
  const r = check((dir) => append(dir, 'components/hero.tsx', '\n// lorem ipsum dolor\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[anti-slop\]/);
});

test('permission "unknown" on a verified record fails on production', () => {
  const r = check((dir) => append(dir, 'data/proof.ts',
    '\nexport const extra = { status: "verified", quote: "Real quote, unconfirmed rights", attribution: { name: "P" }, source: "call", permission: "unknown", verifiedAt: "2026-01-01" };\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[proof-store\].*permission "unknown"/);
});

test('a record missing its status field fails closed', () => {
  const r = check((dir) => append(dir, 'data/proof.ts',
    '\nexport const extra = { quote: "No status on this one", attribution: { name: "Q" }, source: "s", permission: "confirmed", verifiedAt: "2026-01-01" };\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[proof-store\].*missing status/);
});

test('an alternate proof-store filename is still in scope', () => {
  const r = check((dir) => writeFileSync(join(dir, 'data', 'testimonials.json'),
    '[{"status":"sample","quote":"Sample in a side store","permission":"confirmed"}]\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[proof-store\].*testimonials\.json/);
});

test('an invalid mode value like demo-bogus fails closed as production', () => {
  const r = check((dir) => {
    setBriefMode(dir, 'demo-bogus');
    append(dir, 'components/hero.tsx', '\n// UNVERIFIED-PROOF\n');
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[deployment-mode\]/);
  assert.match(r.out, /FAIL {2}\[unverified-proof\]/);
  assert.match(r.out, /— mode: production/, 'fail-closed means the footer reports production semantics');
});

test('a duplicated Deployment mode line fails closed as production', () => {
  const r = check((dir) => {
    append(dir, 'design/BRIEF.md', '\nDeployment mode: demo\n');
    append(dir, 'components/hero.tsx', '\n// UNVERIFIED-PROOF\n');
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[deployment-mode\]/);
  assert.match(r.out, /FAIL {2}\[unverified-proof\]/, 'fail-closed production semantics must apply to the proof check');
  assert.match(r.out, /— mode: production/);
});

test('a committed .env.local with a live key fails the secret sweep', () => {
  const r = check((dir) => writeFileSync(join(dir, '.env.local'),
    'STRIPE_SECRET_KEY=sk_live_' + 'x'.repeat(16) + '\n'));
  assert.equal(r.code, 1);
  assert.match(r.out, /FAIL {2}\[secrets\].*\.env\.local/);
});

test('every write-time hook pattern has a site-check counterpart (parity)', () => {
  const hook = readFileSync(join(root, 'hooks', 'antislop.sh'), 'utf8');
  const checker = readFileSync(join(root, 'scripts', 'site-check.mjs'), 'utf8');
  // Each `check '<pattern>' '<label>'` row in the hook must have a SLOP twin, so the
  // write-time guard and the executable gate/ship pre-pass can't silently drift apart.
  // Keyed on a distinctive literal per hook row; extend BOTH lists together.
  const anchors = ['from-(purple|violet|fuchsia)', 'bg-clip-text', 'href="#"', 'orem ipsum', 'Feature [0-9]', 'placeholder\\.com', 'Elevate your', '🚀', 'Happy Customer'];
  for (const a of anchors) {
    assert.ok(hook.includes(a), `anchor "${a}" vanished from hooks/antislop.sh — update this parity list`);
    assert.ok(checker.includes(a), `hook pattern "${a}" has no counterpart in scripts/site-check.mjs SLOP list`);
  }
});
