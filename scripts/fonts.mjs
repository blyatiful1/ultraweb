#!/usr/bin/env node
// fonts.mjs — fetch an open-licence family from Google Fonts as self-hosted woff2 files and
// print the @font-face rules, so the finished page loads no font from a third party.
//
//   node fonts.mjs get "<Family>" [--weights 400,700] [--italic] [--subsets latin] [--out site/fonts]
//
// Exit: 0 ok, 2 bad input or unknown family, 3 the service is unavailable (use a system font
// stack and say so in the handoff).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const API = (process.env.ULTRAWEB_FONTS_API || 'https://fonts.googleapis.com').replace(/\/+$/, '');
// the stylesheet endpoint serves woff2 with unicode ranges only to a current browser
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const HELP = `fonts.mjs — self-host a Google Fonts family

  node fonts.mjs get "<Family>" [--weights 400,700] [--italic] [--subsets latin] [--out site/fonts]

Downloads the woff2 files into --out (default site/fonts), writes fonts.css beside them and
prints the @font-face rules with paths relative to the site root. --subsets latin covers
English and German; add latin-ext for other European languages.
Exit 2: no such family (check the spelling on fonts.google.com). Exit 3: service unavailable.
`;

function die(msg, code = 2) {
  process.stderr.write(`fonts: ${msg}\n`);
  process.exit(code);
}
function parse(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--italic') out.italic = true;
    else if (a.startsWith('--')) {
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) die(`${a} needs a value`);
      out[a.slice(2)] = argv[++i];
    } else out._.push(a);
  }
  return out;
}
async function grab(url, binary = false) {
  let res;
  try {
    res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
  } catch (e) {
    die(`font service unavailable (${(e.cause && e.cause.code) || e.name || 'network error'}): use a system font stack and say so`, 3);
  }
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) die(`font service answered ${res.status}: use a system font stack and say so`, 3);
  return binary ? Buffer.from(await res.arrayBuffer()) : res.text();
}

async function get(args) {
  const family = String(args._[1] ?? '').replace(/\s+/g, ' ').trim();
  if (!family || !/^[A-Za-z0-9 ]{2,60}$/.test(family)) die('get needs a family name in quotes, for example "Barlow Condensed"');
  const weights = [...new Set(String(args.weights ?? '400,700').split(',').map((w) => Number.parseInt(w, 10)))].sort((a, b) => a - b);
  if (!weights.length || weights.some((w) => !Number.isFinite(w) || w < 100 || w > 900)) die('--weights is a list such as 400,700 (100 to 900)');
  const subsets = String(args.subsets ?? 'latin').split(',').map((s) => s.trim()).filter(Boolean);
  const outDir = resolve(args.out ?? 'site/fonts');
  const prefix = basename(outDir) + '/';
  const fam = encodeURIComponent(family).replace(/%20/g, '+');
  const axis = args.italic ? `ital,wght@${[0, 1].flatMap((i) => weights.map((w) => `${i},${w}`)).join(';')}` : `wght@${weights.join(';')}`;
  let css = await grab(`${API}/css2?family=${fam}:${axis}&display=swap`);
  let note = '';
  if (css === null) {
    css = await grab(`${API}/css2?family=${fam}&display=swap`);
    if (css === null) die(`"${family}" is not on Google Fonts: check the spelling, or choose another family`);
    note = `"${family}" does not come in every weight asked for; fetched what exists.`;
  }
  const faces = new Map();
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const [, subset, body] = m;
    if (!subsets.includes(subset)) continue;
    const pick = (k) => (new RegExp(`${k}\\s*:\\s*([^;]+);`).exec(body) || [])[1]?.trim();
    const url = (/url\(([^)]+\.woff2[^)]*)\)/.exec(body) || [])[1]?.replace(/["']/g, '');
    if (!url) continue;
    const face = faces.get(url) ?? { subset, style: pick('font-style') || 'normal', weights: new Set(), range: pick('unicode-range') };
    for (const w of String(pick('font-weight') || '400').split(/\s+/)) face.weights.add(Number.parseInt(w, 10));
    faces.set(url, face);
  }
  if (!faces.size) die(`no woff2 files for "${family}" in subset(s) ${subsets.join(', ')}`);
  mkdirSync(outDir, { recursive: true });
  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const rules = [];
  let bytes = 0;
  for (const [url, f] of faces) {
    const ws = [...f.weights].sort((a, b) => a - b);
    const lo = ws[0];
    const hi = ws[ws.length - 1];
    const file = `${slug}-${f.subset}-${lo === hi ? lo : `${lo}-${hi}`}${f.style === 'italic' ? '-italic' : ''}.woff2`;
    const buf = await grab(url, true);
    if (!buf) die(`a font file is missing at the service: try again or choose another family`, 3);
    writeFileSync(join(outDir, file), buf);
    bytes += buf.length;
    rules.push({ file, text: (p) => `@font-face { font-family: "${family}"; font-style: ${f.style}; font-weight: ${lo === hi ? lo : `${lo} ${hi}`}; font-display: swap; src: url("${p}${file}") format("woff2");${f.range ? ` unicode-range: ${f.range};` : ''} }` });
  }
  writeFileSync(join(outDir, 'fonts.css'), rules.map((r) => r.text('')).join('\n') + '\n', { flag: 'a' });
  process.stdout.write(
    `/* ${family}: ${rules.length} file(s), ${Math.round(bytes / 1024)} kB, saved in ${outDir}. Open licence; see the family's page on fonts.google.com. */\n` +
      rules.map((r) => r.text(prefix)).join('\n') +
      `\n/* Paste the rules above at the top of the stylesheet (paths are relative to the site root), then use font-family: "${family}", <fallback>. */\n` +
      `/* Optional, in <head>, for the face the first screen uses: <link rel="preload" href="${prefix}${rules[0].file}" as="font" type="font/woff2" crossorigin> */\n` +
      (note ? `/* ${note} */\n` : '')
  );
}

const args = parse(process.argv.slice(2));
const cmd = args._[0];
if (args.help || !cmd) process.stdout.write(HELP);
else if (cmd === 'get') await get(args);
else die(`unknown command "${cmd}" (try --help)`);
