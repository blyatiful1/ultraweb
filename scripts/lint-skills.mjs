#!/usr/bin/env node
// lint-skills.mjs — enforces the corpus invariants that used to live in the author's memory.
// Usage: node scripts/lint-skills.mjs [corpus-root]   (exit 1 on any FAIL; WARNs never fail the run)
// The optional corpus-root argument exists for the self-test (tests/lint-skills.test.mjs),
// which runs this linter against deliberately broken copies to prove it still catches breakage.
// Dependency-free, no network.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = process.argv[2] ? resolve(process.argv[2]) : join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so a Windows checkout (core.autocrlf) lints identically to CI.
const read = p => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');

let fails = 0, warns = 0;
const fail = m => { fails++; console.log(`FAIL  ${m}`); };
const warn = m => { warns++; console.log(`warn  ${m}`); };

const skillDirs = readdirSync(join(root, 'skills')).filter(d => statSync(join(root, 'skills', d)).isDirectory()).sort();
const expectedCount = skillDirs.length + 1; // specialists + the root orchestrator

// ---- 1. Frontmatter: exactly name + description, name === dirname, sane description length
for (const d of skillDirs) {
  const p = `skills/${d}/SKILL.md`;
  if (!existsSync(join(root, p))) { fail(`${p} missing`); continue; }
  const src = read(p);
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { fail(`${p}: no frontmatter block`); continue; }
  const keys = [...fm[1].matchAll(/^([a-zA-Z-]+):/gm)].map(m => m[1]);
  if (keys.join(',') !== 'name,description') fail(`${p}: frontmatter keys are [${keys}], expected exactly [name, description]`);
  const name = fm[1].match(/^name:\s*(\S+)/m)?.[1];
  if (name !== d) fail(`${p}: frontmatter name "${name}" !== directory "${d}"`);
  const desc = fm[1].match(/^description:\s*([\s\S]*?)(?=^\S|$(?![\s\S]))/m)?.[1]?.replace(/\s+/g, ' ').trim() ?? '';
  if (desc.length > 1300) fail(`${p}: description ${desc.length} chars (>1300)`);
  else if (desc.length > 1000) warn(`${p}: description ${desc.length} chars (>1000 — consider trimming)`);
  if (!/\*\*Stage:\*\*/.test(src)) fail(`${p}: missing the **Stage:** line`);
}

// ---- 2. Every ultraweb:<slug> reference resolves
const mdFiles = ['SKILL.md', 'README.md', 'ROSTER.md', 'STACK.md', 'CAST.md',
  ...skillDirs.map(d => `skills/${d}/SKILL.md`),
  ...readdirSync(join(root, 'agents')).map(f => `agents/${f}`)]
  .filter(p => existsSync(join(root, p)));
for (const p of mdFiles) {
  for (const m of read(p).matchAll(/ultraweb:([a-z0-9-]+)/g)) {
    if (!skillDirs.includes(m[1])) fail(`${p}: reference "ultraweb:${m[1]}" resolves to no skills/ directory`);
  }
}

// ---- 3. Count claims agree everywhere ("<N> skills" prose + README badge)
const countFiles = ['README.md', 'ROSTER.md', 'SKILL.md', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json'];
for (const p of countFiles) {
  if (!existsSync(join(root, p))) continue;
  for (const m of read(p).matchAll(/(\d+)\s+(?:interlocking\s+)?skills/gi)) {
    const n = Number(m[1]);
    if (n > 20 && n !== expectedCount) fail(`${p}: claims "${m[0]}" but the corpus is ${expectedCount} (${skillDirs.length} specialists + root)`);
  }
}
const badge = read('README.md').match(/skills-(\d+)-/);
if (badge && Number(badge[1]) !== expectedCount) fail(`README.md: badge says ${badge[1]} skills, corpus is ${expectedCount}`);

// ---- 4. Every skill dir appears in ROSTER.md and README's studio-floor table
const roster = read('ROSTER.md'), readme = read('README.md');
for (const d of skillDirs) {
  if (!roster.includes(`**${d}**`)) fail(`ROSTER.md: skill "${d}" has no roster entry`);
  if (!readme.includes(`\`${d}\``)) fail(`README.md: skill "${d}" missing from the studio-floor table`);
}

// ---- 5. Agent model pins match the routing table's story
for (const [agent, model] of [['design-judge', 'opus'], ['pixel-qa', 'sonnet'], ['stack-doctor', 'opus']]) {
  const src = read(`agents/${agent}.md`);
  if (!new RegExp(`^model:\\s*${model}$`, 'm').test(src)) fail(`agents/${agent}.md: model pin is not "${model}"`);
}

// ---- 6. references/ pointers resolve
for (const d of skillDirs) {
  const src = read(`skills/${d}/SKILL.md`);
  for (const m of src.matchAll(/references\/([a-zA-Z0-9._-]+\.md)/g)) {
    if (!existsSync(join(root, 'skills', d, 'references', m[1]))) fail(`skills/${d}: points at references/${m[1]} which does not exist`);
  }
}

// ---- 7. No bare package-version literals creeping into prose (versions live in stack/versions.json)
const versionProseFiles = [...skillDirs.map(d => `skills/${d}/SKILL.md`), 'STACK.md', 'README.md'].filter(p => existsSync(join(root, p)));
for (const p of versionProseFiles) {
  for (const m of read(p).matchAll(/\b(next|tailwindcss|tailwind|shadcn|motion|zod|stripe|drizzle-orm|drizzle-kit|better-auth|resend|animejs|three|content-collections)[@ ]v?(\d+\.\d+\.\d+)/gi)) {
    warn(`${p}: bare version "${m[0]}" — numbers belong in stack/versions.json`);
  }
}

// ---- 8. Worked example presence + CAST.md client
const cast = existsSync(join(root, 'CAST.md')) ? read('CAST.md') : '';
const clients = [...cast.matchAll(/^## (?!Known)(.+)$/gm)].map(m => m[1].trim());
for (const d of skillDirs) {
  const src = read(`skills/${d}/SKILL.md`);
  const we = src.match(/^## Worked example[^\n]*/m);
  if (!we) { if (!['taste', 'award-canon'].includes(d)) warn(`skills/${d}: no ## Worked example section`); continue; }
  if (clients.length && !clients.some(c => we[0].includes(c.split(' (')[0]))) warn(`skills/${d}: worked example "${we[0].slice(3, 80)}" names no CAST.md client`);
}

// ---- 9. stack manifest freshness
const manifest = JSON.parse(read('stack/versions.json'));
const age = Math.floor((Date.now() - new Date(manifest.verified)) / 86400000);
if (age > 30) warn(`stack/versions.json: verified ${manifest.verified} is ${age} days old (>30) — run scripts/verify-stack.mjs`);

console.log(`\n${fails} failure(s), ${warns} warning(s) across ${skillDirs.length} skills (+ root = ${expectedCount}).`);
process.exit(fails ? 1 : 0);
