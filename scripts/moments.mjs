#!/usr/bin/env node
// moments.mjs — lists the kit's moments and picks one or two that fit a site, steering away
// from moments picked recently. Picks by judgment cluster around the same favourite effect;
// a pick that remembers history breaks that. See kit/README.md.
//
//   node moments.mjs list [--kind k] [--fits site-kind] [--needs none,photos,sequence] [--max-intensity n]
//   node moments.mjs pick --fits <site-kind> [--count 1|2] [--needs none,photos] [--max-intensity n]
//                         [--kind k] [--exclude name,...] [--seed n] [--history <file>] [--no-history]
//   node moments.mjs show <name>
//
// --needs names the assets you HAVE; a moment matches when everything it needs is in that
// list ("none" is always available). Default for pick: none.
// History lives in $ULTRAWEB_HOME/history.json (default ~/.ultraweb/history.json) under the
// key "moments"; other keys in that file are kept. Any failure to read or write it is
// ignored: the pick still prints. Exit 2 when nothing matches or an argument is wrong.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';

const KIT = join(dirname(fileURLToPath(import.meta.url)), '..', 'kit', 'moments');
export const KINDS = ['type', 'scroll', 'image', 'canvas', 'webgl', 'cursor', 'transition'];
export const NEEDS = ['none', 'photos', 'sequence'];
export const FITS = ['product', 'studio', 'shop', 'editorial', 'place', 'launch'];
const KEEP = 24; // picks kept in history

function fail(msg) {
  process.stderr.write(`moments: ${msg}\n`);
  process.exit(2);
}

// Returns a list of problems with one catalog entry; empty when it is valid.
export function validateEntry(e) {
  const p = [];
  if (!e || typeof e !== 'object') return ['entry is not an object'];
  if (typeof e.name !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.name)) p.push('name must be kebab-case');
  if (!KINDS.includes(e.kind)) p.push(`kind must be one of ${KINDS.join('|')}`);
  if (!Array.isArray(e.needs) || !e.needs.length || e.needs.some((n) => !NEEDS.includes(n))) p.push(`needs must be a non-empty array of ${NEEDS.join('|')}`);
  if (!Array.isArray(e.fits) || !e.fits.length || e.fits.some((f) => !FITS.includes(f))) p.push(`fits must be a non-empty array of ${FITS.join('|')}`);
  if (![1, 2, 3].includes(e.intensity)) p.push('intensity must be 1, 2 or 3');
  if (!Number.isInteger(e.bytes) || e.bytes <= 0) p.push('bytes must be a positive integer');
  if (typeof e.summary !== 'string' || !e.summary.trim()) p.push('summary must be a non-empty string');
  return p;
}

function list(v, flag, allowed) {
  const out = String(v).split(',').map((s) => s.trim()).filter(Boolean);
  for (const x of out) if (allowed && !allowed.includes(x)) fail(`${flag}: "${x}" is not one of ${allowed.join(', ')}`);
  return out;
}

function parseArgs(argv) {
  const opts = { cmd: null, name: null, count: 1, fits: null, needs: null, maxIntensity: 3, kind: null, exclude: [], seed: null, history: null, noHistory: false, catalog: null };
  const rest = [...argv];
  if (['list', 'pick', 'show', 'help'].includes(rest[0])) opts.cmd = rest.shift();
  while (rest.length) {
    const a = rest.shift();
    const next = () => {
      if (!rest.length) fail(`${a} needs a value`);
      return rest.shift();
    };
    if (a === '--help' || a === '-h') opts.cmd = 'help';
    else if (a === '--count') {
      opts.count = Number.parseInt(next(), 10);
      if (![1, 2].includes(opts.count)) fail('--count must be 1 or 2');
    } else if (a === '--fits') opts.fits = list(next(), '--fits', FITS)[0] || fail('--fits needs a site kind');
    else if (a === '--needs') opts.needs = list(next(), '--needs', NEEDS);
    else if (a === '--max-intensity') {
      opts.maxIntensity = Number.parseInt(next(), 10);
      if (![0, 1, 2, 3].includes(opts.maxIntensity)) fail('--max-intensity must be 0, 1, 2 or 3');
    } else if (a === '--kind') opts.kind = list(next(), '--kind', KINDS)[0];
    else if (a === '--exclude') opts.exclude.push(...list(next(), '--exclude'));
    else if (a === '--seed') opts.seed = Number.parseInt(next(), 10);
    else if (a === '--history') opts.history = next();
    else if (a === '--no-history') opts.noHistory = true;
    else if (a === '--catalog') opts.catalog = next();
    else if (opts.cmd === 'show' && !opts.name && !a.startsWith('-')) opts.name = a;
    else fail(`unknown argument "${a}" (try --help)`);
  }
  return opts;
}

function readCatalog(opts) {
  const file = opts.catalog || join(KIT, 'index.json');
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`cannot read the catalog ${file}: ${e.message}`);
  }
  if (!Array.isArray(data)) fail(`${file} is not a JSON array`);
  const good = [];
  for (const e of data) {
    const p = validateEntry(e);
    if (p.length) process.stderr.write(`moments: skipping catalog entry ${e && e.name ? `"${e.name}"` : '(unnamed)'}: ${p.join('; ')}\n`);
    else good.push(e);
  }
  return good;
}

function historyPath(opts) {
  if (opts.history) return opts.history;
  return join(process.env.ULTRAWEB_HOME || join(homedir(), '.ultraweb'), 'history.json');
}

function readHistoryFile(opts) {
  try {
    const data = JSON.parse(readFileSync(historyPath(opts), 'utf8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function recentPicks(opts) {
  if (opts.noHistory) return [];
  const m = readHistoryFile(opts).moments;
  return Array.isArray(m) ? m.filter((e) => e && Array.isArray(e.names)) : [];
}

function recordPick(opts, names, fits) {
  if (opts.noHistory) return;
  try {
    const data = readHistoryFile(opts); // re-read: keep every other key (deal.mjs entries)
    const moments = Array.isArray(data.moments) ? data.moments : [];
    moments.push({ at: new Date().toISOString().slice(0, 10), fits, names });
    data.moments = moments.slice(-KEEP);
    const file = historyPath(opts);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  } catch {
    // history is a convenience; a read-only home must not break the pick
  }
}

// mulberry32, same as deal.mjs, so --seed gives repeatable picks in tests
function seeded(seed) {
  let s = seed >>> 0;
  return (max) => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * max);
  };
}

export function filterCatalog(catalog, opts) {
  const have = new Set(['none', ...(opts.needs || [])]);
  return catalog.filter(
    (m) =>
      (!opts.fits || m.fits.includes(opts.fits)) &&
      (!opts.kind || m.kind === opts.kind) &&
      (!opts.needs || m.needs.every((n) => have.has(n))) &&
      m.intensity <= opts.maxIntensity &&
      !opts.exclude.includes(m.name)
  );
}

// Moments picked less often recently are proportionally more likely; never two of one kind.
export function pickMoments(pool, count, recent, rand) {
  const uses = (name) => recent.slice(-KEEP).filter((e) => e.names.includes(name)).length;
  let left = [...pool];
  const out = [];
  while (out.length < count && left.length) {
    const weights = left.map((m) => 1 / (1 + uses(m.name)) ** 2);
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = (rand(1_000_000) / 1_000_000) * total;
    let i = 0;
    for (; i < left.length - 1; i++) {
      roll -= weights[i];
      if (roll <= 0) break;
    }
    const chosen = left[i];
    out.push(chosen);
    left = left.filter((m) => m.kind !== chosen.kind);
  }
  return out;
}

const readmePath = (name) => join(KIT, name, 'README.md');

function table(rows) {
  const cols = ['name', 'kind', 'int', 'needs', 'fits', 'bytes', 'summary'];
  const cells = rows.map((m) => [m.name, m.kind, String(m.intensity), m.needs.join(','), m.fits.join(','), String(m.bytes), m.summary.length > 70 ? m.summary.slice(0, 69) + '…' : m.summary]);
  const w = cols.map((c, i) => Math.max(c.length, ...cells.map((r) => r[i].length)));
  const line = (r) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(w[i]))).join('  ') + '\n';
  return line(cols) + cells.map(line).join('');
}

const HELP = `moments.mjs — list and pick kit moments (kit/README.md)

  node moments.mjs list [--kind k] [--fits site-kind] [--needs none,photos,sequence] [--max-intensity n]
  node moments.mjs pick --fits <site-kind> [--count 1|2] [--needs none,photos] [--max-intensity n]
                        [--kind k] [--exclude name,...] [--seed n] [--history <file>] [--no-history]
  node moments.mjs show <name>

site kinds: ${FITS.join(', ')}
kinds:      ${KINDS.join(', ')}
--needs     the assets you have (${NEEDS.join(', ')}); pick defaults to none
--max-intensity  the motion level in design/DIRECTION.md (1 quiet, 2 expressive, 3 immersive)
A pick never holds two moments of one kind. Exit 2 when nothing matches.
History: $ULTRAWEB_HOME/history.json, default ~/.ultraweb/history.json.
`;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.cmd || opts.cmd === 'help') return void process.stdout.write(HELP);
  if (opts.cmd === 'show') {
    if (!opts.name) fail('show needs a moment name (try: node moments.mjs list)');
    if (!/^[a-z0-9-]+$/.test(opts.name) || !existsSync(readmePath(opts.name))) fail(`no moment named "${opts.name}" (try: node moments.mjs list)`);
    process.stdout.write(`${readmePath(opts.name)}\n\n${readFileSync(readmePath(opts.name), 'utf8')}`);
    return;
  }
  const catalog = readCatalog(opts);
  if (opts.cmd === 'list') {
    const rows = filterCatalog(catalog, opts);
    if (!rows.length) fail(catalog.length ? 'no moment matches these filters' : 'the catalog is empty');
    process.stdout.write(table(rows));
    return;
  }
  // pick
  if (!opts.fits) fail(`pick needs --fits <${FITS.join('|')}>`);
  if (!opts.needs) opts.needs = ['none'];
  const pool = filterCatalog(catalog, opts);
  if (!pool.length) {
    fail(
      `no moment fits --fits ${opts.fits} with needs ${opts.needs.join(',')} and intensity <= ${opts.maxIntensity}` +
        `${opts.kind ? ` and kind ${opts.kind}` : ''}${opts.exclude.length ? ` excluding ${opts.exclude.join(',')}` : ''}. ` +
        'Build without a moment, or relax a filter.'
    );
  }
  const rand = Number.isFinite(opts.seed) ? seeded(opts.seed) : (max) => randomInt(max);
  const picked = pickMoments(pool, opts.count, recentPicks(opts), rand);
  if (picked.length < opts.count) process.stderr.write(`moments: only ${picked.length} of ${opts.count} picked (one per kind; no other kind matches)\n`);
  picked.forEach((m, i) => {
    if (i) process.stdout.write('\n');
    process.stdout.write(`${m.name}\n  ${m.summary}\n  kind ${m.kind}, intensity ${m.intensity}, needs ${m.needs.join(',')}, ${m.bytes} bytes\n  README: ${readmePath(m.name)}\n`);
  });
  recordPick(opts, picked.map((m) => m.name), opts.fits);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
