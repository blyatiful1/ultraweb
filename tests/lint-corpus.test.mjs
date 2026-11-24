// Tests for scripts/lint-corpus.mjs on small temp fixtures (never the real corpus).
// Run: node --test tests/lint-corpus.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lint = join(root, 'scripts', 'lint-corpus.mjs');

const skill = (name, desc = `Use for ${name}.`) => `---\nname: ${name}\ndescription: "${desc}"\n---\n\n# ${name}\n`;

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'ultraweb-lint-'));
  const put = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); };
  put('SKILL.md', skill('ultraweb', 'Build a website through a guided design session.') + 'Read `references/taste.md` and run `<plugin>/scripts/gates.mjs`.\n');
  put('skills/iterate/SKILL.md', skill('iterate'));
  put('skills/retrofit/SKILL.md', skill('retrofit'));
  put('skills/gates/SKILL.md', skill('gates') + 'See references/gates.md and scripts/measure/*.mjs and `references/<file>.md`.\n');
  put('references/taste.md', '# taste\n\nPurpose.\n\nNext.js App Router, versions per `stack/versions.json`. Motion 0.3 s fades.\n');
  put('references/gates.md', '# gates\n\nUse ultraweb:gates or ultraweb:ultraweb. The `<project>/scripts/build.sh` of a site is not ours.\n');
  put('scripts/gates.mjs', '');
  put('scripts/measure/axe.mjs', '');
  put('agents/design-judge.md', '---\nname: design-judge\ndescription: critic\n---\nReads references/taste.md.\n');
  put('STACK.md', '# Stack\n\nVersions live in stack/versions.json.\n');
  put('stack/versions.json', JSON.stringify({ packages: { next: '16.3.3', motion: '13.1.1', '@types/three': '0.185.1', three: '0.185.1' } }));
  return { dir, put, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function run(dir, extra = []) {
  const r = spawnSync(process.execPath, [lint, '--root', dir, ...extra], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
}

function expectFinding(mutate, rule, pattern) {
  const f = fixture();
  try {
    mutate(f);
    const r = run(f.dir);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, new RegExp(`\\[${rule}\\]`), r.out);
    if (pattern) assert.match(r.out, pattern, r.out);
  } finally { f.cleanup(); }
}

test('a clean fixture passes', () => {
  const f = fixture();
  try { const r = run(f.dir); assert.equal(r.code, 0, r.out); assert.match(r.out, /clean/); } finally { f.cleanup(); }
});

test('--help prints usage and exits 0', () => {
  const r = spawnSync(process.execPath, [lint, '--help'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage: node scripts\/lint-corpus\.mjs/);
});

test('an unknown argument exits 2', () => {
  assert.equal(spawnSync(process.execPath, [lint, '--bogus'], { encoding: 'utf8' }).status, 2);
});

test('a missing required skill fails', () => {
  expectFinding((f) => unlinkSync(join(f.dir, 'skills/gates/SKILL.md')), 'skills', /skills\/gates\/SKILL\.md:1: .*missing/);
});

test('a wrong name fails', () => {
  expectFinding((f) => f.put('skills/iterate/SKILL.md', skill('iterate-v2')), 'skills', /name must be "iterate"/);
});

test('an unquoted description (strict-YAML unsafe) fails', () => {
  expectFinding((f) => f.put('skills/iterate/SKILL.md', '---\nname: iterate\ndescription: Change a site: one thing\n---\n'), 'skills', /skills\/iterate\/SKILL\.md:3:.*double-quoted/);
});

test('a multi-line or folded description fails', () => {
  expectFinding((f) => f.put('skills/iterate/SKILL.md', '---\nname: iterate\ndescription: >\n  folded text\n---\n'), 'skills');
});

test('an unescaped inner quote fails', () => {
  expectFinding((f) => f.put('skills/iterate/SKILL.md', '---\nname: iterate\ndescription: "say "hi" now"\n---\n'), 'skills');
});

test('escaped quotes are allowed', () => {
  const f = fixture();
  try {
    f.put('skills/iterate/SKILL.md', skill('iterate', 'Say \\"hi\\" to a site.'));
    const r = run(f.dir);
    assert.equal(r.code, 0, r.out);
  } finally { f.cleanup(); }
});

test('extra frontmatter keys fail', () => {
  expectFinding((f) => f.put('skills/retrofit/SKILL.md', '---\nname: retrofit\ndescription: "x"\nmodel: opus\n---\n'), 'skills', /unexpected frontmatter line/);
});

test('a description over 400 chars fails', () => {
  expectFinding((f) => f.put('skills/retrofit/SKILL.md', skill('retrofit', 'a'.repeat(401))), 'skills', /401 chars \(max 400\)/);
});

test('descriptions over 1400 chars in total fail', () => {
  expectFinding((f) => {
    for (const n of ['iterate', 'retrofit', 'gates']) f.put(`skills/${n}/SKILL.md`, skill(n, 'b'.repeat(390)));
    f.put('SKILL.md', skill('ultraweb', 'c'.repeat(390)));
  }, 'skills', /descriptions total 1560 chars/);
});

test('a stray SKILL.md fails', () => {
  expectFinding((f) => f.put('skills/taste/SKILL.md', skill('taste')), 'stray-skill', /skills\/taste\/SKILL\.md/);
});

test('a missing referenced path fails with file:line', () => {
  expectFinding((f) => appendFileSync(join(f.dir, 'references/taste.md'), '\nSee `references/missing.md`.\n'), 'paths', /references\/taste\.md:7: .*references\/missing\.md/);
});

test('a missing <plugin>/ path and agents/ path fail', () => {
  expectFinding((f) => appendFileSync(join(f.dir, 'SKILL.md'), 'Run `<plugin>/scripts/nope.mjs` with agents/ghost.md.\n'), 'paths', /scripts\/nope\.mjs[\s\S]*agents\/ghost\.md/);
});

test('a glob whose directory is missing fails', () => {
  expectFinding((f) => appendFileSync(join(f.dir, 'agents/design-judge.md'), 'Uses evals/cases/*.json.\n'), 'paths', /evals\/cases\//);
});

test('root SKILL.md over 18500 bytes fails', () => {
  expectFinding((f) => appendFileSync(join(f.dir, 'SKILL.md'), 'x'.repeat(18500)), 'size', /SKILL\.md:1: .*max 18500/);
});

test('a reference over 26000 bytes fails', () => {
  expectFinding((f) => appendFileSync(join(f.dir, 'references/taste.md'), 'x'.repeat(26000)), 'size', /references\/taste\.md:1/);
});

test('references over 330000 bytes in total fail', () => {
  expectFinding((f) => { for (let i = 0; i < 13; i++) f.put(`references/r${i}.md`, `# r${i}\n` + 'x'.repeat(25500)); }, 'size', /references total/);
});

test('an old skill token fails; the four v2 tokens pass', () => {
  expectFinding((f) => appendFileSync(join(f.dir, 'references/gates.md'), '\nThen ultraweb:taste.\n'), 'skill-ref', /references\/gates\.md:5: .*ultraweb:taste/);
});

test('a reference with frontmatter fails', () => {
  expectFinding((f) => f.put('references/copy.md', '---\nname: copy\n---\n# copy\n'), 'frontmatter', /references\/copy\.md/);
});

test('version pins fail in references, SKILL.md and STACK.md', () => {
  expectFinding((f) => appendFileSync(join(f.dir, 'references/taste.md'), 'Install next@16.\n'), 'pins', /next@1/);
  expectFinding((f) => appendFileSync(join(f.dir, 'SKILL.md'), 'Built on Next.js 16.3.\n'), 'pins', /Next\.js 16\.3/);
  expectFinding((f) => appendFileSync(join(f.dir, 'STACK.md'), '```json\n{ "motion": "^13.1.1" }\n```\n'), 'pins', /"motion"/);
  expectFinding((f) => appendFileSync(join(f.dir, 'references/taste.md'), 'Pin @types/three@0.185 exactly.\n'), 'pins', /@types\/three@0/);
  expectFinding((f) => appendFileSync(join(f.dir, 'skills/gates/SKILL.md'), 'Motion 13.1 changed it.\n'), 'pins', /Motion 13\.1/);
});

test('durations and package mentions without versions are not pins', () => {
  const f = fixture();
  try {
    appendFileSync(join(f.dir, 'references/taste.md'), 'Motion 0.3s ease. three columns. Next 2 steps. next/font is fine.\n');
    const r = run(f.dir);
    assert.equal(r.code, 0, r.out);
  } finally { f.cleanup(); }
});
