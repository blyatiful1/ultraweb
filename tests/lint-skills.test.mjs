// Self-test for scripts/lint-skills.mjs — proves the linter still catches the
// breakage classes it exists for, by running it against deliberately broken
// copies of the real corpus. A linter that only ever sees a green corpus is
// an unverified claim; this is its regression guard.
// Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lint = join(root, 'scripts', 'lint-skills.mjs');

function runLint(corpusRoot) {
  try {
    const out = execFileSync(process.execPath, [lint, ...(corpusRoot ? [corpusRoot] : [])], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout ?? '') + String(e.stderr ?? '') };
  }
}

// Copy the corpus, apply one mutation, lint it, clean up.
function lintMutated(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'ultraweb-lint-'));
  try {
    cpSync(root, dir, {
      recursive: true,
      filter: (src) => !/[\\/](\.git|node_modules|\.next|tests)([\\/]|$)/.test(src),
    });
    mutate(dir);
    return runLint(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('the real corpus lints clean', () => {
  const r = runLint(null);
  assert.equal(r.code, 0, `expected exit 0, got ${r.code}:\n${r.out}`);
});

test('catches a foreign frontmatter key', () => {
  const r = lintMutated((dir) => {
    const p = join(dir, 'skills', 'taste', 'SKILL.md');
    // \r?-agnostic so the mutation lands on both LF (CI) and CRLF (Windows) checkouts
    writeFileSync(p, readFileSync(p, 'utf8').replace(/^---\r?\n/, (m) => m + 'license: MIT\n'));
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /frontmatter keys are/);
});

test('catches an ultraweb: reference that resolves to no skill', () => {
  const r = lintMutated((dir) => {
    const p = join(dir, 'README.md');
    writeFileSync(p, readFileSync(p, 'utf8') + '\nSee ultraweb:does-not-exist for details.\n');
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /ultraweb:does-not-exist.*resolves to no skills\/ directory/);
});

test('catches a missing **Stage:** line', () => {
  const r = lintMutated((dir) => {
    const p = join(dir, 'skills', 'ship', 'SKILL.md');
    writeFileSync(p, readFileSync(p, 'utf8').replace('**Stage:**', '**Stg:**'));
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /skills\/ship\/SKILL\.md: missing the \*\*Stage:\*\* line/);
});

test('catches a wrong skill-count badge in README', () => {
  const r = lintMutated((dir) => {
    const p = join(dir, 'README.md');
    writeFileSync(p, readFileSync(p, 'utf8').replace(/skills-\d+-/, 'skills-999-'));
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /badge says 999 skills/);
});

test('catches a references/ pointer to a missing file', () => {
  const r = lintMutated((dir) => {
    rmSync(join(dir, 'skills', 'ship', 'references', 'example.md'));
  });
  assert.equal(r.code, 1);
  assert.match(r.out, /skills\/ship: points at references\/example\.md which does not exist/);
});
