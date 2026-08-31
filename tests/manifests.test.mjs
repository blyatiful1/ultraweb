// Manifest and hook-wiring consistency tests — the corpus's machine-readable
// surfaces must parse, agree with each other, and point at files that exist.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

test('plugin.json and marketplace.json parse and agree', () => {
  const plugin = json('.claude-plugin/plugin.json');
  const market = json('.claude-plugin/marketplace.json');
  assert.equal(plugin.name, 'ultraweb');
  const entry = market.plugins.find((p) => p.name === 'ultraweb');
  assert.ok(entry, 'marketplace.json lists no ultraweb plugin');
  assert.equal(entry.version, plugin.version, 'plugin.json and marketplace.json disagree on the version');
  assert.equal(entry.repository, plugin.repository);
});

test('hooks.json commands point at scripts that exist', () => {
  const hooks = json('hooks/hooks.json');
  const commands = [];
  for (const eventHooks of Object.values(hooks.hooks)) {
    for (const matcherBlock of eventHooks) {
      for (const h of matcherBlock.hooks) commands.push(h.command);
    }
  }
  assert.ok(commands.length >= 2, 'expected at least the antislop and studio-log hooks');
  for (const cmd of commands) {
    const m = cmd.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/(\S+?)"/);
    assert.ok(m, `command has no \${CLAUDE_PLUGIN_ROOT} path: ${cmd}`);
    assert.ok(existsSync(join(root, m[1])), `hooks.json points at missing file: ${m[1]}`);
  }
});

test('hook and recipe scripts are syntactically valid bash', () => {
  for (const script of ['hooks/antislop.sh', 'hooks/studio-log.sh', 'scripts/scaffold-fixture.sh']) {
    execFileSync('bash', ['-n', join(root, script)]); // throws on a syntax error
  }
});

test('locked-to pins actually match their anchor', () => {
  const stack = json('stack/versions.json');
  for (const [pkg, rule] of Object.entries(stack.pins)) {
    if (typeof rule === 'string' && rule.startsWith('locked-to:')) {
      const anchor = rule.slice('locked-to:'.length);
      assert.equal(stack.packages[pkg], stack.packages[anchor],
        `${pkg} declares ${rule} but pins ${stack.packages[pkg]} vs ${anchor}'s ${stack.packages[anchor]}`);
    }
  }
});

test('stack/versions.json is well-formed and internally consistent', () => {
  const stack = json('stack/versions.json');
  assert.ok(!Number.isNaN(new Date(stack.verified).getTime()), `unparseable verified date: ${stack.verified}`);
  const pkgs = Object.keys(stack.packages);
  assert.ok(pkgs.length > 0, 'packages is empty');
  for (const [pkg, v] of Object.entries(stack.packages)) {
    assert.match(v, /^\d+\.\d+\.\d+(-[\w.]+)?$/, `${pkg} version "${v}" is not semver`);
  }
  for (const g of stack.gated) assert.ok(pkgs.includes(g), `gated package "${g}" is not in packages`);
  for (const p of Object.keys(stack.pins)) assert.ok(pkgs.includes(p), `pinned package "${p}" is not in packages`);
});
