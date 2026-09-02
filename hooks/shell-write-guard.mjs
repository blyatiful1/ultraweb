#!/usr/bin/env node
// shell-write-guard.mjs — the analysis behind hooks/shell-write-guard.sh (see that file
// for the contract). Reads the PreToolUse payload on stdin, tokenizes the Bash command,
// and exits 2 with a message when it would write a file the Lead should Edit instead.
// Dependency-free. Anything it cannot parse passes through (exit 0): the guard is a
// floor under a rule, not a gate in front of every command.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve, basename, extname } from 'node:path';

const SOURCE_EXT = new Set(['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.css', '.mdx']);
const ESCAPE_PREFIX = 'ULTRAWEB_SHELL_WRITE_OK=1 ';

function main() {
  let payload;
  try { payload = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { return 0; }
  if (payload.tool_name && payload.tool_name !== 'Bash') return 0;
  const command = payload.tool_input?.command;
  if (typeof command !== 'string' || !command.trim()) return 0;
  if (command.trimStart().startsWith(ESCAPE_PREFIX)) return 0;
  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();

  const writes = findWrites(command);
  const blocked = [];
  for (const w of writes) {
    const verdict = judge(w, cwd);
    if (verdict) blocked.push(verdict);
  }
  if (!blocked.length) return 0;
  process.stderr.write(
    'ultraweb shell-write-guard — this command writes a build file through the shell:\n' +
    blocked.map(b => `  ${b}`).join('\n') + '\n' +
    'Inside an ultraweb build a file is changed with Edit (smallest hunk) or Write, never sed -i / > / a heredoc: ' +
    'the harness\'s bypass-mode preference for shell edits collides with §Context discipline rule 4 — every shell write echoes the changed region back into the Lead\'s context. ' +
    'Ledgers (design/*.md) are appended with `>>`; a bulk mechanical rewrite goes to a Mechanical agent whose context pays for it. ' +
    'A deliberate exception: put `ULTRAWEB_SHELL_WRITE_OK=1 ` at the very start of the command string (for a compound command: `ULTRAWEB_SHELL_WRITE_OK=1 bash -c \'…\'`).\n');
  return 2;
}

// ---- judging one write --------------------------------------------------------------

function judge(w, cwd) {
  const raw = w.target;
  if (!raw || raw.startsWith('&') || raw === '-') return null; // dup (2>&1) or stdout marker
  if (/[$`*?]/.test(raw)) return null; // variable / glob / substitution — cannot resolve, pass through
  const expanded = raw === '~' || raw.startsWith('~/') ? join(homedir(), raw.slice(1)) : raw; // the shell expands ~; so must we
  const target = isAbsolute(expanded) ? resolve(expanded) : resolve(cwd, expanded);
  const ext = extname(target).toLowerCase();
  const base = basename(target);
  const parts = target.split('/');

  // Always-allowed targets. (No blanket /tmp rule: a scratch file outside a build has no
  // design/BRIEF.md ancestor and passes below; a build that lives under /tmp — CI fixtures do —
  // must still be guarded.)
  if (target === '/dev/null' || target.startsWith('/dev/')) return null;
  if (ext === '.log' || base.startsWith('.env') || base === '.gitignore') return null;
  if (parts.includes('node_modules') || parts.includes('.next')) return null;

  // Only inside an ultraweb build.
  const marker = findBuildRoot(dirname(target));
  if (!marker) return null;

  const isSource = SOURCE_EXT.has(ext);
  const isDesignMd = ext === '.md' && dirname(target) === join(marker, 'design');
  const underQa = target.startsWith(join(marker, 'qa') + '/');
  if (underQa && !isSource) return null;

  if (w.kind === 'inplace' && isSource) return `${w.tool} -i on ${rel(target, cwd)} — in-place edit of a source file`;
  if (w.kind === 'inplace' && isDesignMd) return `${w.tool} -i on ${rel(target, cwd)} — in-place edit of a design artifact`;
  if (w.kind === 'truncate' && isSource) return `${w.op} ${rel(target, cwd)} — truncating write to a source file`;
  if (w.kind === 'truncate' && isDesignMd) return `${w.op} ${rel(target, cwd)} — truncating write to a design artifact (append with >> instead)`;
  if (w.kind === 'append' && isSource) return `${w.op} ${rel(target, cwd)} — appending to a source file through the shell`;
  return null;
}

function rel(p, cwd) { return p.startsWith(cwd + '/') ? p.slice(cwd.length + 1) : p; }

function findBuildRoot(dir) {
  let d = dir;
  for (let i = 0; i < 64 && d && d !== '/'; i++) {
    if (existsSync(join(d, 'design', 'BRIEF.md'))) return d;
    const up = dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

// ---- tokenizing ---------------------------------------------------------------------
// Produces a list of simple commands, each { words: [...], redirects: [{op, target}] }.
// Handles single/double quotes, backslash escapes, heredoc bodies (skipped), dup targets
// (2>&1), attached targets (>file), and the separators ; & && | || and newline.

const REDIRECT_RE = /^(&>>|&>|\d*>>|\d*>\||\d*>|<<<|<<-|<<|\d*<)/;

export function findWrites(command) {
  const cmds = tokenize(command);
  const out = [];
  for (const c of cmds) {
    if (!c.words.length && !c.redirects.length) continue;
    // Strip leading VAR=value assignments to find the program name.
    let i = 0;
    while (i < c.words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(c.words[i])) i++;
    const prog = basename(c.words[i] ?? '');
    const args = c.words.slice(i + 1);
    // sed: any single-dash cluster with an i is in-place (-i, -i.bak, -ni). perl: only the real forms (-i, -i.bak, -pi, -ni, -pi.bak) —
    // a loose test would read perl's -I<dir> and -M<Module> as in-place.
    const inPlace = prog === 'sed' ? (a => /^-[a-zA-Z]*i/.test(a) && !a.startsWith('--')) : (a => /^-[pnlw]*i(\.\S*)?$/.test(a));
    if ((prog === 'sed' || prog === 'perl') && args.some(a => inPlace(a) || a === '--in-place' || a.startsWith('--in-place='))) {
      for (const a of args) {
        if (a.startsWith('-')) continue;
        if (prog === 'sed' && (a.includes('/') && /^[sy]\//.test(a) || /^\d/.test(a))) continue; // the script, not a file
        if (prog === 'perl' && !/\.[a-z]+$/i.test(a)) continue; // -e code
        if (/\.[A-Za-z0-9]+$/.test(a) || a.includes('/')) out.push({ kind: 'inplace', tool: prog, op: '-i', target: a });
      }
    }
    if (prog === 'tee') {
      const append = args.some(a => a === '-a' || a === '--append' || /^-[a-zA-Z]*a/.test(a) && !a.startsWith('--'));
      for (const a of args) if (!a.startsWith('-')) out.push({ kind: append ? 'append' : 'truncate', tool: 'tee', op: append ? 'tee -a' : 'tee', target: a });
    }
    for (const r of c.redirects) {
      if (/^(&>>|\d*>>)$/.test(r.op)) out.push({ kind: 'append', op: r.op, target: r.target });
      else if (/^(&>|\d*>\||\d*>)$/.test(r.op)) out.push({ kind: 'truncate', op: r.op, target: r.target });
    }
  }
  return out;
}

export function tokenize(src) {
  const cmds = [];
  let cur = { words: [], redirects: [] };
  let i = 0;
  const n = src.length;
  const pendingHeredocs = [];

  const flushCmd = () => { cmds.push(cur); cur = { words: [], redirects: [] }; };

  const readWord = () => {
    // Reads one shell word starting at i (i must be at a non-space char). Returns the unquoted word.
    let w = '';
    while (i < n) {
      const ch = src[i];
      if (ch === "'") { const j = src.indexOf("'", i + 1); if (j < 0) { w += src.slice(i + 1); i = n; break; } w += src.slice(i + 1, j); i = j + 1; continue; }
      if (ch === '"') {
        i++;
        while (i < n && src[i] !== '"') { if (src[i] === '\\' && i + 1 < n) { w += src[i + 1]; i += 2; } else { w += src[i++]; } }
        i++; continue;
      }
      if (ch === '\\' && i + 1 < n) { if (src[i + 1] === '\n') { i += 2; continue; } w += src[i + 1]; i += 2; continue; }
      if (/\s/.test(ch) || ch === ';' || ch === '|' || ch === '&' || ch === '>' || ch === '<' || ch === '(' || ch === ')') break;
      w += ch; i++;
    }
    return w;
  };

  while (i < n) {
    const ch = src[i];
    if (ch === '\n') {
      i++;
      // Consume heredoc bodies that begin after this line.
      while (pendingHeredocs.length) {
        const delim = pendingHeredocs.shift();
        const strip = delim.strip;
        for (;;) {
          if (i >= n) break;
          let eol = src.indexOf('\n', i);
          if (eol < 0) eol = n;
          const line = src.slice(i, eol);
          i = Math.min(eol + 1, n);
          if ((strip ? line.replace(/^\t+/, '') : line) === delim.word) break;
        }
      }
      flushCmd();
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') { i++; continue; }
    if (ch === '#' && (cur.words.length === 0 || /\s/.test(src[i - 1] ?? ' '))) { // comment to end of line
      const eol = src.indexOf('\n', i); i = eol < 0 ? n : eol; continue;
    }
    if (src.startsWith('&&', i) || src.startsWith('||', i)) { i += 2; flushCmd(); continue; }
    const rm = REDIRECT_RE.exec(src.slice(i));
    if (rm) {
      const op = rm[1];
      i += op.length;
      while (i < n && (src[i] === ' ' || src[i] === '\t')) i++;
      if (op === '<<' || op === '<<-') {
        const word = readWord();
        pendingHeredocs.push({ word: word.replace(/^['"]|['"]$/g, ''), strip: op === '<<-' });
        continue;
      }
      if (op === '<<<') { readWord(); continue; }
      if (src[i] === '&') { // dup: 2>&1, >&2, >&-
        let j = i + 1; while (j < n && /[0-9-]/.test(src[j])) j++;
        cur.redirects.push({ op, target: src.slice(i, j) }); i = j; continue;
      }
      const target = i < n ? readWord() : '';
      cur.redirects.push({ op, target });
      continue;
    }
    if (ch === ';' || ch === '|' || ch === '&') { i++; flushCmd(); continue; }
    if (ch === '(' || ch === ')') { i++; continue; }
    const w = readWord();
    if (w !== '' || src[i - 1] === "'" || src[i - 1] === '"') cur.words.push(w);
    if (w === '' && !(src[i - 1] === "'" || src[i - 1] === '"')) i++; // safety: never stall
  }
  flushCmd();
  return cmds;
}

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) process.exit(main());
