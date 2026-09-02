#!/usr/bin/env node
// context-budget.mjs — what the Lead pays in skill prose for one standard build, per phase.
// Usage: node scripts/context-budget.mjs [--json] [corpus-root]      (exit 1 on any FAIL)
//
// Reads the root SKILL.md's `### Phase N — … (skills: …)` headings, resolves every backticked skill
// name, and sums the SKILL.md bytes the Lead loads per phase (references/ files are listed beside
// them as NOT loaded — that is the whole point of progressive disclosure). Fails when a Phase line
// names a skill that does not exist, when a measurement gate other than gate-visual sneaks back into
// a Phase line (they are gate-runner material), when the standard-set total exceeds the ceiling, or
// when a §Context discipline anchor the pipeline depends on is missing. Dependency-free, no network.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const rootArg = argv.find(a => !a.startsWith('--'));
const root = rootArg ? resolve(rootArg) : join(dirname(fileURLToPath(import.meta.url)), '..');

// Standard-set ceiling: root SKILL.md + every SKILL.md a standard build loads (Phase-line skills + ALWAYS).
// Measured after the v1.9.0 context diet and rounded up ~10%; raise it only with a docs/ note saying why.
export const CEILING_BYTES = 545_000;
const ALWAYS = ['taste', 'status']; // invoked from body text, not a Phase heading: the constitution, and the PROGRESS.md owner
// Named in a Phase heading but loaded only when the brief demands them ("if", "whenever", "as needed", "only if").
// The ceiling applies to the CORE set (everything a plain standard brochure build loads); the full Phase-line set is reported beside it.
const CONDITIONAL = new Set(['assets', 'theme-worlds', 'cart', 'product-detail', 'command-palette', 'marginalia',
  'server-actions', 'api-design', 'database', 'auth', 'email', 'payments', 'content-cms', 'storage', 'analytics', 'consent',
  'physics', 'showpiece', 'set-design', 'animejs', 'hidden-craft', 'i18n', 'print-craft']);
const BYTES_PER_TOKEN = 3.9; // measured on this corpus (docs/context-telemetry-2026-09-01.md)
const ANCHORS = ['Seven hard rules', '`gate-runner`', 'production server of record', 'PASS-ON-MEASURED', 'CONTEXT-HANDOFF.md', 'rerunOnly', 'ULTRAWEB_SHELL_WRITE_OK=1'];

const size = p => (existsSync(p) ? statSync(p).size : 0);
const read = p => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');
const tokens = b => Math.round(b / BYTES_PER_TOKEN);

let fails = 0;
const fail = m => { fails++; if (!asJson) console.log(`FAIL  ${m}`); };

const skillDirs = readdirSync(join(root, 'skills')).filter(d => statSync(join(root, 'skills', d)).isDirectory()).sort();
const gates = skillDirs.filter(d => d.startsWith('gate-'));
const skillBytes = d => size(join(root, 'skills', d, 'SKILL.md'));
const refBytes = d => {
  const dir = join(root, 'skills', d, 'references');
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter(f => f.endsWith('.md')).reduce((n, f) => n + size(join(dir, f)), 0);
};

const rootSrc = read('SKILL.md');
const rootBytes = Buffer.byteLength(rootSrc);
const phases = [];
for (const m of rootSrc.matchAll(/^### Phase ([\d.]+) — (.+)$/gm)) {
  const heading = m[2];
  const paren = heading.match(/\((.*)\)\s*$/);
  const names = [...new Set([...(paren ? paren[1] : '').matchAll(/`([a-z0-9-]+)`/g)].map(x => x[1]))];
  for (const n of names) {
    if (!skillDirs.includes(n)) fail(`Phase ${m[1]}: names \`${n}\` which is no skills/ directory`);
    else if (gates.includes(n) && n !== 'gate-visual') fail(`Phase ${m[1]}: names \`${n}\` — measurement gates run through gate-runner and must not be loaded by the Lead`);
  }
  const loaded = names.filter(n => skillDirs.includes(n));
  phases.push({
    phase: m[1],
    title: heading.replace(/\s*\(.*\)\s*$/, ''),
    skills: loaded,
    skillBytes: loaded.reduce((n, d) => n + skillBytes(d), 0),
    refBytes: loaded.reduce((n, d) => n + refBytes(d), 0),
  });
}
if (!phases.length) fail('SKILL.md: no `### Phase N — …` headings found');

for (const a of ANCHORS) if (!rootSrc.includes(a)) fail(`SKILL.md: §Context discipline / Phase 11 anchor "${a}" is missing`);
for (const a of ALWAYS) if (!skillDirs.includes(a)) fail(`ALWAYS names \`${a}\` which is no skills/ directory`);

const fullSet = [...new Set([...ALWAYS, ...phases.flatMap(p => p.skills)])].filter(d => skillDirs.includes(d)).sort();
const standardSet = fullSet.filter(d => !CONDITIONAL.has(d));
const conditionalSet = fullSet.filter(d => CONDITIONAL.has(d));
for (const c of CONDITIONAL) if (!skillDirs.includes(c)) fail(`CONDITIONAL names \`${c}\` which is no skills/ directory`);
const standardSkillBytes = standardSet.reduce((n, d) => n + skillBytes(d), 0);
const standardRefBytes = standardSet.reduce((n, d) => n + refBytes(d), 0);
const standardTotal = standardSkillBytes + rootBytes;
const fullTotal = fullSet.reduce((n, d) => n + skillBytes(d), 0) + rootBytes;
if (standardTotal > CEILING_BYTES) fail(`core standard set is ${standardTotal} B (root + ${standardSet.length} SKILL.md) — over the ${CEILING_BYTES} B ceiling`);

const corpus = {
  skills: skillDirs.length,
  skillBytes: skillDirs.reduce((n, d) => n + skillBytes(d), 0),
  refBytes: skillDirs.reduce((n, d) => n + refBytes(d), 0),
  withExample: skillDirs.filter(d => existsSync(join(root, 'skills', d, 'references', 'example.md'))).length,
  withComposes: skillDirs.filter(d => existsSync(join(root, 'skills', d, 'references', 'composes.md'))).length,
  gateBytesNotLoaded: gates.filter(g => g !== 'gate-visual').reduce((n, d) => n + skillBytes(d), 0),
  rootBytes,
  rootRefBytes: existsSync(join(root, 'references')) ? readdirSync(join(root, 'references')).filter(f => f.endsWith('.md')).reduce((n, f) => n + size(join(root, 'references', f)), 0) : 0,
};

const report = {
  phases, always: ALWAYS, standardSet, conditionalSet,
  standard: { skills: standardSet.length, skillBytes: standardSkillBytes, rootBytes, total: standardTotal, tokens: tokens(standardTotal), refBytesNotLoaded: standardRefBytes, ceiling: CEILING_BYTES },
  full: { skills: fullSet.length, total: fullTotal, tokens: tokens(fullTotal) },
  corpus, fails,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('| Phase | Skills loaded | SKILL.md B | ~tokens | references/ B (not loaded) |');
  console.log('|---|---|---:|---:|---:|');
  console.log(`| root | SKILL.md | ${rootBytes} | ${tokens(rootBytes)} | ${corpus.rootRefBytes} |`);
  console.log(`| always | ${ALWAYS.map(s => `\`${s}\``).join(', ')} | ${ALWAYS.reduce((n, d) => n + skillBytes(d), 0)} | ${tokens(ALWAYS.reduce((n, d) => n + skillBytes(d), 0))} | ${ALWAYS.reduce((n, d) => n + refBytes(d), 0)} |`);
  for (const p of phases) console.log(`| ${p.phase} ${p.title} | ${p.skills.length ? p.skills.map(s => `\`${s}\``).join(', ') : '—'} | ${p.skillBytes} | ${tokens(p.skillBytes)} | ${p.refBytes} |`);
  console.log(`\nCore standard set: root + ${standardSet.length} SKILL.md = ${standardTotal} B (~${tokens(standardTotal)} tokens); ceiling ${CEILING_BYTES} B; ${standardRefBytes} B of references/ stay on disk.`);
  console.log(`Full Phase-line set (core + ${conditionalSet.length} conditional skills a brief may demand): root + ${fullSet.length} SKILL.md = ${fullTotal} B (~${tokens(fullTotal)} tokens).`);
  console.log(`Corpus: ${corpus.skills} skills, ${corpus.skillBytes} B of SKILL.md + ${corpus.refBytes} B of references/ (${corpus.withExample} example.md, ${corpus.withComposes} composes.md); ${corpus.gateBytesNotLoaded} B of measurement-gate bodies are gate-runner material.`);
  console.log(`\n${fails} failure(s).`);
}
process.exit(fails ? 1 : 0);
