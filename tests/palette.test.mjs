// Tests for scripts/palette.mjs — verified-contrast OKLCH token generator.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'palette.mjs');
const run = (args) => spawnSync('node', [script, ...args], { encoding: 'utf8' });

// ---- independent colour maths (deliberately not imported from the script) ----
function oklchToLin(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const enc = (x) => { x = Math.min(1, Math.max(0, x)); return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055; };
const toHex = (lin) => '#' + lin.map((v) => Math.round(enc(v) * 255).toString(16).padStart(2, '0')).join('');
const lumHex = (hex) => {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const ratio = (h1, h2) => { const a = lumHex(h1), b = lumHex(h2); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
const parseOklch = (s) => { const m = /oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/.exec(s); return m && [+m[1], +m[2], +m[3]]; };
const oklchHex = (s) => { const [L, C, H] = parseOklch(s); return toHex(oklchToLin(L, C, H)); };
const inGamut = (s) => { const [L, C, H] = parseOklch(s); return oklchToLin(L, C, H).every((v) => v >= -0.002 && v <= 1.002); };

function parseBlocks(css) {
  const out = {};
  for (const m of css.matchAll(/(:root|\.dark)\s*\{([^}]*)\}/g)) {
    out[m[1] === ':root' ? 'root' : 'dark'] = Object.fromEntries([...m[2].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()]));
  }
  return out;
}
const FLOORS = [['foreground', 'background', 4.5], ['card-foreground', 'card', 4.5], ['muted-foreground', 'background', 4.5], ['muted-foreground', 'muted', 4.5], ['primary-foreground', 'primary', 4.5], ['accent-foreground', 'accent', 4.5], ['border', 'background', 1.3], ['ring', 'background', 3], ['popover-foreground', 'popover', 4.5], ['secondary-foreground', 'secondary', 4.5], ['destructive-foreground', 'destructive', 4.5], ['destructive', 'background', 3], ['input', 'background', 3], ['success-foreground', 'success', 4.5], ['success', 'background', 3], ['warning-foreground', 'warning', 4.5], ['warning', 'background', 3]];
const SEMANTIC = ['background', 'foreground', 'card', 'card-foreground', 'primary', 'primary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'border', 'ring', 'popover', 'popover-foreground', 'secondary', 'secondary-foreground', 'destructive', 'destructive-foreground', 'input', 'success', 'success-foreground', 'warning', 'warning-foreground', 'shadow-color', 'shadow-k', 'radius'];

test('contrast: black on white is 21:1 and #767676 on white is about 4.54', () => {
  assert.ok(Math.abs(ratio('#000000', '#ffffff') - 21) < 0.001);
  assert.ok(Math.abs(ratio('#767676', '#ffffff') - 4.54) < 0.02);
});

test('OKLCH to sRGB: red, white and black', () => {
  const [L, C, H] = [0.628, 0.2577, 29.23];
  const got = toHex(oklchToLin(L, C, H));
  for (const i of [1, 3, 5]) assert.ok(Math.abs(parseInt(got.slice(i, i + 2), 16) - (i === 1 ? 255 : 0)) <= 2, got);
  assert.equal(toHex(oklchToLin(1, 0, 0)), '#ffffff');
  assert.equal(toHex(oklchToLin(0, 0, 0)), '#000000');
});

test('the script agrees with the independent maths: json hex equals the oklch it prints', () => {
  const r = run(['--ground', 'light-tinted', '--hue', '40', '--format', 'json']);
  assert.equal(r.status, 0);
  const j = JSON.parse(r.stdout);
  const css = run(['--ground', 'light-tinted', '--hue', '40']).stdout;
  const root = parseBlocks(css).root;
  for (const k of ['background', 'foreground', 'primary', 'border']) {
    const a = j.root[k], b = oklchHex(root[k]);
    for (const i of [1, 3, 5]) assert.ok(Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)) <= 1, `${k} ${a} vs ${b}`);
  }
});

const GROUNDS = ['light-neutral', 'light-tinted', 'dark', 'saturated-colour', 'mid-tone'];
test('every ground x hue x chroma x colour mode meets every floor in both themes (recomputed from emitted values)', () => {
  for (const ground of GROUNDS) {
    for (const hue of [0, 30, 75, 110, 145, 190, 230, 265, 300, 340]) {
      const chroma = ['low', 'medium', 'high'][hue % 3];
      const colour = ['one-accent', 'two-colour-pair', 'monochrome'][(hue / 5) % 3 | 0];
      const r = run(['--ground', ground, '--hue', String(hue), '--chroma', chroma, '--colour', colour, '--accent-hue', String((hue + 120) % 360), '--dual']);
      assert.equal(r.status, 0, `${ground} ${hue}: ${r.stderr}`);
      const blocks = parseBlocks(r.stdout);
      assert.ok(blocks.root && blocks.dark, `${ground} ${hue}: both themes`);
      for (const theme of ['root', 'dark']) {
        for (const t of SEMANTIC.filter((x) => theme === 'root' || x !== 'radius')) assert.ok(blocks[theme][t] !== undefined, `${ground} ${hue} ${theme}: --${t}`);
        for (const [fg, bg, floor] of FLOORS) {
          const c = ratio(oklchHex(blocks[theme][fg]), oklchHex(blocks[theme][bg]));
          assert.ok(c >= floor, `${ground} h${hue} ${theme} ${fg}/${bg} = ${c.toFixed(2)} < ${floor}`);
        }
        assert.ok(blocks[theme].foreground, 'foreground');
        for (const t of ['background', 'foreground', 'primary', 'accent', 'border']) assert.ok(inGamut(blocks[theme][t]), `${ground} ${hue} ${t} inside sRGB`);
      }
    }
  }
});

test('foreground reaches 7:1 on every light and dark ground (mid-tone may not)', () => {
  for (const ground of ['light-neutral', 'light-tinted', 'dark', 'saturated-colour']) {
    for (const hue of [10, 100, 200, 300]) {
      const blocks = parseBlocks(run(['--ground', ground, '--hue', String(hue), '--dual']).stdout);
      for (const theme of ['root', 'dark']) assert.ok(ratio(oklchHex(blocks[theme].foreground), oklchHex(blocks[theme].background)) >= 7, `${ground} ${hue} ${theme}`);
    }
  }
});

test('dark theme is re-decided, not inverted: background is dark, card is lighter than background', () => {
  const b = parseBlocks(run(['--ground', 'light-neutral', '--hue', '250', '--dual']).stdout);
  const L = (s) => parseOklch(s)[0];
  assert.ok(L(b.dark.background) < 0.3 && L(b.dark.background) > 0.1, 'not pure black');
  assert.ok(L(b.dark.card) > L(b.dark.background));
  assert.ok(L(b.root.background) > 0.9);
});

test('saturated ground: the page background itself is chromatic', () => {
  const b = parseBlocks(run(['--ground', 'saturated-colour', '--hue', '25']).stdout);
  const [, C, H] = parseOklch(b.root.background);
  assert.ok(C > 0.1, `chroma ${C}`);
  assert.ok(Math.abs(H - 25) < 0.5);
});

test('out-of-gamut request is mapped by chroma reduction, not clipped: hue preserved within 2 degrees', () => {
  // blue at high chroma is far outside sRGB at most lightnesses
  const r = run(['--ground', 'saturated-colour', '--hue', '265', '--chroma', 'high', '--format', 'json']);
  assert.equal(r.status, 0);
  const hex = JSON.parse(r.stdout).root.background;
  const lin = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = Math.cbrt(0.4122214708 * lin[0] + 0.5363325363 * lin[1] + 0.0514459929 * lin[2]);
  const m = Math.cbrt(0.2119034982 * lin[0] + 0.6806995451 * lin[1] + 0.1073969566 * lin[2]);
  const s = Math.cbrt(0.0883024619 * lin[0] + 0.2817188376 * lin[1] + 0.6299787005 * lin[2]);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let h = (Math.atan2(b, a) * 180) / Math.PI; if (h < 0) h += 360;
  assert.ok(Math.abs(h - 265) <= 2, `hue ${h.toFixed(1)}`);
  assert.ok(Math.hypot(a, b) > 0.1, 'chroma kept high, not collapsed to grey');
  // and the emitted oklch is itself inside the gamut, with chroma below what was requested
  const css = parseBlocks(run(['--ground', 'saturated-colour', '--hue', '265', '--chroma', 'high']).stdout).root;
  assert.ok(inGamut(css.background));
  assert.ok(parseOklch(css.background)[1] <= 0.22);
  // check mode maps an out-of-gamut declaration by chroma reduction and says so
  const dir = mkdtempSync(join(tmpdir(), 'pal-'));
  const f = join(dir, 'oog.css');
  writeFileSync(f, ':root{--background:oklch(0.9 0.35 265);--foreground:#000;}');
  assert.match(run(['check', f]).stdout, /out of sRGB gamut, measured after chroma reduction/);
});

test('formats: tailwind has the tokens.md structure, json has hex per token, --out writes a file', () => {
  const tw = run(['--ground', 'dark', '--hue', '150', '--accent-hue', '60', '--dual', '--format', 'tailwind']).stdout;
  for (const s of ['@import "tailwindcss";', ':root {', '.dark {', '@theme inline {', '--color-background: var(--background);', '--radius-lg: var(--radius);']) assert.ok(tw.includes(s), s);
  const j = JSON.parse(run(['--ground', 'dark', '--hue', '150', '--dual', '--format', 'json']).stdout);
  for (const t of SEMANTIC.filter((x) => !['radius', 'shadow-k'].includes(x))) assert.match(j.root[t], /^#[0-9a-f]{6}$/, t);
  assert.ok(j.dark.background && j.radius === '0.5rem');
  const dir = mkdtempSync(join(tmpdir(), 'pal-'));
  const out = join(dir, 'tokens.css');
  const r = run(['--ground', 'light-neutral', '--hue', '200', '--radius', '0.75', '--out', out]);
  assert.equal(r.status, 0);
  const css = run(['check', out]);
  assert.equal(css.status, 0, css.stdout);
  assert.match(require_fs(out), /--radius: 0\.75rem;/);
});
import { readFileSync } from 'node:fs';
function require_fs(p) { return readFileSync(p, 'utf8'); }

test('check: passes a generated file, exits 1 on a planted failing pair, reads hex and rgb', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pal-'));
  const good = join(dir, 'good.css');
  writeFileSync(good, run(['--ground', 'dark', '--hue', '150', '--dual']).stdout);
  const ok = run(['check', good]);
  assert.equal(ok.status, 0, ok.stdout);
  assert.match(ok.stdout, /check passed/);

  const bad = join(dir, 'bad.css');
  writeFileSync(bad, run(['--ground', 'light-neutral', '--hue', '250']).stdout.replace(/--muted-foreground: [^;]+;/, '--muted-foreground: oklch(0.85 0.01 250);'));
  const r = run(['check', bad]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /muted-foreground on --background/);
  assert.match(r.stdout, /FAIL/);

  const hex = join(dir, 'hex.css');
  writeFileSync(hex, ':root{--background:#ffffff;--foreground:#767676;--card:#fff;--card-foreground:rgb(0 0 0);--primary:#000;--primary-foreground:#fff;--muted:#f4f4f4;--muted-foreground:#595959;--accent:#eee;--accent-foreground:#111;--border:#d0d0d0;--ring:var(--primary);}');
  const h = run(['check', hex]);
  assert.equal(h.status, 0, h.stdout);
  assert.match(h.stdout, /4\.5\d:1/); // #767676 on white, the known pair
  assert.match(h.stdout, /PASS\*/);

  const missing = join(dir, 'missing.css');
  writeFileSync(missing, ':root{--background:#fff;--foreground:#000;}');
  const m = run(['check', missing]);
  assert.equal(m.status, 1);
  assert.match(m.stdout, /missing token/);
});

test('extended tokens: secondary differs from muted, error hue shifts near a red ground, --destructive-hue is honoured, check treats them as optional', () => {
  const b = parseBlocks(run(['--ground', 'light-neutral', '--hue', '250', '--dual']).stdout);
  assert.notEqual(b.root.secondary, b.root.muted);
  assert.ok(Math.abs(parseOklch(b.root.secondary)[0] - parseOklch(b.root.muted)[0]) <= 0.04);
  const near = run(['--ground', 'light-tinted', '--hue', '20']);
  assert.match(near.stderr, /error hue shifted/);
  const h = parseOklch(parseBlocks(near.stdout).root.destructive)[2];
  assert.ok(Math.abs(h - 20) >= 29.9, `shifted hue ${h}`);
  const pinned = parseBlocks(run(['--ground', 'light-neutral', '--hue', '250', '--destructive-hue', '350']).stdout);
  assert.ok(Math.abs(parseOklch(pinned.root.destructive)[2] - 350) < 1);
  const dir = mkdtempSync(join(tmpdir(), 'pal-'));
  const f = join(dir, 'core.css');
  writeFileSync(f, run(['--ground', 'light-neutral', '--hue', '250']).stdout.replace(/ {2}--(popover|secondary|destructive|input|success|warning)[\w-]*: [^;]+;\n/g, ''));
  assert.equal(run(['check', f]).status, 0);
  const g = join(dir, 'bad-input.css');
  writeFileSync(g, run(['--ground', 'light-neutral', '--hue', '250']).stdout.replace(/--input: [^;]+;/, '--input: oklch(0.95 0.004 250);'));
  const r = run(['check', g]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /--input on --background/);
});

test('bad input exits 2', () => {
  for (const args of [[], ['--ground', 'neon', '--hue', '10'], ['--ground', 'dark'], ['--ground', 'dark', '--hue', '400'], ['--ground', 'dark', '--hue', 'x'], ['--ground', 'dark', '--hue', '10', '--format', 'xml'], ['--ground', 'dark', '--hue', '10', '--chroma', 'loud'], ['--ground', 'dark', '--hue', '10', '--bogus'], ['--ground', 'dark', '--hue', '10', '--radius', '-1'], ['check'], ['check', '/nonexistent/file.css']]) {
    const r = run(args);
    if (args.length === 0) { assert.equal(r.status, 0); continue; } // no args prints help
    assert.equal(r.status, 2, `${args.join(' ')} -> ${r.status}`);
  }
});

test('--help documents the options', () => {
  const r = run(['--help']);
  assert.equal(r.status, 0);
  for (const s of ['--ground', '--accent-hue', '--second-hue', '--dual', '--format', 'check <css-file>']) assert.ok(r.stdout.includes(s), s);
});
