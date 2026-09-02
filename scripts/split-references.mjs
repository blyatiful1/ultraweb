#!/usr/bin/env node
// split-references.mjs — progressive disclosure, made mechanical.
// Moves a skill's inline `## Worked example …` and `## Composes with` sections into
// skills/<name>/references/example.md and references/composes.md, leaving the corpus's
// standard two-line stubs in SKILL.md. The Lead loads SKILL.md on every Skill() call and
// carries it for the rest of the session; the example and the compose map are read only
// when a build genuinely needs them — so every byte moved here is a byte the Lead never pays.
//
// Usage: node scripts/split-references.mjs [--dry-run] [--only <skill>[,<skill>…]]
// Idempotent: a section that already IS the stub is skipped. Fence-aware: a `## ` line inside
// a ``` block is content, not a heading (fenced H2 samples are a corpus-wide idiom). Before writing it
// verifies that every non-blank source line survives in SKILL.md or a reference file, and it refuses
// to touch a skill whose target reference file already exists; either case exits 1.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const dry = argv.includes('--dry-run');
const onlyIdx = argv.indexOf('--only');
const only = onlyIdx >= 0 ? argv[onlyIdx + 1].split(',') : null;

export const STUBS = {
  example: 'Moved to `references/example.md` — read only when this build\'s case is genuinely ambiguous; the sections above are the decision material.',
  composes: 'Moved to `references/composes.md` — the handoff map; load it when orchestrating this skill against its neighbors.',
};

// Split a markdown source into top-level (out-of-fence) H2 sections.
// Returns [{ heading: '## …' | null, start, end }] over line indices; the first entry is the preamble.
export function sections(lines) {
  const out = [];
  let inFence = false;
  let cur = { heading: null, start: 0 };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*```/.test(l)) inFence = !inFence;
    if (!inFence && /^## /.test(l)) {
      cur.end = i;
      out.push(cur);
      cur = { heading: l, start: i };
    }
  }
  cur.end = lines.length;
  out.push(cur);
  return out;
}

function isStub(bodyLines, kind) {
  return bodyLines.join('\n').includes(STUBS[kind]);
}

function trimBlank(arr) {
  let a = 0, b = arr.length;
  while (a < b && arr[a].trim() === '') a++;
  while (b > a && arr[b - 1].trim() === '') b--;
  return arr.slice(a, b);
}

export function splitSkill(src) {
  // Returns { next: string, moved: { example?: string, composes?: string } } without touching disk.
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const secs = sections(lines);
  const moved = {};
  const plan = [];
  for (const s of secs) {
    if (!s.heading) continue;
    const kind = /^## Worked example/.test(s.heading) ? 'example'
      : /^## Composes with/.test(s.heading) ? 'composes' : null;
    if (!kind) continue;
    const body = lines.slice(s.start + 1, s.end);
    if (isStub(body, kind)) continue;
    const content = trimBlank(body);
    if (!content.length) continue;
    moved[kind] = `${s.heading}\n\n${content.join('\n')}\n`;
    plan.push({ s, kind });
  }
  if (!plan.length) return { next: src, moved };
  // Rebuild from the bottom so earlier indices stay valid.
  let out = lines.slice();
  for (const { s, kind } of plan.sort((a, b) => b.s.start - a.s.start)) {
    const isLast = s.end === lines.length;
    const replacement = [s.heading, '', STUBS[kind], ''];
    if (isLast) replacement.pop(); // keep exactly one trailing newline at EOF
    out.splice(s.start, s.end - s.start, ...replacement);
  }
  let next = out.join('\n');
  if (!next.endsWith('\n')) next += '\n';
  return { next, moved };
}

function run() {
  const skillsDir = join(root, 'skills');
  const dirs = readdirSync(skillsDir).filter(d => statSync(join(skillsDir, d)).isDirectory()).sort();
  let movedBytes = 0, touched = 0, failures = 0;
  for (const d of dirs) {
    if (only && !only.includes(d)) continue;
    const p = join(skillsDir, d, 'SKILL.md');
    if (!existsSync(p)) continue;
    const src = readFileSync(p, 'utf8');
    const { next, moved } = splitSkill(src);
    const kinds = Object.keys(moved);
    if (!kinds.length) continue;
    touched++;
    const bytes = kinds.reduce((n, k) => n + Buffer.byteLength(moved[k]), 0);
    movedBytes += bytes;
    const line = `${d.padEnd(20)} ${kinds.join('+').padEnd(16)} ${String(bytes).padStart(6)} B  (${src.length} → ${next.length})`;
    // Conservation, checked BEFORE any write: every non-blank line of the source must survive
    // in either the new SKILL.md or one of the moved bodies (stub lines are additions, not losses).
    const survivors = next + '\n' + kinds.map(k => moved[k]).join('\n');
    const lost = src.split('\n').filter(l => l.trim() && !survivors.includes(l));
    if (lost.length) { console.log(`FAIL  ${d}: ${lost.length} line(s) would be lost, e.g. ${lost[0].slice(0, 60)}`); failures++; continue; }
    // Refuse-to-overwrite is decided for the whole skill before touching anything.
    const refDir = join(skillsDir, d, 'references');
    const clashes = kinds.filter(k => existsSync(join(refDir, `${k}.md`)));
    if (clashes.length) { console.log(`FAIL  ${d}: references/${clashes.join('.md, references/')}.md already exists — skill left untouched`); failures++; continue; }
    console.log(`${dry ? 'would split' : 'split     '}  ${line}`);
    if (dry) continue;
    mkdirSync(refDir, { recursive: true });
    for (const k of kinds) writeFileSync(join(refDir, `${k}.md`), moved[k]);
    writeFileSync(p, next);
    // Read back and re-verify from disk.
    const back = readFileSync(p, 'utf8') + '\n' + kinds.map(k => readFileSync(join(refDir, `${k}.md`), 'utf8')).join('\n');
    const lostOnDisk = src.split('\n').filter(l => l.trim() && !back.includes(l));
    if (lostOnDisk.length) { console.log(`FAIL  ${d}: ${lostOnDisk.length} line(s) missing on disk after write`); failures++; }
  }
  console.log(`\n${touched} skill(s) ${dry ? 'would be ' : ''}split, ${movedBytes} bytes ${dry ? 'would move' : 'moved'} to references/, ${failures} failure(s).`);
  process.exit(failures ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) run();
