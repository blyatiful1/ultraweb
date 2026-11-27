#!/usr/bin/env node
// packs.mjs — design packs: ready-made looks a small model builds a one-page site from.
//
//   node packs.mjs list [--json]            what each pack is, and which clients it suits
//   node packs.mjs show <name>              one pack's manifest and files
//   node packs.mjs install <name> --into <project> [--force]
//                                           copy the pack to <project>/pack/
//   node packs.mjs check [<name>]           structural checks on one pack or all of them
//
// A pack is a folder under packs/: pack.json (manifest), PACK.md (the builder's guide),
// pack.css, catalogue.html (every pattern and element once), fonts/, and optionally pack.js.
// Exit: 0 ok, 1 a check failed, 2 bad input.
import { readFileSync, readdirSync, existsSync, statSync, cpSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.ULTRAWEB_PACKS_DIR ? resolve(process.env.ULTRAWEB_PACKS_DIR) : join(dirname(fileURLToPath(import.meta.url)), '..', 'packs');
const LIMITS = { css: 60000, catalogue: 70000, js: 8000, guideLines: 130, patterns: 13 };
const KEYS = ['name', 'title', 'character', 'suits', 'notFor', 'colourways', 'firstScreens', 'signature', 'fonts'];
const BANNED_FAMILIES = ['Inter', 'Geist', 'Space Grotesk', 'Fraunces', 'Instrument Serif', 'Playfair Display', 'DM Sans', 'Manrope', 'Poppins'];

const HELP = `packs.mjs — design packs for one-page sites

  node packs.mjs list [--json]
  node packs.mjs show <name>
  node packs.mjs install <name> --into <project> [--force]
  node packs.mjs check [<name>]

list     prints every pack with its character and the clients it suits. Choose by the
         client's subject, not by taste: the pack whose "suits" names this kind of client
         and whose "not for" does not. If none fits, build without a pack.
install  copies the pack into <project>/pack/. Then read pack/PACK.md and
         pack/catalogue.html before writing anything.
`;

function die(msg, code = 2) {
  process.stderr.write(`packs: ${msg}\n`);
  process.exit(code);
}

function names() {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT)
    .filter((n) => existsSync(join(ROOT, n, 'pack.json')))
    .sort();
}

function manifest(name) {
  const file = join(ROOT, name, 'pack.json');
  if (!/^[a-z][a-z0-9-]*$/.test(name) || !existsSync(file)) die(`no pack named "${name}" (have: ${names().join(', ') || 'none'})`);
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    die(`packs/${name}/pack.json is not valid JSON: ${e.message}`, 1);
  }
}

const arr = (v) => (Array.isArray(v) ? v : []);

function list(asJson) {
  const all = names().map(manifest);
  if (asJson) return void process.stdout.write(JSON.stringify(all, null, 2) + '\n');
  if (!all.length) return void process.stdout.write('no packs installed\n');
  process.stdout.write(`${all.length} design pack(s). Choose by the client's subject.\n\n`);
  for (const m of all) {
    process.stdout.write(
      `${m.name}  (${m.title})\n` +
        `  ${m.character}\n` +
        `  suits:      ${arr(m.suits).join(', ')}\n` +
        `  not for:    ${arr(m.notFor).join(', ')}\n` +
        `  signature:  ${m.signature}\n` +
        `  colourways: ${arr(m.colourways).join(', ')}   first screens: ${arr(m.firstScreens).join(', ')}\n\n`
    );
  }
  process.stdout.write('Pick the pack whose "suits" names this kind of client and whose "not for" does not.\nIf none fits, say so and build without a pack. Then: node packs.mjs install <name> --into <project>\n');
}

function show(name) {
  const m = manifest(name);
  const dir = join(ROOT, name);
  const size = (f) => (existsSync(join(dir, f)) ? `${Math.round(statSync(join(dir, f)).size / 1024)} kB` : 'missing');
  process.stdout.write(
    `${m.name}  (${m.title})\n  ${m.character}\n  suits: ${arr(m.suits).join(', ')}\n  not for: ${arr(m.notFor).join(', ')}\n  signature: ${m.signature}\n` +
      `  colourways: ${arr(m.colourways).join(', ')}\n  first screens: ${arr(m.firstScreens).join(', ')}\n  fonts: ${arr(m.fonts).join(', ')}\n` +
      `  files: PACK.md ${size('PACK.md')}, pack.css ${size('pack.css')}, catalogue.html ${size('catalogue.html')}, pack.js ${size('pack.js')}\n  at: ${dir}\n`
  );
}

function install(name, into, force) {
  manifest(name);
  if (!into) die('install needs --into <project>');
  const project = resolve(into);
  const dest = join(project, 'pack');
  if (existsSync(dest) && !force) die(`${dest} already exists: remove it or pass --force`);
  mkdirSync(project, { recursive: true });
  cpSync(join(ROOT, name), dest, { recursive: true, force: true });
  process.stdout.write(`installed ${name} at ${dest}\nRead pack/PACK.md and pack/catalogue.html completely before writing anything.\n`);
}

function check(only) {
  const todo = only ? [only] : names();
  if (!todo.length) die('no packs to check', 1);
  const problems = [];
  for (const name of todo) {
    const dir = join(ROOT, name);
    const bad = (msg) => problems.push(`${name}: ${msg}`);
    const m = manifest(name);
    for (const k of KEYS) if (m[k] === undefined || m[k] === '' || (Array.isArray(m[k]) && !m[k].length)) bad(`pack.json lacks "${k}"`);
    if (m.name !== name) bad(`pack.json name "${m.name}" does not match the folder`);
    for (const k of ['colourways', 'firstScreens']) if (arr(m[k]).length !== 3) bad(`pack.json "${k}" must list exactly three`);
    for (const f of ['PACK.md', 'pack.css', 'catalogue.html']) if (!existsSync(join(dir, f))) bad(`${f} is missing`);
    if (problems.some((p) => p.startsWith(`${name}: `) && p.endsWith('is missing'))) continue;
    const css = readFileSync(join(dir, 'pack.css'), 'utf8');
    const cat = readFileSync(join(dir, 'catalogue.html'), 'utf8');
    const guide = readFileSync(join(dir, 'PACK.md'), 'utf8');
    const js = existsSync(join(dir, 'pack.js')) ? readFileSync(join(dir, 'pack.js'), 'utf8') : '';
    if (css.length > LIMITS.css) bad(`pack.css is ${css.length} bytes (max ${LIMITS.css})`);
    if (cat.length > LIMITS.catalogue) bad(`catalogue.html is ${cat.length} bytes (max ${LIMITS.catalogue})`);
    if (js.length > LIMITS.js) bad(`pack.js is ${js.length} bytes (max ${LIMITS.js})`);
    if (guide.split('\n').length > LIMITS.guideLines) bad(`PACK.md is ${guide.split('\n').length} lines (max ${LIMITS.guideLines})`);
    const patterns = (cat.match(/<!--\s*PATTERN:/g) || []).length;
    if (patterns < LIMITS.patterns) bad(`catalogue.html documents ${patterns} patterns (min ${LIMITS.patterns})`);
    for (const c of arr(m.colourways).slice(1)) if (!css.includes(`data-colourway="${c}"`) && !css.includes(`data-colourway='${c}'`) && !css.includes(`data-colourway=${c}`)) bad(`pack.css has no rules for the colourway "${c}"`);
    if (/hyphens\s*:\s*auto/.test(css)) bad('pack.css sets hyphens: auto (display type must not hyphenate)');
    for (const fam of BANNED_FAMILIES) if (new RegExp(`font-family\\s*:[^;]*["']?${fam}\\b`, 'i').test(css)) bad(`pack.css uses the overused family ${fam}`);
    for (const [label, text] of [['pack.css', css], ['pack.js', js]]) if (/https?:\/\//.test(text.replace(/http:\/\/www\.w3\.org\/[^\s"')]*/g, ''))) bad(`${label} refers to another server`);
    if (/<(?:link|script|img|source|iframe)\b[^>]*\b(?:href|src)\s*=\s*["']https?:\/\//i.test(cat)) bad('catalogue.html loads something from another server');
    for (const u of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (/^data:/.test(u[1])) continue;
      if (!existsSync(join(dir, u[1].split(/[?#]/)[0]))) bad(`pack.css refers to a missing file: ${u[1]}`);
    }
    if (!/pack\.css/.test(cat)) bad('catalogue.html does not link pack.css');
  }
  if (problems.length) {
    process.stdout.write(problems.map((p) => `FAIL  ${p}`).join('\n') + '\n');
    process.exit(1);
  }
  process.stdout.write(`${todo.length} pack(s) ok: ${todo.join(', ')}\n`);
}

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  if (v === undefined || v.startsWith('--')) die(`${name} needs a value`);
  return v;
};
const cmd = argv[0];
if (!cmd || cmd === '--help' || cmd === '-h') process.stdout.write(HELP);
else if (cmd === 'list') list(argv.includes('--json'));
else if (cmd === 'show') show(argv[1] ?? die('show needs a pack name'));
else if (cmd === 'install') install(argv[1] ?? die('install needs a pack name'), flag('--into'), argv.includes('--force'));
else if (cmd === 'check') check(argv[1] && !argv[1].startsWith('--') ? argv[1] : undefined);
else die(`unknown command "${cmd}" (try --help)`);
