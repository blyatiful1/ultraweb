// Self-test for scripts/split-references.mjs — the splitter rewrites SKILL.md files in
// place, so its two load-bearing promises get proved on synthetic markdown, in memory,
// before it is ever pointed at the corpus: it is idempotent (a section that already IS the
// stub is left alone), it loses no line, and a fenced `## ` sample is content, not a heading.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { splitSkill, sections, STUBS } from '../scripts/split-references.mjs';

// The shape every corpus SKILL.md shares above the split point.
const HEAD = [
  '---',
  'name: demo',
  'description: A demo skill used only by this test.',
  '---',
  '',
  '# Demo',
  '',
  '**Stage:** Foundation — after tokens.',
  '',
  '## Rules',
  '',
  'One decision per line.',
  '',
].join('\n');

test('a skill already carrying both stubs is left byte-identical', () => {
  const src = `${HEAD}## Worked example — one build, traced

${STUBS.example}

## Composes with

${STUBS.composes}
`;
  const { next, moved } = splitSkill(src);
  assert.equal(next, src);
  assert.deepEqual(moved, {});
});

test('inline bodies move out, stubs move in, and no line is lost', () => {
  const src = `${HEAD}## Worked example — one build, traced

Kaffeewerk Ost, 40 minutes: brief to direction to three mockups.

- The client picked candidate B on the second round.

## Composes with

- \`tokens\` — compiles what this skill decides.
- \`taste\` — the constitution both answer to.
`;
  const { next, moved } = splitSkill(src);
  assert.match(moved.example, /^## Worked example — one build, traced\n/);
  assert.match(moved.example, /Kaffeewerk Ost, 40 minutes/);
  assert.match(moved.example, /picked candidate B on the second round/);
  assert.match(moved.composes, /^## Composes with\n/);
  assert.match(moved.composes, /compiles what this skill decides/);
  assert.ok(next.includes(STUBS.example) && next.includes(STUBS.composes), 'both stubs land in SKILL.md');
  assert.ok(!next.includes('Kaffeewerk Ost'), 'the example body leaves SKILL.md');
  // Conservation: every non-blank source line survives in SKILL.md or a moved body.
  const survivors = `${next}\n${Object.values(moved).join('\n')}`;
  assert.deepEqual(src.split('\n').filter((l) => l.trim() && !survivors.includes(l)), []);
});

test('a "## " line inside a fence is a sample, not a section boundary', () => {
  const src = `${HEAD}## Worked example — one build, traced

\`\`\`md
## Composes with

A fenced sample of the heading, not a real section.
\`\`\`

Prose after the fence.
`;
  assert.deepEqual(
    sections(src.split('\n')).map((s) => s.heading),
    [null, '## Rules', '## Worked example — one build, traced'],
  );
  const { next, moved } = splitSkill(src);
  assert.equal(moved.composes, undefined, 'the fenced heading must not be split out');
  assert.match(moved.example, /A fenced sample of the heading, not a real section\./);
  assert.match(moved.example, /^## Worked example/);
  assert.ok(next.includes(STUBS.example));
});

test('a moved last section leaves exactly one trailing newline', () => {
  const src = `${HEAD}## Composes with

- \`taste\` — the constitution this skill answers to.
`;
  const { next, moved } = splitSkill(src);
  assert.match(moved.composes, /the constitution this skill answers to/);
  assert.ok(next.endsWith(`${STUBS.composes}\n`), `tail: ${JSON.stringify(next.slice(-60))}`);
  assert.match(next, /[^\n]\n$/, 'no blank line before EOF');
});
