#!/usr/bin/env node
// lint-corpus.mjs — structural invariants of the ultraweb v2 corpus. Dependency-free.
// Usage: node scripts/lint-corpus.mjs [--root <plugin-dir>] [--help]
// Exit 0 when every rule holds, 1 with file:line findings otherwise, 2 on bad usage.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELP = `lint-corpus — check the ultraweb corpus invariants

Usage: node scripts/lint-corpus.mjs [--root <plugin-dir>]

Rules:
  skills      exactly four skills: SKILL.md (ultraweb), skills/iterate, skills/retrofit,
              skills/gates; frontmatter is "name: <name>" plus a one-line double-quoted
              description of at most ${400} chars; descriptions total at most ${1400} chars
  stray-skill no other SKILL.md anywhere in the tree
  paths       every references/, scripts/, agents/, hooks/, evals/ path mentioned in a
              SKILL.md, references/**/*.md or agents/*.md exists
  size        SKILL.md <= 18500 bytes; each reference <= 26000; references total <= 330000
  skill-ref   no ultraweb:<name> other than ultraweb:ultraweb, :iterate, :retrofit, :gates
  frontmatter no reference file starts with YAML frontmatter
  pins        no version pin for a package in stack/versions.json inside SKILL.md files,
              references/ or STACK.md (pkg@1.2, "Pkg 1.2", "pkg": "^1.2.3")

Exit codes: 0 clean, 1 findings (file:line: [rule] message), 2 usage error.
`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { process.stdout.write(HELP); process.exit(0); }
let root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root' && args[i + 1]) root = resolve(args[++i]);
  else { process.stderr.write(`unknown argument: ${args[i]}\n\n${HELP}`); process.exit(2); }
}

const LIMITS = { desc: 400, descTotal: 1400, root: 18500, ref: 26000, refTotal: 330000 };
const SKILLS = [
  ['SKILL.md', 'ultraweb'],
  ['skills/iterate/SKILL.md', 'iterate'],
  ['skills/retrofit/SKILL.md', 'retrofit'],
  ['skills/gates/SKILL.md', 'gates'],
];
const ALLOWED_SKILL_REFS = new Set(['ultraweb', 'iterate', 'retrofit', 'gates']);
const SKIP_DIRS = new Set(['.git', 'node_modules']);

const findings = [];
const report = (file, line, rule, msg) => findings.push(`${file}:${line}: [${rule}] ${msg}`);
const rel = (p) => relative(root, p).split(sep).join('/');
const read = (p) => readFileSync(p, 'utf8');
const lineAt = (text, index) => text.slice(0, index).split('\n').length;

function* walk(dir) {
  let names;
  try { names = readdirSync(dir); } catch { return; }
  for (const name of names) {
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) yield* walk(p); } else yield p;
  }
}
const all = [...walk(root)];

// ---- skills + frontmatter
let descTotal = 0;
for (const [file, name] of SKILLS) {
  const p = join(root, file);
  if (!existsSync(p)) { report(file, 1, 'skills', `missing required skill "${name}"`); continue; }
  const lines = read(p).split('\n');
  if (lines[0] !== '---') { report(file, 1, 'skills', 'frontmatter must open with "---" on line 1'); continue; }
  const close = lines.indexOf('---', 1);
  if (close < 0) { report(file, 1, 'skills', 'frontmatter never closes with "---"'); continue; }
  const seen = {};
  for (let i = 1; i < close; i++) {
    const ln = i + 1;
    const line = lines[i];
    let m;
    if ((m = line.match(/^name: ([a-z0-9][a-z0-9-]*)$/))) {
      if (seen.name) report(file, ln, 'skills', 'duplicate name');
      seen.name = m[1];
      if (m[1] !== name) report(file, ln, 'skills', `name must be "${name}", found "${m[1]}"`);
    } else if ((m = line.match(/^description: "((?:[^"\\\x00-\x1f]|\\["\\])*)"$/))) {
      if (seen.description !== undefined) report(file, ln, 'skills', 'duplicate description');
      const text = m[1].replace(/\\(["\\])/g, '$1');
      seen.description = text;
      if (text.length > LIMITS.desc) report(file, ln, 'skills', `description is ${text.length} chars (max ${LIMITS.desc})`);
      if (!text.trim()) report(file, ln, 'skills', 'description is empty');
      descTotal += text.length;
    } else if (/^description:/.test(line)) {
      report(file, ln, 'skills', 'description must be one double-quoted line; only \\" and \\\\ escapes, no control characters');
    } else {
      report(file, ln, 'skills', `unexpected frontmatter line (only name and description are allowed): ${line.slice(0, 60)}`);
    }
  }
  if (!seen.name) report(file, 1, 'skills', 'frontmatter has no name');
  if (seen.description === undefined) report(file, 1, 'skills', 'frontmatter has no description');
}
if (descTotal > LIMITS.descTotal) report('SKILL.md', 1, 'skills', `descriptions total ${descTotal} chars (max ${LIMITS.descTotal})`);

// ---- stray SKILL.md
const allowedSkillFiles = new Set(SKILLS.map(([f]) => f));
for (const p of all) {
  if (p.endsWith(`${sep}SKILL.md`) || p === join(root, 'SKILL.md')) {
    if (!allowedSkillFiles.has(rel(p))) report(rel(p), 1, 'stray-skill', 'only the four v2 skills may have a SKILL.md');
  }
}

// ---- corpus sets
const isRef = (r) => r.startsWith('references/') && r.endsWith('.md');
const skillFiles = all.filter((p) => p.endsWith('SKILL.md'));
const refFiles = all.filter((p) => isRef(rel(p)));
const agentFiles = all.filter((p) => /^agents\/[^/]+\.md$/.test(rel(p)));

// ---- paths
const PATH_RE = /(?<![\w.\/<>-])(?:<plugin>\/)?((?:references|scripts|agents|hooks|evals)\/[A-Za-z0-9_.\/*{}<>-]*)/g;
const PLUGIN_PATH_RE = /<plugin>\/((?:references|scripts|agents|hooks|evals)\/[A-Za-z0-9_.\/*{}<>-]*)/g;
for (const p of [...skillFiles, ...refFiles, ...agentFiles]) {
  const text = read(p);
  const seen = new Set();
  for (const re of [PATH_RE, PLUGIN_PATH_RE]) {
    for (const m of text.matchAll(re)) {
      let target = m[1].replace(/[.,:;)]+$/, '');
      if (/[*{}<>]/.test(target)) {
        const prefix = target.slice(0, target.search(/[*{}<>]/)).replace(/\/[^/]*$/, '/');
        if (!prefix.includes('/')) continue;
        target = prefix;
      }
      const key = `${m.index}:${target}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const abs = join(root, target);
      if (!existsSync(abs)) report(rel(p), lineAt(text, m.index), 'paths', `mentions ${target}, which does not exist`);
    }
  }
}

// ---- size budgets
const rootSkill = join(root, 'SKILL.md');
if (existsSync(rootSkill)) {
  const size = statSync(rootSkill).size;
  if (size > LIMITS.root) report('SKILL.md', 1, 'size', `${size} bytes (max ${LIMITS.root})`);
}
let refTotal = 0;
for (const p of refFiles) {
  const size = statSync(p).size;
  refTotal += size;
  if (size > LIMITS.ref) report(rel(p), 1, 'size', `${size} bytes (max ${LIMITS.ref})`);
}
if (refTotal > LIMITS.refTotal) report('references/', 1, 'size', `references total ${refTotal} bytes (max ${LIMITS.refTotal})`);

// ---- ultraweb:<name> tokens
const stackMd = join(root, 'STACK.md');
const corpus = [...skillFiles, ...refFiles, ...agentFiles, ...(existsSync(stackMd) ? [stackMd] : [])];
for (const p of corpus) {
  const text = read(p);
  for (const m of text.matchAll(/\bultraweb:([a-z0-9][a-z0-9-]*)/g)) {
    if (!ALLOWED_SKILL_REFS.has(m[1])) report(rel(p), lineAt(text, m.index), 'skill-ref', `ultraweb:${m[1]} is not a v2 skill`);
  }
}

// ---- reference frontmatter
for (const p of refFiles) {
  if (/^---\s*$/m.test(read(p).split('\n')[0])) report(rel(p), 1, 'frontmatter', 'reference files carry no YAML frontmatter');
}

// ---- version pins
const DISPLAY = {
  next: ['Next.js', 'Next'],
  react: ['React'],
  'react-dom': ['ReactDOM'],
  tailwindcss: ['Tailwind CSS', 'Tailwind'],
  motion: ['Motion'],
  zod: ['Zod'],
  three: ['three.js', 'Three.js'],
  animejs: ['anime.js', 'Anime.js'],
  'better-auth': ['Better Auth'],
  'drizzle-orm': ['Drizzle ORM', 'Drizzle'],
  stripe: ['Stripe'],
  resend: ['Resend'],
  shadcn: ['shadcn/ui'],
  'lucide-react': ['Lucide'],
  '@react-three/fiber': ['React Three Fiber', 'R3F'],
  '@react-three/drei': ['drei'],
  shiki: ['Shiki'],
  velite: ['Velite'],
  postprocessing: ['Postprocessing'],
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
const versionsPath = join(root, 'stack', 'versions.json');
let packages = [];
try { packages = Object.keys(JSON.parse(read(versionsPath)).packages ?? {}); } catch { /* no manifest, no pin rule */ }
const pinRules = [];
for (const pkg of packages) {
  const names = [pkg, ...(DISPLAY[pkg] ?? [])];
  pinRules.push([new RegExp(`(?<![\\w@/-])${esc(pkg)}@[\\^~]?\\d`), `${pkg}@<version>`]);
  pinRules.push([new RegExp(`"${esc(pkg)}"\\s*:\\s*"[\\^~>=]*\\d`), `"${pkg}": "<version>"`]);
  for (const n of names) {
    pinRules.push([new RegExp(`(?<![\\w@/.-])${esc(n)}\\s+v?\\d+\\.\\d+(?![\\d.]*\\s*(?:s|ms|x|px|rem|em|%|fr|deg)\\b)`), `${n} <major.minor>`]);
  }
}
const pinFiles = [...skillFiles, ...refFiles, ...(existsSync(stackMd) ? [stackMd] : [])];
for (const p of pinFiles) {
  const lines = read(p).split('\n');
  lines.forEach((line, i) => {
    for (const [re, label] of pinRules) {
      const m = line.match(re);
      if (m) { report(rel(p), i + 1, 'pins', `version pin "${m[0]}" (${label}); versions live only in stack/versions.json`); break; }
    }
  });
}

if (findings.length) {
  process.stdout.write(findings.join('\n') + `\n\n${findings.length} finding(s)\n`);
  process.exit(1);
}
process.stdout.write(`lint-corpus: clean (4 skills, descriptions ${descTotal} chars, ${refFiles.length} references, ${refTotal} bytes)\n`);
process.exit(0);
