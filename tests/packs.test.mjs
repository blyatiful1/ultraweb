// Tests for the design packs under packs/ and for scripts/packs.mjs.
// The structural tests need nothing; the last test serves each pack's catalogue from a local
// server and runs the accessibility and responsive gates on it, which needs a browser.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, readdirSync, cpSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(root, 'scripts', 'packs.mjs');
const packsDir = join(root, 'packs');
const names = readdirSync(packsDir).filter((n) => existsSync(join(packsDir, n, 'pack.json'))).sort();
const run = (args, env = {}) => spawnSync('node', [script, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });

test('there are packs, and every one passes the structural check', () => {
  assert.ok(names.length >= 1, 'no packs found');
  const r = run(['check']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const n of names) assert.match(r.stdout, new RegExp(`\\b${n}\\b`));
});

test('no two packs share a type family or a title', () => {
  const seenFamily = new Map();
  const titles = new Set();
  for (const n of names) {
    const m = JSON.parse(readFileSync(join(packsDir, n, 'pack.json'), 'utf8'));
    assert.ok(!titles.has(m.title), `two packs are titled ${m.title}`);
    titles.add(m.title);
    for (const f of m.fonts) {
      assert.ok(!seenFamily.has(f), `${f} is used by both ${seenFamily.get(f)} and ${n}`);
      seenFamily.set(f, n);
    }
  }
});

test('list gives a small model what it needs to choose', () => {
  const r = run(['list']);
  assert.equal(r.status, 0, r.stderr);
  for (const n of names) assert.match(r.stdout, new RegExp(`^${n}  \\(`, 'm'));
  assert.match(r.stdout, /suits:/);
  assert.match(r.stdout, /not for:/);
  assert.match(r.stdout, /If none fits/);
  const j = JSON.parse(run(['list', '--json']).stdout);
  assert.equal(j.length, names.length);
});

test('install copies a pack into the project and refuses to overwrite it', () => {
  const proj = mkdtempSync(join(tmpdir(), 'uw-pack-'));
  const first = run(['install', names[0], '--into', proj]);
  assert.equal(first.status, 0, first.stderr);
  for (const f of ['PACK.md', 'pack.css', 'catalogue.html', 'pack.json']) assert.ok(existsSync(join(proj, 'pack', f)), `${f} was not installed`);
  assert.equal(run(['install', names[0], '--into', proj]).status, 2, 'a second install must refuse');
  assert.equal(run(['install', names[0], '--into', proj, '--force']).status, 0);
  assert.equal(run(['install', 'no-such-pack', '--into', proj]).status, 2);
});

test('check names what is wrong with a broken pack', () => {
  const dir = mkdtempSync(join(tmpdir(), 'uw-packs-'));
  cpSync(join(packsDir, names[0]), join(dir, 'broken'), { recursive: true });
  const manifest = JSON.parse(readFileSync(join(dir, 'broken', 'pack.json'), 'utf8'));
  manifest.name = 'broken';
  manifest.colourways = ['one', 'two'];
  writeFileSync(join(dir, 'broken', 'pack.json'), JSON.stringify(manifest));
  const cssFile = join(dir, 'broken', 'pack.css');
  writeFileSync(cssFile, readFileSync(cssFile, 'utf8') + '\nh1 { hyphens: auto; font-family: "Inter", sans-serif; background: url("fonts/missing.woff2"); }\n@import url("https://example.com/x.css");\n');
  rmSync(join(dir, 'broken', 'PACK.md'));
  let r = run(['check'], { ULTRAWEB_PACKS_DIR: dir });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /PACK\.md is missing/);
  writeFileSync(join(dir, 'broken', 'PACK.md'), '# Broken\n');
  r = run(['check'], { ULTRAWEB_PACKS_DIR: dir });
  assert.equal(r.status, 1);
  for (const expected of [/exactly three/, /hyphens: auto/, /overused family Inter/, /missing file/, /another server/]) assert.match(r.stdout, expected);
});

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json', '.svg': 'image/svg+xml' };
function serve(dir) {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(req.url.split('?')[0]));
    const file = join(dir, path);
    if (!file.startsWith(dir) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404);
      return void res.end('not found');
    }
    res.setHeader('content-type', TYPES[extname(file)] || 'application/octet-stream');
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}
const gates = (args) =>
  new Promise((ok) => {
    const child = spawn('node', [join(root, 'scripts', 'gates.mjs'), ...args], { cwd: root });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', (status) => ok({ status, out }));
  });

test('every catalogue passes the accessibility and responsive gates', { timeout: 600000 }, async (t) => {
  for (const n of names) {
    const { server, origin } = await serve(join(packsDir, n));
    const proj = mkdtempSync(join(tmpdir(), `uw-pack-gates-${n}-`));
    try {
      const r = await gates(['--url', origin, '--routes', '/catalogue.html', '--project', proj, '--only', 'a11y,responsive']);
      if (r.status === 3 && /playwright|chromium|browser/i.test(r.out) && !process.env.CI) {
        t.skip('no browser here: the gates could not run');
        return;
      }
      const failing = existsSync(join(proj, 'qa', 'gates.json'))
        ? JSON.parse(readFileSync(join(proj, 'qa', 'gates.json'), 'utf8')).records.filter((x) => x.status === 'fail' || x.status === 'error').map((x) => `${x.id} @${x.viewport}: ${x.summary}`)
        : [];
      assert.equal(r.status, 0, `the ${n} catalogue does not pass:\n${failing.slice(0, 12).join('\n') || r.out.slice(0, 1200)}`);
    } finally {
      server.close();
    }
  }
});
