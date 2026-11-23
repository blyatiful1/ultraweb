#!/usr/bin/env node
// check-phase.mjs — validates that a build has really finished a phase, so a step cannot be
// skipped. Every check is a structural fact read from the artifact formats in references/
// (brief.md, direction.md, structure.md, checkpoints.md, judge.md); none is a quality judgment.
//
//   node check-phase.mjs <phase 1-8> [--project <dir>] [--allow-unverified]
//
// Phase N also runs the checks of phases 1..N-1. Exit 0 ok, 1 incomplete (one line per
// problem, naming the file and what is missing), 2 bad input.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCss, ALL_TOKENS } from './palette.mjs';

const HELP = `check-phase.mjs — has this build really finished phase N?

  node check-phase.mjs <phase 1-8> [--project <dir>] [--allow-unverified]

  --project <dir>      project root (default: current directory)
  --allow-unverified   phase 7: accept qa/gates.json verdict UNVERIFIED (prints a warning)

Phase checks (each also runs all earlier phases):
  1 design/BRIEF.md: Tier:/Mode:/Deployment mode: lines, every section of the brief.md format, no TODO or empty field
  2 design/DIRECTION.md: every section of the direction.md format; Will not >= 5 entries; Approved
    ("autonomous" allowed only in autonomous mode); design/mockups/*.html: 2 (sketch) or 3 (otherwise)
  3 design/SYSTEM.md; token file (app/globals.css, src/app/globals.css or site/styles.css) defines every
    semantic token and passes \`palette.mjs check\`
  4 design/SITEMAP.md lists a route; the copy deck has no empty Text cell and no TODO-COPY
  5 homepage file (app/page.tsx, src/app/page.tsx or site/index.html); PROGRESS.md CP2 entry (autonomous: not needed)
  6 a file for every route in SITEMAP.md (Next page.tsx, route groups ignored; static <route>.html or <route>/index.html)
  7 qa/gates.json verdict PASS; highest qa/judge-round-N.md ends with a line containing SHIP
  8 PROGRESS.md CP3 entry with an approval (autonomous: not needed); README.md in the project

Exit 0 ok, 1 incomplete, 2 bad input.
`;

const die = (msg) => { process.stderr.write(`check-phase: ${msg}\n`); process.exit(2); };

// ---------- helpers ----------
const read = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const lsDir = (p) => { try { return readdirSync(p, { withFileTypes: true }); } catch { return []; } };

/** Split markdown into {heading -> body} for `## ` sections (case-insensitive keys). */
function sections(md, level = 2) {
  const out = new Map();
  const re = new RegExp(`^#{${level}}\\s+(.+?)\\s*$`, 'gm');
  const hits = [...md.matchAll(re)];
  hits.forEach((m, i) => {
    const end = i + 1 < hits.length ? hits[i + 1].index : md.length;
    out.set(m[1].trim().toLowerCase(), md.slice(m.index + m[0].length, end));
  });
  return out;
}
const nonEmpty = (s) => s != null && s.replace(/<!--[\s\S]*?-->/g, '').trim().length > 0;
const lineValue = (md, label) => {
  const m = new RegExp(`^${label}:[ \\t]*(.*?)[ \\t]*$`, 'im').exec(md);
  return m ? m[1] : null;
};

function briefOf(root) {
  const md = read(join(root, 'design/BRIEF.md')) ?? '';
  return {
    tier: (lineValue(md, 'Tier') || '').toLowerCase(),
    mode: (lineValue(md, 'Mode') || 'guided').toLowerCase(),
  };
}
const isAutonomous = (root) => briefOf(root).mode === 'autonomous';

// ---------- phases ----------
const BRIEF_SECTIONS = ['Site type', 'Audience', 'Conversion', 'Tone', 'Subject world', 'Pages', 'Content inventory', 'Material claims', 'Backend', 'Assets'];

function phase1(root, p) {
  const f = 'design/BRIEF.md';
  const md = read(join(root, f));
  if (md == null) return p(f, 'file is missing');
  const tier = lineValue(md, 'Tier');
  if (tier === null) p(f, 'missing line "Tier: sketch|standard|flagship"');
  else if (!/^(sketch|standard|flagship)$/i.test(tier)) p(f, `"Tier:" must be exactly one of sketch, standard, flagship (got "${tier}")`);
  const mode = lineValue(md, 'Mode');
  if (mode === null) p(f, 'missing line "Mode: guided|autonomous"');
  else if (!/^(guided|autonomous)$/i.test(mode)) p(f, `"Mode:" must be exactly guided or autonomous (got "${mode}")`);
  const dep = lineValue(md, 'Deployment mode');
  if (dep === null) p(f, 'missing line "Deployment mode: production|staging|demo"');
  else if (!/^(production|staging|demo)$/i.test(dep)) p(f, `"Deployment mode:" must be exactly production, staging or demo (got "${dep}")`);
  const secs = sections(md);
  for (const name of BRIEF_SECTIONS) {
    const body = secs.get(name.toLowerCase());
    if (body === undefined) p(f, `missing section "## ${name}"`);
    else if (!nonEmpty(body)) p(f, `section "## ${name}" is empty`);
  }
  const backend = secs.get('backend');
  if (backend && nonEmpty(backend)) {
    if (!/^\s*needs:/im.test(backend)) p(f, 'section "## Backend" has no "needs:" line');
    if (!/^\s*rejected:/im.test(backend)) p(f, 'section "## Backend" has no "rejected:" line');
  }
  if (/\bTODO\b/.test(md)) p(f, 'contains TODO');
}

const DECISION_LINES = [['Ground', 'Ground'], ['Type', 'Type'], ['Colour', 'Colou?r'], ['Layout principle', 'Layout principle'], ['Imagery', 'Imagery'], ['Motion', 'Motion'], ['Theme', 'Theme']];

function phase2(root, p) {
  const f = 'design/DIRECTION.md';
  const md = read(join(root, f));
  if (md == null) p(f, 'file is missing');
  else {
    if (!/^#\s+Direction:\s*\S/m.test(md)) p(f, 'missing title line "# Direction: <concept>"');
    const secs = sections(md);
    const need = (name) => {
      const b = secs.get(name.toLowerCase());
      if (b === undefined) { p(f, `missing section "## ${name}"`); return null; }
      if (!nonEmpty(b)) { p(f, `section "## ${name}" is empty`); return null; }
      return b;
    };
    need('Subject');
    const dec = need('Decisions');
    if (dec) {
      for (const [label, rx] of DECISION_LINES) {
        if (!new RegExp(`^\\s*(?:[-*]\\s*)?\\**${rx}\\**\\s*:\\s*\\S`, 'im').test(dec)) p(f, `## Decisions has no "${label}:" line with a value`);
      }
    }
    const sig = need('Signature move');
    if (sig) for (const word of ['name', 'place', 'budget', 'fallback']) if (!new RegExp(`\\b${word}\\b`, 'i').test(sig)) p(f, `## Signature move does not state its ${word}`);
    need('Assets');
    need('Defaults used');
    const will = need('Will not');
    if (will) {
      const n = (will.match(/^\s*(?:[-*+]|\d+[.)])\s+\S/gm) || []).length;
      if (n < 5) p(f, `## Will not has ${n} entries, needs at least 5`);
    }
    const appr = need('Approved');
    if (appr && /^\W*autonomous\W*$/i.test(appr.trim()) && !isAutonomous(root)) p(f, '## Approved says "autonomous" but design/BRIEF.md Mode is guided');
    if (/\bTODO\b/.test(md)) p(f, 'contains TODO');
  }
  const dir = join(root, 'design/mockups');
  const count = lsDir(dir).filter((e) => e.isFile() && /\.html$/i.test(e.name) && e.name.toLowerCase() !== 'index.html').length;
  const { tier } = briefOf(root);
  const want = tier === 'sketch' ? 2 : 3;
  if (count < want) p('design/mockups/', `has ${count} candidate .html file(s) (index.html not counted), ${tier === 'sketch' ? 'sketch tier needs 2' : 'needs 3'}`);
}

const TOKEN_FILES = ['app/globals.css', 'src/app/globals.css', 'site/styles.css'];

function phase3(root, p) {
  const f = 'design/SYSTEM.md';
  const md = read(join(root, f));
  if (md == null) p(f, 'file is missing');
  else if (!nonEmpty(md)) p(f, 'file is empty');
  const tf = TOKEN_FILES.find((t) => isFile(join(root, t)));
  if (!tf) return p(TOKEN_FILES.join(' | '), 'no token file found');
  const css = read(join(root, tf));
  const declared = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1].slice(2)));
  const missing = ALL_TOKENS.filter((t) => !declared.has(t));
  if (missing.length) p(tf, `missing semantic token(s): ${missing.map((t) => `--${t}`).join(' ')}`);
  const { rows, problems } = checkCss(css);
  for (const r of rows) if (r.status === 'FAIL' && r.ratio !== null) p(tf, `contrast fails (palette.mjs check), ${r.theme}: --${r.fg} on --${r.bg} is ${r.ratio.toFixed(2)}:1, floor ${r.floor}:1`);
  for (const x of problems) p(tf, `palette.mjs check: ${x}`);
}

/** Parse a markdown table into rows of trimmed cells (header and separator dropped). */
function tableRows(body) {
  const rows = [];
  for (const line of body.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    rows.push(cells);
  }
  return rows.slice(1);
}
export function sitemapRoutes(md) {
  const secs = sections(md);
  const body = secs.get('routes') ?? '';
  const routes = [];
  for (const cells of tableRows(body)) {
    const r = cells[0].replace(/^`|`$/g, '').trim();
    if (r.startsWith('/') && !r.includes('<')) routes.push(r);
  }
  return routes;
}

function phase4(root, p) {
  const f = 'design/SITEMAP.md';
  const md = read(join(root, f));
  if (md == null) return p(f, 'file is missing');
  if (!sitemapRoutes(md).length) p(f, 'no route listed in the "## Routes" table (a row starting with /)');
  const deck = sections(md).get('copy deck');
  if (deck === undefined) p(f, 'missing section "## Copy deck"');
  else {
    const rows = tableRows(deck);
    if (!rows.length) p(f, '## Copy deck has no slot rows');
    for (const cells of rows) if (!nonEmpty(cells[2] ?? '')) p(f, `copy deck slot ${cells[0] || '(unnamed)'} has an empty Text cell`);
  }
  if (md.includes('TODO-COPY')) p(f, 'contains TODO-COPY');
}

const HOME_FILES = ['app/page.tsx', 'src/app/page.tsx', 'site/index.html'];

/** Does PROGRESS.md have a `CPn` heading? Returns the entry body, or null. */
function cpEntry(root, n) {
  const md = read(join(root, 'design/PROGRESS.md'));
  if (md == null) return { md: null, body: null };
  const hits = [...md.matchAll(/^(#{2,4})\s*CP(\d)\b.*$/gm)];
  const i = hits.findIndex((m) => m[2] === String(n));
  if (i < 0) return { md, body: null };
  const rest = md.slice(hits[i].index + hits[i][0].length);
  const stop = rest.search(/^#{1,4}\s/m);
  return { md, body: stop < 0 ? rest : rest.slice(0, stop) };
}
const VERDICT = /(?:^|\n)[^\n]*\b(Approved with notes|Approved|Auto-passed(?: \(autonomous\))?)\.?[ \t]*(?=\n|$)/;

function phase5(root, p) {
  if (!HOME_FILES.some((h) => isFile(join(root, h)))) p(HOME_FILES.join(' | '), 'no homepage file found');
  if (isAutonomous(root)) return;
  const { md, body } = cpEntry(root, 2);
  if (md == null) p('design/PROGRESS.md', 'file is missing (needs a CP2 entry in guided mode)');
  else if (body === null) p('design/PROGRESS.md', 'no CP2 entry under ## Checkpoints (guided mode)');
}

/** Routes served by files on disk: Next app dir and static site/. */
function routesOnDisk(root) {
  const found = new Set();
  const walk = (dir, segs) => {
    for (const e of lsDir(dir)) {
      if (e.isDirectory()) {
        if (e.name.startsWith('@') || e.name.startsWith('_')) continue;
        walk(join(dir, e.name), /^\(.*\)$/.test(e.name) ? segs : [...segs, e.name]);
      } else if (/^page\.(tsx|jsx|js|ts|mdx)$/.test(e.name)) found.add(`/${segs.join('/')}`);
    }
  };
  for (const base of ['app', 'src/app']) walk(join(root, base), []);
  const walkStatic = (dir, segs) => {
    for (const e of lsDir(dir)) {
      if (e.isDirectory()) walkStatic(join(dir, e.name), [...segs, e.name]);
      else if (e.name === 'index.html') found.add(`/${segs.join('/')}`);
      else if (/\.html$/.test(e.name) && segs.length >= 0) found.add(`/${[...segs, e.name.replace(/\.html$/, '')].join('/')}`);
    }
  };
  walkStatic(join(root, 'site'), []);
  return found;
}
const normRoute = (r) => (r.replace(/:(\w+)/g, '[$1]').replace(/\/+$/, '') || '/');

function phase6(root, p) {
  const md = read(join(root, 'design/SITEMAP.md'));
  if (md == null) return; // phase 4 already reported it
  const disk = new Set([...routesOnDisk(root)].map(normRoute));
  for (const r of sitemapRoutes(md)) {
    if (!disk.has(normRoute(r))) {
      const rel = r === '/' ? '' : r.replace(/^\//, '');
      p(`route ${r}`, `no file: expected app/${rel ? `${rel}/` : ''}page.tsx (or src/app/…) or site/${rel ? `${rel}.html or site/${rel}/index.html` : 'index.html'}`);
    }
  }
}

function phase7(root, p, opts) {
  const g = 'qa/gates.json';
  const raw = read(join(root, g));
  if (raw == null) p(g, 'file is missing (run scripts/gates.mjs)');
  else {
    let j = null;
    try { j = JSON.parse(raw); } catch { p(g, 'is not valid JSON'); }
    if (j) {
      if (j.verdict === 'PASS') { /* ok */ }
      else if (j.verdict === 'UNVERIFIED') {
        if (opts.allowUnverified) process.stderr.write(`warning: ${g} verdict is UNVERIFIED; accepted because of --allow-unverified\n`);
        else p(g, 'verdict is UNVERIFIED, not PASS (re-run with --allow-unverified only if the user accepted every unverified check)');
      } else p(g, `verdict is ${j.verdict === undefined ? 'missing' : j.verdict}, needs PASS`);
    }
  }
  const rounds = lsDir(join(root, 'qa')).map((e) => /^judge-round-(\d+)\.md$/.exec(e.name)).filter(Boolean).map((m) => ({ n: Number(m[1]), name: m[0] }));
  if (!rounds.length) return p('qa/judge-round-N.md', 'no judge round file found');
  const top = rounds.sort((a, b) => b.n - a.n)[0];
  const lines = (read(join(root, 'qa', top.name)) ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? '';
  if (!/\bSHIP\b/.test(last) || /\b(?:NO|NOT|DON'T|DO NOT)[- ]SHIP\b/i.test(last)) p(`qa/${top.name}`, `highest round's last line must contain SHIP (got "${last.slice(0, 60)}")`);
}

function phase8(root, p) {
  if (!isAutonomous(root)) {
    const { md, body } = cpEntry(root, 3);
    if (md == null) p('design/PROGRESS.md', 'file is missing (needs a CP3 entry)');
    else if (body === null) p('design/PROGRESS.md', 'no CP3 entry under ## Checkpoints');
    else if (!VERDICT.test(body)) p('design/PROGRESS.md', 'CP3 entry has no approval line (Approved | Approved with notes | Auto-passed (autonomous))');
  }
  if (!isFile(join(root, 'README.md'))) p('README.md', 'file is missing');
}

const PHASES = [null, phase1, phase2, phase3, phase4, phase5, phase6, phase7, phase8];

export function checkPhase(n, root, opts = {}) {
  const problems = [];
  for (let k = 1; k <= n; k++) {
    PHASES[k](root, (file, what) => problems.push(`phase ${k}: ${file}: ${what}`), opts);
  }
  return problems;
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) { process.stdout.write(HELP); return; }
  let phase = null;
  let project = process.cwd();
  const opts = { allowUnverified: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') { if (i + 1 >= argv.length) die('--project needs a directory'); project = argv[++i]; }
    else if (a === '--allow-unverified') opts.allowUnverified = true;
    else if (/^\d+$/.test(a) && phase === null) phase = Number(a);
    else die(`unknown argument "${a}" (try --help)`);
  }
  if (phase === null || phase < 1 || phase > 8) die('phase must be a number from 1 to 8');
  const root = resolve(project);
  if (!existsSync(root) || !statSync(root).isDirectory()) die(`project directory not found: ${root}`);
  const problems = checkPhase(phase, root, opts);
  if (problems.length) {
    process.stdout.write(`${problems.join('\n')}\nphase ${phase}: INCOMPLETE (${problems.length} problem${problems.length === 1 ? '' : 's'})\n`);
    process.exit(1);
  }
  process.stdout.write(`phase ${phase}: ok\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
