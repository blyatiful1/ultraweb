#!/usr/bin/env node
// antislop.mjs — PostToolUse hook on Write|Edit|MultiEdit.
// Inside an ultraweb build (a design/BRIEF.md ancestor), scans only the text the edit
// added to a source file for hard, direction-independent defects: placeholder text and
// images, dead "#" links, fabricated-proof markers, and UNVERIFIED-PROOF outside a
// demo/staging build. Style is not judged here. Exit 2 shows the findings to Claude
// (the write has already happened); every other path, including any error, exits 0.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.css', '.mdx', '.html', '.htm']);
const SKIP_SEGMENTS = new Set(['node_modules', '.next', '.git', 'dist', 'out', 'coverage', 'tests', '__tests__', 'fixtures']);

function findBuildRoot(start) {
  let d = start;
  for (;;) {
    if (existsSync(join(d, 'design', 'BRIEF.md'))) return d;
    const up = dirname(d);
    if (up === d) return null;
    d = up;
  }
}

function newTexts(input) {
  if (!input || typeof input !== 'object') return [];
  const out = [];
  if (typeof input.content === 'string') out.push(input.content);
  if (typeof input.new_string === 'string') out.push(input.new_string);
  if (Array.isArray(input.edits)) for (const e of input.edits) if (e && typeof e.new_string === 'string') out.push(e.new_string);
  return out.filter((t) => t.length > 0);
}

async function main() {
  const raw = readFileSync(0, 'utf8');
  if (!raw.trim()) return 0;
  const payload = JSON.parse(raw);
  const input = payload.tool_input ?? {};
  if (typeof input.file_path !== 'string' || !input.file_path) return 0;

  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  const file = resolve(isAbsolute(input.file_path) ? input.file_path : join(cwd, input.file_path));
  const ext = extname(file).toLowerCase();
  if (!SOURCE_EXT.has(ext)) return 0;
  if (/\.(test|spec|stories)\.[a-z]+$/i.test(file)) return 0;

  const root = findBuildRoot(dirname(file));
  if (!root) return 0;
  const relPath = relative(root, file);
  const segments = relPath.split(sep);
  if (segments[0] === 'design' || segments[0] === 'qa') return 0;
  if (segments.some((s) => SKIP_SEGMENTS.has(s))) return 0;

  const texts = newTexts(input);
  if (!texts.length) return 0;

  const here = dirname(fileURLToPath(import.meta.url));
  const { HARD, UNVERIFIED_PROOF, deploymentMode, scan } = await import(join(here, '..', 'scripts', 'slop-patterns.mjs'));

  let fileText = '';
  try { fileText = readFileSync(file, 'utf8'); } catch { /* line numbers fall back to the edit text */ }
  const lineOf = (text, lineInText) => {
    const at = fileText ? fileText.indexOf(text) : -1;
    return at < 0 ? lineInText : fileText.slice(0, at).split('\n').length + lineInText - 1;
  };

  const findings = [];
  for (const text of texts) {
    for (const h of scan(text, HARD)) findings.push(`line ${lineOf(text, h.line)}: ${h.label} [${h.id}]`);
    const at = text.indexOf(UNVERIFIED_PROOF);
    if (at >= 0) {
      const briefPath = join(root, 'design', 'BRIEF.md');
      const { mode } = deploymentMode(readFileSync(briefPath, 'utf8'));
      if (mode === 'production') {
        findings.push(`line ${lineOf(text, text.slice(0, at).split('\n').length)}: ${UNVERIFIED_PROOF} sample in a production build — design/BRIEF.md needs exactly one "Deployment mode: demo" or "Deployment mode: staging" line [unverified-proof]`);
      }
    }
  }
  if (!findings.length) return 0;

  const unique = [...new Set(findings)];
  process.stderr.write(
    `ultraweb antislop: ${relPath} now contains placeholder or fabricated content:\n` +
    unique.map((f) => `  ${f}`).join('\n') +
    '\nReplace it with real content from design/BRIEF.md or design/SITEMAP.md, or remove it. A real link target, a real image, a real attributed quote.\n',
  );
  return 2;
}

main().then((code) => process.exit(code), () => process.exit(0));
