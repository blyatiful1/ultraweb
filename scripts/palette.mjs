#!/usr/bin/env node
// palette.mjs — generates a complete semantic token set in OKLCH with contrast VERIFIED by
// measurement, so no model has to do colour arithmetic. Hue and ground come from the caller
// (design/DIRECTION.md); this script decides lightness and proves the pairs. See references/color.md.
//
//   node palette.mjs --ground <g> --hue <0-360> [options]      generate tokens
//   node palette.mjs check <css-file>                          verify an existing token file
//   node palette.mjs --help
//
// Exit codes: 0 ok, 1 a contrast pair cannot be met (generate) or fails (check), 2 bad input.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const GROUNDS = ['light-neutral', 'light-tinted', 'dark', 'saturated-colour', 'mid-tone'];
export const TOKENS = [
  'background', 'foreground', 'card', 'card-foreground', 'primary', 'primary-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground', 'border', 'ring',
];
export const EXT_TOKENS = [
  'popover', 'popover-foreground', 'secondary', 'secondary-foreground', 'destructive', 'destructive-foreground',
  'input', 'success', 'success-foreground', 'warning', 'warning-foreground',
];
export const EXTRA_TOKENS = ['shadow-color', 'shadow-k', 'radius'];
export const COLOUR_TOKENS = [...TOKENS, ...EXT_TOKENS];
export const CORE_TOKENS = [...TOKENS, ...EXTRA_TOKENS]; // what a project must define (check-phase 3)
export const ALL_TOKENS = [...COLOUR_TOKENS, ...EXTRA_TOKENS];
// [foreground-side token, surface token, floor, target (or null), optional]
export const PAIRS = [
  ['foreground', 'background', 4.5, 7],
  ['card-foreground', 'card', 4.5, null],
  ['muted-foreground', 'background', 4.5, null],
  ['muted-foreground', 'muted', 4.5, null],
  ['primary-foreground', 'primary', 4.5, null],
  ['accent-foreground', 'accent', 4.5, null],
  ['border', 'background', 1.3, null],
  ['ring', 'background', 3, null],
  // extended shadcn set: verified when present, optional in `check`
  ['popover-foreground', 'popover', 4.5, null, true],
  ['secondary-foreground', 'secondary', 4.5, null, true],
  ['destructive-foreground', 'destructive', 4.5, null, true],
  ['destructive', 'background', 3, null, true],
  ['input', 'background', 3, null, true],
  ['success-foreground', 'success', 4.5, null, true],
  ['success', 'background', 3, null, true],
  ['warning-foreground', 'warning', 4.5, null, true],
  ['warning', 'background', 3, null, true],
];
const MARGIN = 0.05; // generation aims this far above each floor so rounding cannot undercut it

const HELP = `palette.mjs — OKLCH semantic tokens with verified WCAG contrast.

Generate:
  node palette.mjs --ground <ground> --hue <0-360> [options]

  --ground <g>        light-neutral | light-tinted | dark | saturated-colour | mid-tone   (required)
                      saturated-colour: the page background itself is a chromatic colour; the
                      script picks the lightness at which the foreground reaches 7:1.
                      dark with --dual: :root is a light-tinted counterpart, .dark is the dark ground.
  --hue <0-360>       hue of the ground (neutrals carry a hint of it)                      (required)
  --accent-hue <n>    hue of primary/ring; default = --hue
  --chroma <c>        low | medium | high   accent strength; default medium
  --destructive-hue <n>  hue of the error colour; default 25, shifted automatically (and noted in the
                      table) when the ground or accent hue is within 30 degrees of it
  --colour <m>        monochrome | one-accent | two-colour-pair | polychrome; default one-accent.
                      polychrome emits the one-accent set: add the colours of your real source
                      (product range, artwork) as extra tokens yourself, then run the check command
  --second-hue <n>    hue of the second colour (the --accent token) for two-colour-pair;
                      default accent hue + 150
  --dual              also emit .dark, a re-decided dark theme (elevation by lightness, not inversion)
  --radius <rem>      the one radius knob; default 0.5
  --format <f>        css (plain custom properties, static path) | tailwind (references/tokens.md
                      structure: @import, :root, .dark, @theme inline bridge) | json (resolved
                      sRGB hex per token for OG images and email); default css
  --out <file>        write the result to a file. Without it the result goes to stdout and the
                      verification table to stderr; with it the table goes to stdout.

Tokens: ${ALL_TOKENS.join(' ')}
  (shadcn set: popover, secondary, destructive, input, success, warning with foregrounds; --input is the form
  field boundary >= 3:1, --border stays the decorative hairline >= 1.3:1; status fills are >= 3:1 on the
  background so they can be used as large text and icons)

Guarantees (measured on the 8-bit sRGB that actually renders; adjustments are noted in the table):
  foreground/background >= 7:1 where achievable, never < 4.5   card-foreground/card >= 4.5
  muted-foreground on background and on muted >= 4.5           primary-foreground/primary >= 4.5
  accent-foreground/accent >= 4.5   border/background >= 1.3   ring/background >= 3
  popover, secondary, destructive, success, warning foregrounds >= 4.5; destructive, success, warning,
  input against background >= 3
Out-of-gamut colours are mapped by reducing chroma (hue and lightness kept), never clipped.
Emitted colours are always inside sRGB, so no browser gamut-mapping can change a verified pair.

Check an existing file:
  node palette.mjs check <css-file>
  Reads --token: oklch()|#hex|rgb()|hsl() declarations (var(--x) resolved) in :root and .dark
  (the extended shadcn tokens are verified when present, not required),
  prints the same table, exits 1 if any pair fails the floors (7:1 is a target, not a failure).
`;

// ---------- colour maths ----------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

export function oklchToLinear(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
export function linearToOklch(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, C < 1e-4 ? 0 : H];
}
const encode = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const decode = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const inGamut = (lin) => lin.every((v) => v >= -1e-6 && v <= 1 + 1e-6);

/** Largest chroma <= C that is inside sRGB at this L and H (binary search; hue and L untouched). */
export function gamutMapChroma(L, C, H) {
  if (inGamut(oklchToLinear(L, C, H))) return C;
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinear(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function relLuminance(r8, g8, b8) {
  return 0.2126 * decode(r8 / 255) + 0.7152 * decode(g8 / 255) + 0.0722 * decode(b8 / 255);
}
export function contrastRatio(l1, l2) {
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const hex2 = (n) => n.toString(16).padStart(2, '0');
const fmtNum = (x, d) => String(round(x, d));
function build(L, C, H, mapped = false) {
  const lin = oklchToLinear(L, C, H).map((v) => clamp(v, 0, 1));
  const rgb = lin.map((v) => Math.round(clamp(encode(v), 0, 1) * 255));
  return {
    L, C, H, rgb, mapped,
    hex: `#${rgb.map(hex2).join('')}`,
    lum: relLuminance(...rgb),
    css: `oklch(${fmtNum(L, 3)} ${fmtNum(C, 4)} ${fmtNum(H, 1)})`,
  };
}
/** A colour we emit: rounded to the printed precision, chroma floored so it stays inside sRGB. */
export function mk(L, C, H) {
  L = round(clamp(L, 0, 1), 3);
  H = round(((H % 360) + 360) % 360, 1);
  let c = Math.floor(gamutMapChroma(L, Math.max(0, C), H) * 1e4) / 1e4;
  while (c > 0 && !inGamut(oklchToLinear(L, c, H))) c = Math.max(0, c - 1e-4);
  return build(L, c, H);
}
/** A colour read from a file: out-of-gamut values are mapped the way a browser would (chroma reduction). */
export function fromOklchMapped(L, C, H) {
  const c = gamutMapChroma(L, C, H);
  const o = build(L, c, H, c < C - 1e-6);
  o.css = `oklch(${fmtNum(L, 3)} ${fmtNum(C, 4)} ${fmtNum(H, 1)})`;
  return o;
}
export function fromRgb(r, g, b) {
  const rgb = [r, g, b].map((v) => Math.round(clamp(v, 0, 255)));
  const [L, C, H] = linearToOklch(...rgb.map((v) => decode(v / 255)));
  return { L, C, H, rgb, mapped: false, hex: `#${rgb.map(hex2).join('')}`, lum: relLuminance(...rgb), css: `oklch(${fmtNum(L, 3)} ${fmtNum(C, 4)} ${fmtNum(H, 1)})` };
}
export const contrast = (a, b) => contrastRatio(a.lum, b.lum);
const angDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

// ---------- generation ----------
class PaletteError extends Error {
  constructor(theme, fg, bg, ratio, floor) {
    super(`${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, floor ${floor}:1 cannot be met`);
    this.pair = { theme, fg, bg, ratio, floor };
  }
}

/** Walk lightness from L0 toward dir until min contrast over bgs reaches target. */
function seek({ L0, dir, C, H, bgs, target, step = 0.003 }) {
  let best = null;
  for (let i = 0; ; i++) {
    const raw = L0 + dir * i * step;
    const L = clamp(raw, 0, 1);
    const c = mk(L, C, H);
    const r = Math.min(...bgs.map((b) => contrast(c, b)));
    if (!best || r > best.r) best = { c, r };
    if (r >= target) return { ...best, c, r, ok: true };
    if (L === 0 || L === 1) break;
  }
  return { ...best, ok: false };
}

function offsets() {
  const o = [0];
  for (let i = 1; i <= 120; i++) o.push(i * 0.005, -i * 0.005);
  return o;
}
const OFFS = offsets();

/** A chromatic fill (primary or the second colour) that is >= 3:1 on bg and carries >= 4.5:1 text. */
function pickFill({ H, C, pref, bg }) {
  for (const off of OFFS) {
    const L = pref + off;
    if (L < 0.05 || L > 0.97) continue;
    const c = mk(L, C, H);
    if (contrast(c, bg) < 3 + MARGIN) continue;
    const w = mk(0.985, 0.01, H);
    const k = mk(0.18, 0.02, H);
    const rw = contrast(w, c);
    const rk = contrast(k, c);
    const [on, r] = rw >= rk ? [w, rw] : [k, rk];
    if (r >= 4.5 + MARGIN) return { c, on, r, moved: Math.abs(off) > 0.004, pref, L };
  }
  return null;
}

const CHROMA = {
  accent: { low: 0.06, medium: 0.13, high: 0.21 },
  tint: { low: 0.014, medium: 0.022, high: 0.03 },
  sat: { low: 0.09, medium: 0.15, high: 0.22 },
  mid: { low: 0.05, medium: 0.09, high: 0.14 },
};

function groundSpec(ground, o, dark) {
  // returns {bg:[L,C,H], side:'dark'|'light'(foreground side), note}
  const H = o.hue;
  if (dark) {
    if (ground === 'saturated-colour') return { bg: [0.25, Math.min(CHROMA.sat[o.chroma] * 0.5, 0.09), H], side: 'light' };
    if (ground === 'mid-tone') return { bg: [0.2, CHROMA.tint[o.chroma], H], side: 'light' };
    return { bg: [0.17, CHROMA.tint[o.chroma] * 0.7, H], side: 'light' };
  }
  if (ground === 'light-neutral') return { bg: [0.985, 0.004, H], side: 'dark' };
  if (ground === 'light-tinted') return { bg: [0.955, CHROMA.tint[o.chroma], H], side: 'dark' };
  if (ground === 'dark') return { bg: [0.17, CHROMA.tint[o.chroma] * 0.7, H], side: 'light' };
  if (ground === 'saturated-colour') {
    const C = CHROMA.sat[o.chroma];
    if (H >= 65 && H <= 190) return { bg: [0.86, C, H], side: 'dark', note: `bright field (L 0.86) with dark text` };
    const white = mk(0.985, 0.01, H);
    for (let L = 0.55; L >= 0.3; L -= 0.01) {
      if (contrast(mk(L, C, H), white) >= 7 + MARGIN) return { bg: [round(L, 2), C, H], side: 'light', note: `field lightness set to ${round(L, 2)} so light text reaches 7:1` };
    }
    return { bg: [0.3, C, H], side: 'light' };
  }
  // mid-tone: choose whichever text side gives more contrast
  const bg = mk(0.64, CHROMA.mid[o.chroma], H);
  const side = contrast(mk(0, 0, 0), bg) >= contrast(mk(1, 0, 0), bg) ? 'dark' : 'light';
  return { bg: [0.64, CHROMA.mid[o.chroma], H], side };
}

function buildTheme(themeName, ground, o, dark, flip = false) {
  const spec = groundSpec(ground, o, dark);
  const notes = {};
  const addNote = (pair, text) => { notes[pair] = notes[pair] ? `${notes[pair]}; ${text}` : text; };
  if (spec.note) addNote('foreground/background', spec.note);
  const H = o.hue;
  const side = spec.side;
  const bg = mk(...spec.bg);
  const sat = ground === 'saturated-colour';

  // surfaces
  // elevation is lightness; on a mid-lightness field with light text the card steps darker so text contrast is kept
  const cardDelta = side === 'dark' ? (bg.L >= 0.9 ? 0.03 : 0.04) : bg.L >= 0.3 ? -0.04 : 0.04;
  const card = mk(Math.min(1, bg.L + cardDelta), bg.C * 0.6, H);
  let mutedDelta = side === 'dark' ? (bg.L >= 0.9 ? -0.04 : 0.05) : bg.L < 0.3 ? 0.06 : -0.05;
  if (flip) mutedDelta = -mutedDelta;
  const muted = mk(bg.L + mutedDelta, bg.C, H);

  // foreground (neutral tinted with the ground hue)
  const fgC = sat ? 0.03 : 0.02;
  const dir = side === 'dark' ? -1 : 1;
  let r = seek({ L0: side === 'dark' ? 0.28 : 0.95, dir, C: fgC, H, bgs: [bg, card], target: 7 + MARGIN });
  if (!r.ok) {
    // 7:1 is unreachable: take the strongest text the ground allows, provided the floor holds
    if (r.r < 4.5 + MARGIN) throw new PaletteError(themeName, 'foreground', 'background', r.r, 4.5);
    addNote('foreground/background', `7:1 not reachable on this ground (best ${r.r.toFixed(2)}:1); lightness pushed to the limit, 4.5:1 floor met`);
  }
  const foreground = r.c;

  // muted-foreground: >= 4.5 on background, muted and card
  const mr = seek({ L0: side === 'dark' ? 0.5 : 0.72, dir, C: fgC, H, bgs: [bg, muted, card], target: 4.5 + MARGIN });
  if (!mr.ok) throw new PaletteError(themeName, 'muted-foreground', 'muted', mr.r, 4.5);
  const mutedFg = mr.c;
  const startL = side === 'dark' ? 0.5 : 0.72;
  if (Math.abs(mutedFg.L - startL) > 0.004) {
    addNote('muted-foreground/muted', `lightness moved ${startL} -> ${mutedFg.L} to reach 4.5:1`);
    addNote('muted-foreground/background', `lightness moved ${startL} -> ${mutedFg.L} to reach 4.5:1`);
  }

  // accent hue and chroma
  const accentH = o.accentHue ?? H;
  let Cp = CHROMA.accent[o.chroma];
  if (o.colour === 'monochrome') Cp = 0.02;
  if (dark && !sat) Cp *= 0.85;
  const prefP = side === 'dark' ? (bg.L > 0.9 ? 0.5 : 0.3) : bg.L < 0.3 ? 0.74 : 0.88;

  let primary;
  let primaryFg;
  const sameAsGround = sat && (o.accentHue === undefined || angDiff(accentH, H) < 30 || o.colour === 'monochrome');
  const fgAsPrimary = () => {
    primary = foreground;
    primaryFg = bg;
    addNote('primary-foreground/primary', 'primary is the foreground colour (accent hue matches the saturated ground)');
  };
  if (sameAsGround) fgAsPrimary();
  else {
    const p = pickFill({ H: accentH, C: Cp, pref: prefP, bg });
    if (!p) {
      if (sat || ground === 'mid-tone') fgAsPrimary();
      else throw new PaletteError(themeName, 'primary', 'background', 0, 3);
    } else {
      primary = p.c;
      primaryFg = p.on;
      if (p.moved) addNote('primary-foreground/primary', `primary lightness moved ${p.pref} -> ${round(p.L, 3)} so ring reaches 3:1 and text 4.5:1`);
    }
  }
  const ring = primary;

  // accent: a second colour fill (two-colour-pair) or a soft tinted surface
  let accent;
  let accentFg;
  if (o.colour === 'two-colour-pair') {
    const sh = o.secondHue ?? (accentH + 150) % 360;
    const a = pickFill({ H: sh, C: Cp, pref: side === 'dark' ? (bg.L > 0.9 ? 0.62 : 0.4) : bg.L < 0.3 ? 0.82 : 0.9, bg });
    if (a) {
      accent = a.c;
      accentFg = a.on;
      if (a.moved) addNote('accent-foreground/accent', `second colour lightness moved ${a.pref} -> ${round(a.L, 3)} to reach 3:1 on the ground`);
    }
  }
  if (!accent) {
    const dl = side === 'dark' ? (bg.L >= 0.9 ? -0.07 : 0.08) : bg.L < 0.3 ? 0.09 : -0.08;
    accent = mk(bg.L + (flip ? -dl : dl), Math.min(0.045, Cp * 0.4), accentH);
    let ar = seek({ L0: side === 'dark' ? 0.3 : 0.94, dir, C: 0.03, H: accentH, bgs: [accent], target: 7 + MARGIN });
    if (!ar.ok) {
      const alt = seek({ L0: side === 'dark' ? 0.3 : 0.94, dir, C: 0.03, H: accentH, bgs: [accent], target: 4.5 + MARGIN });
      if (!alt.ok) throw new PaletteError(themeName, 'accent-foreground', 'accent', ar.r, 4.5);
      addNote('accent-foreground/accent', `7:1 not reachable (best ${ar.r.toFixed(2)}:1); 4.5:1 floor met`);
      ar = alt;
    }
    accentFg = ar.c;
  }

  // border: >= 1.3 against background, built from the surface it sits on
  const bdir = side === 'dark' ? -1 : 1;
  const bs = seek({ L0: bg.L + bdir * 0.08, dir: bdir, C: bg.C, H, bgs: [bg], target: 1.3 + MARGIN });
  if (!bs.ok) throw new PaletteError(themeName, 'border', 'background', bs.r, 1.3);
  const border = bs.c;

  // extended shadcn set
  const popover = card;
  const secDir = mutedDelta >= 0 ? 1 : -1;
  const secondary = mk(muted.L + secDir * 0.035, bg.C * 1.2, H);
  const sr = seek({ L0: side === 'dark' ? 0.28 : 0.95, dir, C: fgC, H, bgs: [secondary], target: 4.5 + MARGIN });
  if (!sr.ok) throw new PaletteError(themeName, 'secondary-foreground', 'secondary', sr.r, 4.5);
  const secondaryFg = sr.c;
  const ir = seek({ L0: bg.L + bdir * 0.3, dir: bdir, C: bg.C, H, bgs: [bg], target: 3 + MARGIN });
  if (!ir.ok) throw new PaletteError(themeName, 'input', 'background', ir.r, 3);
  const input = ir.c;
  let dH = o.destructiveHue ?? 25;
  if (o.destructiveHue === undefined && (angDiff(dH, H) < 30 || angDiff(dH, accentH) < 30)) {
    const alt = [25, 10, 40, 355, 340, 55].find((c) => angDiff(c, H) >= 30 && angDiff(c, accentH) >= 30);
    if (alt !== undefined) {
      addNote('destructive/background', `error hue shifted 25 -> ${alt} to stay distinct from the brand hue`);
      addNote('destructive-foreground/destructive', `error hue shifted 25 -> ${alt} to stay distinct from the brand hue`);
      dH = alt;
    }
  }
  const status = (key, hue, C, prefDark, prefLight) => {
    const f = pickFill({ H: hue, C: dark && !sat ? C * 0.85 : C, pref: side === 'dark' ? prefDark : prefLight, bg });
    if (!f) throw new PaletteError(themeName, key, 'background', 0, 3);
    return f;
  };
  const dest = status('destructive', dH, 0.19, bg.L > 0.9 ? 0.55 : 0.35, bg.L < 0.3 ? 0.72 : 0.88);
  const succ = status('success', 150, 0.15, bg.L > 0.9 ? 0.52 : 0.35, bg.L < 0.3 ? 0.74 : 0.88);
  const warn = status('warning', 80, 0.14, bg.L > 0.9 ? 0.55 : 0.35, bg.L < 0.3 ? 0.8 : 0.9);

  // shadow: dark-text grounds get a tinted shadow; light-text (dark) themes a black one at higher strength
  const sh = side === 'light' && !sat ? { color: mk(0, 0, 0), k: 2.2 } : sat ? { color: mk(0.2, 0.06, H), k: 1.2 } : { color: mk(0.25, 0.04, H), k: 1 };

  const tokens = {
    background: bg, foreground, card, 'card-foreground': foreground,
    primary, 'primary-foreground': primaryFg, muted, 'muted-foreground': mutedFg,
    accent, 'accent-foreground': accentFg, border, ring,
    'shadow-color': sh.color,
    popover, 'popover-foreground': foreground, secondary, 'secondary-foreground': secondaryFg,
    destructive: dest.c, 'destructive-foreground': dest.on, input,
    success: succ.c, 'success-foreground': succ.on, warning: warn.c, 'warning-foreground': warn.on,
  };
  return { tokens, shadowK: sh.k, notes, side, ground: spec };
}

function buildWithFallback(themeName, ground, o, dark) {
  let firstErr;
  for (const flip of [false, true]) {
    try {
      const t = buildTheme(themeName, ground, o, dark, flip);
      const rows = verify(t.tokens, themeName, t.notes);
      const bad = rows.find((x) => x.status === 'FAIL');
      if (bad) throw new PaletteError(themeName, bad.fg, bad.bg, bad.ratio ?? 0, bad.floor);
      return { ...t, rows };
    } catch (e) {
      if (!(e instanceof PaletteError)) throw e;
      firstErr ??= e;
    }
  }
  throw firstErr;
}

// ---------- verification ----------
export function verify(tokens, theme, notes = {}) {
  return PAIRS.flatMap(([fg, bg, floor, target, optional]) => {
    const a = tokens[fg];
    const b = tokens[bg];
    const key = `${fg}/${bg}`;
    if (optional && (!a || !b)) return [];
    if (!a || !b) return [{ theme, fg, bg, floor, target, ratio: null, status: 'FAIL', note: `missing token ${!a ? `--${fg}` : `--${bg}`}` }];
    const ratio = contrast(a, b);
    let status = ratio >= floor ? 'PASS' : 'FAIL';
    let note = notes[key] || '';
    if (target && status === 'PASS' && ratio < target) {
      note ||= `below the ${target}:1 target, floor ${floor}:1 met`;
      status = 'PASS*';
    }
    if (a.mapped || b.mapped) note = `${note ? `${note}; ` : ''}out of sRGB gamut, measured after chroma reduction`;
    return [{ theme, fg, bg, floor, target, ratio, status, note }];
  });
}

export function formatTable(rows) {
  const w = (s, n) => String(s).padEnd(n);
  const lines = [`${w('theme', 6)} ${w('pair', 38)} ${w('ratio', 8)} ${w('floor', 6)} ${w('result', 6)} note`];
  for (const r of rows) {
    lines.push(`${w(r.theme, 6)} ${w(`--${r.fg} on --${r.bg}`, 38)} ${w(r.ratio == null ? 'n/a' : `${r.ratio.toFixed(2)}:1`, 8)} ${w(`${r.floor}:1`, 6)} ${w(r.status, 6)} ${r.note}`);
  }
  return lines.join('\n');
}

// ---------- output ----------
function block(selector, t, radius, withRadius, scheme) {
  const L = [`${selector} {`, `  color-scheme: ${scheme};`];
  for (const k of COLOUR_TOKENS) L.push(`  --${k}: ${t.tokens[k].css};`);
  L.push(`  --shadow-color: ${t.tokens['shadow-color'].css};`, `  --shadow-k: ${t.shadowK};`);
  if (withRadius) L.push(`  --radius: ${radius};`);
  L.push('}');
  return L.join('\n');
}

function render(themes, o) {
  const [main, dual] = themes; // main -> :root ; dual -> .dark (may be undefined)
  const radius = `${o.radius}rem`;
  const header = `/* palette.mjs --ground ${o.ground} --hue ${o.hue}${o.accentHue !== undefined ? ` --accent-hue ${o.accentHue}` : ''} --chroma ${o.chroma} --colour ${o.colour}${o.dual ? ' --dual' : ''}\n   Contrast verified. Re-verify after hand edits: node palette.mjs check <this file> */`;
  const blocks = [block(':root', main, radius, true, main.side === 'dark' ? 'light' : 'dark')];
  if (dual) blocks.push(block('.dark', dual, radius, false, 'dark'));
  if (o.format === 'css') return `${header}\n${blocks.join('\n')}\n`;
  const bridge = COLOUR_TOKENS.map((k) => `  --color-${k}: var(--${k});`).join('\n');
  return `${header}
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

${blocks.join('\n\n')}

@theme inline {
${bridge}
  --radius-sm: calc(var(--radius) * 0.5);
  --radius-md: calc(var(--radius) * 0.75);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.5);
}

@layer base {
  * { border-color: var(--color-border); }
  body { background: var(--color-background); color: var(--color-foreground); }
}
`;
}

function renderJson(themes, o, rows) {
  const toObj = (t) => ({ ...Object.fromEntries([...COLOUR_TOKENS, 'shadow-color'].map((k) => [k, t.tokens[k].hex])), 'shadow-k': t.shadowK });
  const out = { root: toObj(themes[0]), ...(themes[1] ? { dark: toObj(themes[1]) } : {}), radius: `${o.radius}rem`, verification: rows.map((r) => ({ theme: r.theme, pair: `${r.fg}/${r.bg}`, ratio: r.ratio == null ? null : round(r.ratio, 2), floor: r.floor, result: r.status, note: r.note })) };
  return `${JSON.stringify(out, null, 2)}\n`;
}

export function generate(o) {
  const themes = [];
  const rows = [];
  const mainDark = false;
  if (o.ground === 'dark' && o.dual) {
    themes.push(buildWithFallback('root', 'light-tinted', o, mainDark));
    themes.push(buildWithFallback('dark', 'dark', o, true));
  } else {
    themes.push(buildWithFallback('root', o.ground, o, false));
    if (o.dual) themes.push(buildWithFallback('dark', o.ground, o, true));
  }
  for (const t of themes) rows.push(...t.rows);
  return { themes, rows, css: o.format === 'json' ? renderJson(themes, o, rows) : render(themes, o) };
}

// ---------- check ----------
function stripComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, ''); }
function findBlocks(css) {
  const blocks = { root: {}, dark: {} };
  const re = /(^|[}\s;])(:root|\.dark|html\.dark|:root\.dark|html)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    const start = re.lastIndex;
    let depth = 1;
    let i = start;
    while (i < css.length && depth) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++; }
    const body = css.slice(start, i - 1);
    const key = m[2] === ':root' || m[2] === 'html' ? 'root' : 'dark';
    for (const d of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/g)) blocks[key][d[1].slice(2)] = d[2].trim();
    re.lastIndex = i;
  }
  return blocks;
}
export function parseColour(value, resolve, depth = 0) {
  const v = value.trim();
  let m;
  if ((m = /^var\(\s*--([\w-]+)\s*(?:,[^)]*)?\)$/.exec(v))) {
    if (depth > 8) return null;
    const next = resolve(m[1]);
    return next == null ? null : parseColour(next, resolve, depth + 1);
  }
  if ((m = /^oklch\(\s*([\d.]+)(%?)\s*[ ,]\s*([\d.]+)(%?)\s*[ ,]\s*([\d.]+)(?:deg)?\s*(?:\/[^)]*)?\)$/i.exec(v))) {
    const L = Number(m[1]) / (m[2] ? 100 : 1);
    const C = Number(m[3]) / (m[4] ? 100 * 2.5 : 1);
    return fromOklchMapped(clamp(L, 0, 1), C, Number(m[5]));
  }
  if ((m = /^#([0-9a-f]{3,8})$/i.exec(v))) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return fromRgb(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16));
  }
  if ((m = /^rgba?\(\s*([\d.]+)(%?)\s*[ ,]\s*([\d.]+)(%?)\s*[ ,]\s*([\d.]+)(%?)\s*(?:[,/][^)]*)?\)$/i.exec(v))) {
    const f = (n, p) => (p ? (Number(n) / 100) * 255 : Number(n));
    return fromRgb(f(m[1], m[2]), f(m[3], m[4]), f(m[5], m[6]));
  }
  if ((m = /^hsla?\(\s*([\d.]+)(?:deg)?\s*[ ,]\s*([\d.]+)%\s*[ ,]\s*([\d.]+)%\s*(?:[,/][^)]*)?\)$/i.exec(v))) {
    const h = Number(m[1]); const s = Number(m[2]) / 100; const l = Number(m[3]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return fromRgb(f(0) * 255, f(8) * 255, f(4) * 255);
  }
  return null;
}

/** Verify a token CSS text. Returns { rows, problems, themes }. */
export function checkCss(text) {
  const blocks = findBlocks(stripComments(text));
  const rows = [];
  const problems = [];
  const themes = blocks.dark && Object.keys(blocks.dark).length ? ['root', 'dark'] : ['root'];
  if (!Object.keys(blocks.root).length) problems.push('no :root block with custom properties found');
  for (const theme of themes) {
    const raw = theme === 'dark' ? { ...blocks.root, ...blocks.dark } : blocks.root;
    const resolve = (name) => raw[name] ?? (theme === 'dark' ? blocks.root[name] : undefined);
    const tokens = {};
    for (const name of COLOUR_TOKENS) {
      if (raw[name] === undefined) continue;
      const c = parseColour(raw[name], resolve);
      if (c) tokens[name] = c;
      else problems.push(`${theme}: --${name}: cannot read colour "${raw[name]}"`);
    }
    rows.push(...verify(tokens, theme === 'root' ? 'root' : 'dark'));
  }
  return { rows, problems };
}

function runCheck(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch (e) { die(`cannot read ${file}: ${e.message}`); }
  const { rows, problems } = checkCss(text);
  process.stdout.write(`${formatTable(rows)}\n`);
  for (const p of problems) process.stdout.write(`problem: ${p}\n`);
  const failed = rows.filter((r) => r.status === 'FAIL');
  if (failed.length || problems.length) {
    process.stdout.write(`check FAILED: ${failed.map((r) => `${r.theme} --${r.fg} on --${r.bg}${r.ratio == null ? '' : ` ${r.ratio.toFixed(2)}:1 < ${r.floor}:1`}`).concat(problems).join('; ')}\n`);
    process.exit(1);
  }
  process.stdout.write('check passed\n');
}

// ---------- CLI ----------
function die(msg) {
  process.stderr.write(`palette: ${msg}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const o = { ground: null, hue: null, chroma: 'medium', colour: 'one-accent', dual: false, radius: 0.5, format: 'css', out: null };
  const rest = [...argv];
  const num = (flag, v, lo, hi) => {
    const n = Number(v);
    if (v === undefined || v === '' || !Number.isFinite(n) || n < lo || n > hi) die(`${flag} needs a number from ${lo} to ${hi} (got "${v}")`);
    return n;
  };
  while (rest.length) {
    const a = rest.shift();
    const next = () => { if (!rest.length) die(`${a} needs a value`); return rest.shift(); };
    if (a === '--ground') { o.ground = next(); if (!GROUNDS.includes(o.ground)) die(`--ground must be one of ${GROUNDS.join(', ')}`); }
    else if (a === '--hue') o.hue = num(a, next(), 0, 360);
    else if (a === '--accent-hue') o.accentHue = num(a, next(), 0, 360);
    else if (a === '--destructive-hue') o.destructiveHue = num(a, next(), 0, 360);
    else if (a === '--second-hue') o.secondHue = num(a, next(), 0, 360);
    else if (a === '--chroma') { o.chroma = next(); if (!['low', 'medium', 'high'].includes(o.chroma)) die('--chroma must be low, medium or high'); }
    else if (a === '--colour' || a === '--color') { o.colour = next(); if (!['monochrome', 'one-accent', 'two-colour-pair', 'polychrome'].includes(o.colour)) die('--colour must be monochrome, one-accent, two-colour-pair or polychrome'); if (o.colour === 'polychrome') { o.polychrome = true; o.colour = 'one-accent'; } }
    else if (a === '--dual') o.dual = true;
    else if (a === '--radius') o.radius = num(a, String(next()).replace(/rem$/, ''), 0, 10);
    else if (a === '--format') { o.format = next(); if (!['css', 'tailwind', 'json'].includes(o.format)) die('--format must be css, tailwind or json'); }
    else if (a === '--out') o.out = next();
    else die(`unknown argument "${a}" (try --help)`);
  }
  if (!o.ground) die('--ground is required (try --help)');
  if (o.hue === null) die('--hue is required (try --help)');
  return o;
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) { process.stdout.write(HELP); return; }
  if (argv[0] === 'check') {
    if (argv.length !== 2) die('usage: palette.mjs check <css-file>');
    runCheck(argv[1]);
    return;
  }
  const o = parseArgs(argv);
  let res;
  try { res = generate(o); } catch (e) {
    if (e instanceof PaletteError) {
      process.stderr.write(`palette: cannot satisfy contrast: ${e.message}\n`);
      process.exit(1);
    }
    throw e;
  }
  const table = formatTable(res.rows);
  if (o.out) {
    try { writeFileSync(o.out, res.css); } catch (e) { die(`cannot write ${o.out}: ${e.message}`); }
    process.stdout.write(`wrote ${o.out}\n${table}\n`);
  } else {
    process.stdout.write(res.css);
    process.stderr.write(`\n${table}\n`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
