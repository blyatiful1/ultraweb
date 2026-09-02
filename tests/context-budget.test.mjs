// Self-test for scripts/context-budget.mjs — the context diet is only enforced if the
// budget script still FAILS when a Phase line, an anchor, or the ceiling is broken. Each
// case mutates a throwaway copy of the real corpus, runs the script against that root, and
// asserts the exit code plus the message the Lead would read.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const budget = join(root, 'scripts', 'context-budget.mjs');

function runBudget(corpusRoot, flags = []) {
  const args = [budget, ...flags, ...(corpusRoot ? [corpusRoot] : [])];
  try {
    return { code: 0, out: execFileSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }) };
  } catch (e) {
    return { code: e.status, out: String(e.stdout ?? '') + String(e.stderr ?? '') };
  }
}

// Copy the corpus, apply one mutation, budget it, clean up.
function budgetMutated(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'ultraweb-budget-'));
  try {
    cpSync(root, dir, {
      recursive: true,
      filter: (src) => !/[\\/](\.git|node_modules|\.next|tests)([\\/]|$)/.test(src),
    });
    mutate(dir);
    return runBudget(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Phase 4 is the shortest Phase line in the pipeline — the cheapest place to plant a bad name.
function patchPhase4(dir, insert) {
  const p = join(dir, 'SKILL.md');
  const src = readFileSync(p, 'utf8');
  assert.match(src, /^### Phase 4 — .*\(skills: /m, 'fixture assumption: Phase 4 carries a (skills: …) parenthesis');
  writeFileSync(p, src.replace(/^(### Phase 4 — .*\(skills: )/m, `$1${insert}, `));
}

test('the real corpus is inside budget', () => {
  const r = runBudget(null);
  assert.equal(r.code, 0, `expected exit 0, got ${r.code}:\n${r.out}`);
});

test('catches a measurement gate named on a Phase line', () => {
  const r = budgetMutated((dir) => patchPhase4(dir, '`gate-code`'));
  assert.equal(r.code, 1);
  assert.match(r.out, /measurement gates run through gate-runner/);
});

test('catches a Phase line naming a skill that does not exist', () => {
  const r = budgetMutated((dir) => patchPhase4(dir, '`no-such-skill`'));
  assert.equal(r.code, 1);
  assert.match(r.out, /no skills\/ directory/);
});

test('catches a core skill that grew past the standard-set ceiling', () => {
  const r = budgetMutated((dir) => appendFileSync(join(dir, 'skills', 'hero', 'SKILL.md'), 'x'.repeat(600_000)));
  assert.equal(r.code, 1);
  assert.match(r.out, /over the .* ceiling/);
});

test('catches a missing §Context discipline anchor', () => {
  const r = budgetMutated((dir) => {
    const p = join(dir, 'SKILL.md');
    const src = readFileSync(p, 'utf8');
    assert.match(src, /Seven hard rules/, 'fixture assumption: §Context discipline opens on "Seven hard rules"');
    writeFileSync(p, src.replaceAll('Seven hard rules', 'Six hard rules'));
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /anchor "Seven hard rules" is missing/);
});

test('--json reports a standard total under the ceiling', () => {
  const r = runBudget(null, ['--json']);
  assert.equal(r.code, 0, `expected exit 0, got ${r.code}:\n${r.out}`);
  const report = JSON.parse(r.out);
  assert.equal(report.fails, 0);
  assert.ok(
    report.standard.total <= report.standard.ceiling,
    `standard set ${report.standard.total} B over the ${report.standard.ceiling} B ceiling`,
  );
});
