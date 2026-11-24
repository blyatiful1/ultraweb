// Shared helpers for the eval harness. Zero dependencies.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

export function resolvePlaywright() {
  const tries = [process.cwd()];
  try { tries.push(join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(), '..')); } catch {}
  if (process.env.NODE_PATH) tries.push(...process.env.NODE_PATH.split(':'));
  for (const base of tries) {
    try { return createRequire(join(base, 'noop.js'))('playwright'); } catch {}
    try { return createRequire(join(base, 'noop.js'))('playwright-core'); } catch {}
  }
  try { return createRequire(import.meta.url)('playwright'); } catch {}
  return null;
}

export function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      o[k] = v;
    }
  }
  return o;
}

export const slug = (r) => (r === '/' ? 'home' : r.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home');
