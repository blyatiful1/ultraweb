#!/usr/bin/env node
// lint-skills.mjs — enforces the corpus invariants that used to live in the author's memory.
// Usage: node scripts/lint-skills.mjs [corpus-root]   (exit 1 on any FAIL; WARNs never fail the run)
// The optional corpus-root argument exists for the self-test (tests/lint-skills.test.mjs),
// which runs this linter against deliberately broken copies to prove it still catches breakage.
// Dependency-free, no network.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { STUBS, sections } from './split-references.mjs';

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

// ---- 5. Agents: every bundled agent is in the routing map with its tier, and the pin matches
const AGENT_MODELS = { 'design-judge': 'opus', 'pixel-qa': 'sonnet', 'stack-doctor': 'opus', 'gate-runner': 'sonnet' };
const agentFiles = readdirSync(join(root, 'agents')).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, '')).sort();
for (const a of agentFiles) {
  const expected = AGENT_MODELS[a];
  if (!expected) { fail(`agents/${a}.md: not in the routing map (AGENT_MODELS in this linter) — add it with its tier`); continue; }
  if (!new RegExp(`^model:\\s*${expected}$`, 'm').test(read(`agents/${a}.md`))) fail(`agents/${a}.md: model pin is not "${expected}"`);
}
for (const a of Object.keys(AGENT_MODELS)) if (!agentFiles.includes(a)) fail(`agents/${a}.md: missing (the routing map names it)`);
if (agentFiles.includes('gate-runner')) {
  const tools = read('agents/gate-runner.md').match(/^tools:\n((?:[ \t]+-[ \t]+.+\n)+)/m);
  if (tools && !(/-\s+Skill\b/.test(tools[1]) && /-\s+Bash\b/.test(tools[1]))) fail('agents/gate-runner.md: a tools: list must include Skill and Bash (it loads gates with the Skill tool and runs commands)');
}
// The Lead's context budget depends on the agents' return caps staying in their files.
for (const [a, cap] of [['gate-runner', '≤400 tokens'], ['pixel-qa', '≤500 tokens'], ['design-judge', '≤700 tokens']]) {
  if (agentFiles.includes(a) && !read(`agents/${a}.md`).includes(cap)) fail(`agents/${a}.md: return cap "${cap}" missing — the Lead's context budget depends on it`);
}

// ---- 6. references/ pointers resolve (per skill, and at the repo root)
for (const d of skillDirs) {
  const src = read(`skills/${d}/SKILL.md`);
  // Bare `references/<file>.md` means THIS skill's directory; a path like <plugin>/skills/other/references/X.md is another skill's and is skipped.
  for (const m of src.matchAll(/(?<![\w/])references\/([a-zA-Z0-9._-]+\.md)/g)) {
    if (!existsSync(join(root, 'skills', d, 'references', m[1]))) fail(`skills/${d}: points at references/${m[1]} which does not exist`);
  }
}
for (const m of read('SKILL.md').matchAll(/(?<![\w/])references\/([a-zA-Z0-9._-]+\.md)/g)) {
  if (!existsSync(join(root, 'references', m[1]))) fail(`SKILL.md: points at references/${m[1]} which does not exist at the repo root`);
}
// Qualified cross-skill pointers (<plugin>/skills/<slug>/references/<file>.md) resolve against the named skill.
for (const p of mdFiles) {
  for (const m of read(p).matchAll(/skills\/([a-z0-9-]+)\/references\/([a-zA-Z0-9._-]+\.md)/g)) {
    if (!existsSync(join(root, 'skills', m[1], 'references', m[2]))) fail(`${p}: points at skills/${m[1]}/references/${m[2]} which does not exist`);
  }
}
// The README's version badge must match plugin.json — releases have shipped with it one version behind.
const pluginVersion = JSON.parse(read('.claude-plugin/plugin.json')).version;
const vbadge = read('README.md').match(/version-([\d.]+)-/);
if (vbadge && vbadge[1] !== pluginVersion) fail(`README.md: version badge says ${vbadge[1]}, plugin.json says ${pluginVersion}`);

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
  if (!we) { if (d !== 'taste') warn(`skills/${d}: no ## Worked example section`); continue; }
  if (clients.length && !clients.some(c => we[0].includes(c.split(' (')[0]))) warn(`skills/${d}: worked example "${we[0].slice(3, 80)}" names no CAST.md client`);
}

// ---- 9. stack manifest freshness
const manifest = JSON.parse(read('stack/versions.json'));
const age = Math.floor((Date.now() - new Date(manifest.verified)) / 86400000);
if (age > 30) warn(`stack/versions.json: verified ${manifest.verified} is ${age} days old (>30) — run scripts/verify-stack.mjs`);

// ---- 10. Progressive disclosure: inline Worked-example / Composes-with bodies must be the standard stub.
// The Lead carries every SKILL.md it loads for the rest of the session; examples and compose maps live in
// references/ and are read only when a build's case needs them. (taste has no example by design.)
for (const d of skillDirs) {
  if (d === 'taste') continue;
  const lines = read(`skills/${d}/SKILL.md`).split('\n');
  for (const s of sections(lines)) {
    if (!s.heading) continue;
    const kind = /^## Worked example/.test(s.heading) ? 'example' : /^## Composes with/.test(s.heading) ? 'composes' : null;
    if (!kind) continue;
    const body = lines.slice(s.start + 1, s.end).join('\n').trim();
    if (body !== STUBS[kind]) fail(`skills/${d}: "${s.heading.slice(3, 40)}" body is inline (${body.length} chars) — run scripts/split-references.mjs; only the standard stub belongs in SKILL.md`);
  }
}

// ---- 11. Subagent-count claims agree with agents/ ("N subagents", "Three specialists"; skill counts are >10 and skipped)
const COUNT_WORDS = { two: 2, three: 3, four: 4, five: 5, six: 6 };
for (const p of countFiles) {
  if (!existsSync(join(root, p))) continue;
  for (const m of read(p).matchAll(/\b(\d+|two|three|four|five|six)\s+(?:model-routed\s+|bundled\s+)?(?:subagents|specialists)\b/gi)) {
    const n = /^\d+$/.test(m[1]) ? Number(m[1]) : COUNT_WORDS[m[1].toLowerCase()];
    if (n > 10) continue;
    if (n !== agentFiles.length) fail(`${p}: claims "${m[0]}" but agents/ holds ${agentFiles.length}`);
  }
}

// ---- 12. Measurement-library mentions resolve to scripts/measure/<name>.mjs
const measureDir = join(root, 'scripts', 'measure');
const measureFiles = existsSync(measureDir) ? readdirSync(measureDir).filter(f => f.endsWith('.mjs')) : [];
for (const p of mdFiles) {
  for (const m of read(p).matchAll(/scripts\/measure\/([A-Za-z0-9_-]+\.mjs)/g)) {
    if (!measureFiles.includes(m[1])) fail(`${p}: mentions scripts/measure/${m[1]} which does not exist`);
  }
}

console.log(`\n${fails} failure(s), ${warns} warning(s) across ${skillDirs.length} skills (+ root = ${expectedCount}).`);
process.exit(fails ? 1 : 0);
