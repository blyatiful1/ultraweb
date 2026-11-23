#!/usr/bin/env node
// deal.mjs — deals one value per design axis for a mockup candidate, steering away from
// combinations dealt or approved recently. Options chosen by judgment cluster around the
// same few looks; a dealt candidate breaks that. See references/direction.md.
//
//   node deal.mjs [--n 1] [--fix axis=value,...] [--exclude axis=value,...]
//                 [--allow-immersive] [--seed <int>] [--history <file>] [--no-history]
//   node deal.mjs record --ground dark --type slab [--colour ...] [--layout ...] ...
//   node deal.mjs recent
//   node deal.mjs axes
//
// History lives in $ULTRAWEB_HOME/history.json (default ~/.ultraweb/history.json). Any
// failure to read or write it is ignored: the deal still prints.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { randomInt } from 'node:crypto';

export const AXES = {
  ground: ['light-neutral', 'light-tinted', 'dark', 'saturated-colour', 'mid-tone', 'photographic'],
  type: [
    'grotesque',
    'humanist-sans',
    'geometric-sans',
    'old-style-serif',
    'transitional-serif',
    'didone',
    'slab',
    'mono',
    'display',
  ],
  colour: ['monochrome', 'one-accent', 'two-colour-pair', 'polychrome'],
  layout: [
    'centred-stack',
    'asymmetric-grid',
    'image-led-full-bleed',
    'dense-index',
    'long-narrative',
    'split-screen',
    'spatial-horizontal',
  ],
  imagery: ['photography', 'illustration', 'type-only', 'product-ui', 'data-diagram', 'render-3d'],
  corners: ['square', 'slight', 'round'],
  density: ['airy', 'medium', 'dense'],
  motion: ['0', '1', '2', '3'],
};
const AXIS_NAMES = Object.keys(AXES);
const KEEP = 12; // history entries kept
const MIN_DIFF = 3; // a deal differs from each recent entry on at least this many axes

function fail(msg) {
  process.stderr.write(`deal: ${msg}\n`);
  process.exit(2);
}

function parsePairs(text, flag) {
  const out = {};
  if (!text) return out;
  for (const part of String(text).split(',')) {
    const [axis, value] = part.split('=');
    if (!AXES[axis]) fail(`${flag}: unknown axis "${axis}" (axes: ${AXIS_NAMES.join(', ')})`);
    if (!AXES[axis].includes(value)) fail(`${flag}: "${value}" is not a value of ${axis} (${AXES[axis].join(', ')})`);
    (out[axis] ||= []).push(value);
  }
  return out;
}

function parseArgs(argv) {
  const opts = { cmd: 'deal', n: 1, fix: {}, exclude: {}, immersive: false, seed: null, history: null, noHistory: false, record: {} };
  const rest = [...argv];
  if (['record', 'recent', 'axes'].includes(rest[0])) opts.cmd = rest.shift();
  while (rest.length) {
    const a = rest.shift();
    const next = () => {
      if (!rest.length) fail(`${a} needs a value`);
      return rest.shift();
    };
    if (a === '--help' || a === '-h') opts.cmd = 'help';
    else if (a === '--n') opts.n = Math.max(1, Math.min(6, Number.parseInt(next(), 10) || 1));
    else if (a === '--fix') Object.assign(opts.fix, parsePairs(next(), '--fix'));
    else if (a === '--exclude') {
      for (const [k, v] of Object.entries(parsePairs(next(), '--exclude'))) (opts.exclude[k] ||= []).push(...v);
    } else if (a === '--allow-immersive') opts.immersive = true;
    else if (a === '--seed') opts.seed = Number.parseInt(next(), 10);
    else if (a === '--history') opts.history = next();
    else if (a === '--no-history') opts.noHistory = true;
    else if (opts.cmd === 'record' && a.startsWith('--') && AXES[a.slice(2)]) {
      const axis = a.slice(2);
      const value = next();
      if (!AXES[axis].includes(value)) fail(`--${axis}: "${value}" is not one of ${AXES[axis].join(', ')}`);
      opts.record[axis] = value;
    } else fail(`unknown argument "${a}" (try --help)`);
  }
  return opts;
}

function historyPath(opts) {
  if (opts.history) return opts.history;
  return join(process.env.ULTRAWEB_HOME || join(homedir(), '.ultraweb'), 'history.json');
}

function readHistory(opts) {
  if (opts.noHistory) return [];
  try {
    const data = JSON.parse(readFileSync(historyPath(opts), 'utf8'));
    return Array.isArray(data.entries) ? data.entries.filter((e) => e && typeof e.axes === 'object') : [];
  } catch {
    return [];
  }
}

function writeHistory(opts, entries) {
  if (opts.noHistory) return;
  try {
    const file = historyPath(opts);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify({ entries: entries.slice(-KEEP) }, null, 2) + '\n');
  } catch {
    // history is a convenience; a read-only home must not break the deal
  }
}

// mulberry32: small deterministic PRNG so --seed gives repeatable deals in tests
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

const diff = (a, b) => AXIS_NAMES.filter((k) => a[k] !== undefined && b[k] !== undefined && a[k] !== b[k]).length;

function candidates(axis, opts) {
  if (opts.fix[axis]) return opts.fix[axis];
  let values = AXES[axis].filter((v) => !(opts.exclude[axis] || []).includes(v));
  if (!opts.immersive) {
    if (axis === 'motion') values = values.filter((v) => v !== '3');
    if (axis === 'imagery') values = values.filter((v) => v !== 'render-3d');
  }
  if (!values.length) fail(`every value of ${axis} is excluded`);
  return values;
}

// Values used less often in recent history are proportionally more likely.
function pick(axis, opts, recent, rand) {
  const values = candidates(axis, opts);
  const weights = values.map((v) => 1 / (1 + recent.filter((e) => e.axes[axis] === v).length));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = (rand(1_000_000) / 1_000_000) * total;
  for (let i = 0; i < values.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return values[i];
  }
  return values[values.length - 1];
}

export function deal(opts, recent, rand) {
  let best = null;
  for (let attempt = 0; attempt < 200; attempt++) {
    const axes = Object.fromEntries(AXIS_NAMES.map((axis) => [axis, pick(axis, opts, recent, rand)]));
    const score = recent.length ? Math.min(...recent.map((e) => diff(axes, e.axes))) : AXIS_NAMES.length;
    if (!best || score > best.score) best = { axes, score };
    if (score >= MIN_DIFF) break;
  }
  return best.axes;
}

function print(axes) {
  for (const axis of AXIS_NAMES) if (axes[axis] !== undefined) process.stdout.write(`${axis.padEnd(8)} ${axes[axis]}\n`);
}

const HELP = `deal.mjs — deal design axes for a mockup candidate (references/direction.md)

  node deal.mjs [--n 1] [--fix axis=value,...] [--exclude axis=value,...]
                [--allow-immersive] [--seed <int>] [--history <file>] [--no-history]
  node deal.mjs record --ground <v> --type <v> [--colour <v>] [--layout <v>] ...
  node deal.mjs recent
  node deal.mjs axes

motion 3 and imagery render-3d are dealt only with --allow-immersive (flagship tier).
History: $ULTRAWEB_HOME/history.json, default ~/.ultraweb/history.json.
`;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.cmd === 'help') return void process.stdout.write(HELP);
  if (opts.cmd === 'axes') {
    for (const axis of AXIS_NAMES) process.stdout.write(`${axis.padEnd(8)} ${AXES[axis].join(', ')}\n`);
    return;
  }
  const history = readHistory(opts);
  if (opts.cmd === 'recent') {
    const approved = history.filter((e) => e.kind === 'approved').slice(-5);
    if (!approved.length) return void process.stdout.write('no approved directions recorded\n');
    for (const e of approved) {
      process.stdout.write(`${e.at || ''}  ${AXIS_NAMES.filter((k) => e.axes[k]).map((k) => `${k}=${e.axes[k]}`).join(' ')}\n`);
    }
    return;
  }
  if (opts.cmd === 'record') {
    if (!opts.record.ground || !opts.record.type) fail('record needs at least --ground and --type');
    history.push({ kind: 'approved', at: new Date().toISOString().slice(0, 10), axes: opts.record });
    writeHistory(opts, history);
    process.stdout.write('recorded\n');
    return;
  }
  const rand = Number.isFinite(opts.seed) ? seeded(opts.seed) : (max) => randomInt(max);
  for (let i = 0; i < opts.n; i++) {
    const axes = deal(opts, history.slice(-KEEP), rand);
    if (i) process.stdout.write('\n');
    print(axes);
    history.push({ kind: 'dealt', at: new Date().toISOString().slice(0, 10), axes });
  }
  writeHistory(opts, history);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
