#!/usr/bin/env node
// gate-stop.mjs — Stop hook. Inside an ultraweb build (a design/BRIEF.md ancestor of the
// session cwd), keeps Claude from ending its turn while qa/gates.json says FAIL.
// Stands down when: the stop is already a hook continuation (stop_hook_active), a
// qa/gates-done.json at least as new as gates.json exists, gates.json is at round >= 4
// (gates.mjs prints ESCALATE and the lead reports to the user), or this hook has already
// blocked twice for the current gates.json (counted in qa/.gate-stop.json, keyed by its
// mtime). Exit 2 puts the failing check ids on stderr. Any error exits 0.

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BLOCKS = 2;
const ESCALATE_ROUND = 4;

function findBuildRoot(start) {
  let d = resolve(start);
  for (;;) {
    if (existsSync(join(d, 'design', 'BRIEF.md'))) return d;
    const up = dirname(d);
    if (up === d) return null;
    d = up;
  }
}

// Collect failing check ids from whatever shape gates.json uses: any object whose
// status is "fail" and that carries an id/check/name, at any depth.
function failingIds(node, out = new Set(), parentKey = '') {
  if (Array.isArray(node)) { for (const n of node) failingIds(n, out, parentKey); return out; }
  if (!node || typeof node !== 'object') return out;
  if (node.status === 'fail') {
    const id = node.id ?? node.check ?? node.name ?? parentKey;
    if (id) out.add(node.route ? `${id} (${node.route})` : String(id));
  }
  for (const [k, v] of Object.entries(node)) if (v && typeof v === 'object') failingIds(v, out, k);
  return out;
}

function main() {
  const raw = readFileSync(0, 'utf8');
  const payload = raw.trim() ? JSON.parse(raw) : {};
  if (payload.stop_hook_active === true) return 0;

  const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
  const root = findBuildRoot(cwd);
  if (!root) return 0;

  const gatesPath = join(root, 'qa', 'gates.json');
  if (!existsSync(gatesPath)) return 0;
  const gates = JSON.parse(readFileSync(gatesPath, 'utf8'));
  if (String(gates.verdict ?? '').toUpperCase() !== 'FAIL') return 0;
  if (Number(gates.round) >= ESCALATE_ROUND) return 0;

  const gatesMtime = statSync(gatesPath).mtimeMs;
  const donePath = join(root, 'qa', 'gates-done.json');
  if (existsSync(donePath) && statSync(donePath).mtimeMs >= gatesMtime) return 0;

  const statePath = join(root, 'qa', '.gate-stop.json');
  let state = { gatesMtime, blocks: 0 };
  try {
    const prev = JSON.parse(readFileSync(statePath, 'utf8'));
    if (prev && prev.gatesMtime === gatesMtime && Number.isInteger(prev.blocks)) state = prev;
  } catch { /* no state yet */ }
  if (state.blocks >= MAX_BLOCKS) return 0;
  state.blocks += 1;
  writeFileSync(statePath, JSON.stringify(state) + '\n');

  const ids = [...failingIds(gates.checks ?? gates)];
  const shown = ids.slice(0, 20).join(', ') + (ids.length > 20 ? `, and ${ids.length - 20} more` : '');
  const plugin = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  process.stderr.write(
    `ultraweb gate-stop: qa/gates.json verdict is FAIL${gates.round ? ` (round ${gates.round})` : ''}.\n` +
    `Failing: ${shown || 'see qa/GATES.md'}\n` +
    `Fix these, then re-run: node "${plugin}/scripts/gates.mjs" --url <base-url>\n` +
    `If you are stopping on purpose (blocked, or handing back to the user), record why: node "${plugin}/scripts/gates.mjs" --done "<reason>"\n` +
    `(block ${state.blocks} of ${MAX_BLOCKS} for this gates.json)\n`,
  );
  return 2;
}

let code = 0;
try { code = main(); } catch { code = 0; }
process.exit(code);
