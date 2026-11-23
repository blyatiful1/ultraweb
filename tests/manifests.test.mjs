// Manifest and hook-wiring consistency tests — the corpus's machine-readable
// surfaces must parse, agree with each other, and point at files that exist.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

test('plugin.json and marketplace.json parse and agree', () => {
  const plugin = json('.claude-plugin/plugin.json');
  const market = json('.claude-plugin/marketplace.json');
  assert.equal(plugin.name, 'ultraweb');
  assert.match(plugin.version, /^2\.\d+\.\d+$/);
  const entry = market.plugins.find((p) => p.name === 'ultraweb');
  assert.ok(entry, 'marketplace.json lists no ultraweb plugin');
  assert.equal(entry.version, plugin.version, 'plugin.json and marketplace.json disagree on the version');
  assert.equal(entry.repository, plugin.repository);
  assert.equal(entry.description, plugin.description, 'the two descriptions should be the same sentence');
});

test('manifests carry no dead $schema, short one-sentence descriptions and no counts', () => {
  const plugin = json('.claude-plugin/plugin.json');
  const market = json('.claude-plugin/marketplace.json');
  for (const [where, obj] of [['plugin.json', plugin], ['marketplace.json', market], ['marketplace entry', market.plugins[0]]]) {
    assert.equal(obj.$schema, undefined, `${where} has a $schema (the anthropic.com URL is a 404)`);
    assert.ok(obj.description && obj.description.length <= 200, `${where} description is ${obj.description?.length} chars (max 200)`);
    assert.equal(obj.description.split(/(?<=[.!?])\s+/).length, 1, `${where} description must be one sentence`);
  }
  const text = readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8') + readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8');
  assert.doesNotMatch(text, /\b\d+\s+(?:\w+\s+)?(?:skills|subagents|agents)\b/i, 'manifests must not state skill or subagent counts');
});

test('skills key keeps the root SKILL.md; hooks load once, from the default hooks/hooks.json', () => {
  const plugin = json('.claude-plugin/plugin.json');
  assert.deepEqual(plugin.skills, ['./']);
  assert.equal(plugin.hooks, undefined, 'hooks/hooks.json loads by default; a hooks key pointing at it again is redundant');
  assert.ok(existsSync(join(root, 'hooks', 'hooks.json')));
});

function hookCommands() {
  const hooks = json('hooks/hooks.json');
  const out = [];
  for (const [event, blocks] of Object.entries(hooks.hooks)) {
    for (const block of blocks) for (const h of block.hooks) out.push({ event, matcher: block.matcher, ...h });
  }
  return out;
}

test('hooks.json wires antislop on PostToolUse and gate-stop on Stop, node-guarded', () => {
  const cmds = hookCommands();
  const anti = cmds.find((c) => c.command.includes('/hooks/antislop.mjs'));
  const stop = cmds.find((c) => c.command.includes('/hooks/gate-stop.mjs'));
  assert.ok(anti && anti.event === 'PostToolUse', 'antislop.mjs must be a PostToolUse hook');
  assert.deepEqual(anti.matcher.split('|').sort(), ['Edit', 'MultiEdit', 'Write']);
  assert.ok(stop && stop.event === 'Stop', 'gate-stop.mjs must be a Stop hook');
  for (const c of cmds) {
    assert.equal(c.type, 'command');
    assert.match(c.command, /^command -v node >\/dev\/null 2>&1 \|\| exit 0; node "\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/[\w-]+\.mjs"$/, c.command);
    const m = c.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/(\S+?)"/);
    assert.ok(existsSync(join(root, m[1])), `hooks.json points at missing file: ${m[1]}`);
  }
});

test('every hook script is wired, parses, and no shell hooks remain', () => {
  const wired = hookCommands().map((c) => c.command).join('\n');
  const files = readdirSync(join(root, 'hooks')).filter((f) => f !== 'hooks.json');
  assert.deepEqual(files.filter((f) => !f.endsWith('.mjs')), [], 'hooks/ holds only node hooks and hooks.json');
  for (const f of files) {
    assert.ok(wired.includes(`/hooks/${f}`), `hooks/${f} exists but hooks.json never runs it`);
    execFileSync(process.execPath, ['--check', join(root, 'hooks', f)]);
  }
});

test('remaining shell scripts are syntactically valid bash', () => {
  for (const dir of ['scripts', 'tests']) {
    for (const f of readdirSync(join(root, dir)).filter((n) => n.endsWith('.sh'))) execFileSync('bash', ['-n', join(root, dir, f)]);
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
