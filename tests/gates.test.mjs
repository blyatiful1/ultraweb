// End-to-end test for scripts/gates.mjs: serve a fixture over http, run the real CLI as a
// subprocess, and assert exit codes, the failing check ids and the output files.
// Run: node --test tests/gates.test.mjs   (needs Playwright with a Chromium browser; skipped
// locally when none resolves, a hard failure under CI)
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { spawn, spawnSync, execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gates = join(root, 'scripts', 'gates.mjs');
const fixtures = join(root, 'tests', 'fixtures', 'gates-site');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

function serve(dir, { bigJs = false } = {}) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(String(req.url || '/').split('?')[0]);
    if (bigJs && path === '/big.js') {
      // ~230 kB of script, uncompressed: well over the 140 kB cold-load budget
      res.writeHead(200, { 'content-type': TYPES['.js'], 'cache-control': 'no-store' });
      res.end('/*' + 'x'.repeat(230 * 1024) + '*/\nwindow.__big = 1;\n');
      return;
    }
    const file = join(dir, path === '/' ? 'index.html' : path);
    if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

function playwrightAvailable() {
  const req = createRequire(import.meta.url);
  const tryRoots = [root];
  try {
    tryRoots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
  } catch {
    /* no npm */
  }
  tryRoots.push('/usr/lib/node_modules', '/usr/local/lib/node_modules');
  return tryRoots.some((r) => {
    try {
      req.resolve('playwright', { paths: [r] });
      return true;
    } catch {
      return false;
    }
  });
}

// async on purpose: the fixture server lives in this process, and spawnSync would block its event loop
function runGatesAsync(args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [gates, ...args], { cwd });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    const timer = setTimeout(() => child.kill('SIGKILL'), 240000);
    child.on('close', (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr });
    });
  });
}
const runGates = (args, cwd) => spawnSync(process.execPath, [gates, ...args], { cwd, encoding: 'utf8', timeout: 60000 });

const have = playwrightAvailable();
const gate = (name, fn) =>
  test(name, { timeout: 280000 }, async (t) => {
    if (!have) {
      if (process.env.CI) throw new Error('playwright is not installed; CI must install it and a chromium build');
      t.skip('playwright is not installed here');
      return;
    }
    await fn(t);
  });

test('--help prints the usage and exits 0; a bad flag exits 3', () => {
  const h = runGates(['--help'], root);
  assert.equal(h.status, 0);
  assert.match(h.stdout, /--url <base-url>/);
  assert.match(h.stdout, /--done "<reason>"/);
  const bad = runGates(['--nope'], root);
  assert.equal(bad.status, 3);
});

test('--done writes qa/gates-done.json and runs nothing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gates-done-'));
  try {
    const r = runGates(['--done', 'accepted residual risk', '--project', dir], root);
    assert.equal(r.status, 0, r.stderr);
    const done = JSON.parse(readFileSync(join(dir, 'qa', 'gates-done.json'), 'utf8'));
    assert.equal(done.reason, 'accepted residual risk');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

gate('a site with planted defects exits 1 and names the failing checks', async () => {
  const { server, origin } = await serve(join(fixtures, 'defects'), { bigJs: true });
  const proj = mkdtempSync(join(tmpdir(), 'gates-bad-'));
  try {
    const r = await runGatesAsync(['--url', origin, '--routes', '/,/about.html', '--project', proj, '--only', 'content,a11y,responsive,perf,tells'], root);
    assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stdout}\n${r.stderr}`);
    assert.ok(r.stdout.split('\n').length <= 61, 'stdout exceeds 60 lines');
    const g = JSON.parse(readFileSync(join(proj, 'qa', 'gates.json'), 'utf8'));
    assert.equal(g.verdict, 'FAIL');
    assert.equal(g.round, 1);
    const failing = new Set(g.records.filter((x) => x.status === 'fail').map((x) => x.id));
    for (const id of [
      'a11y.contrast', 'a11y.alt-labels', 'a11y.targets-24', 'responsive.overflow', 'content.links',
      'content.headings', 'content.placeholder', 'content.metadata', 'content.title-unique',
      'perf.js-budget', 'perf.cls',
    ]) {
      assert.ok(failing.has(id), `expected ${id} to fail; failing: ${[...failing].join(', ')}`);
    }
    // tells is report-only: never a fail
    assert.ok(!g.records.some((x) => x.gate === 'tells' && x.status === 'fail'), 'a tells check failed');
    assert.ok(g.records.some((x) => x.id === 'tells.census'), 'the tells census did not run');
    assert.ok(existsSync(join(proj, 'qa', 'GATES.md')));
    assert.ok(existsSync(join(proj, 'qa', 'shots', 'home-375.png')), 'no 375 screenshot');
    // a second run increments the round
    const r2 = await runGatesAsync(['--url', origin, '--routes', '/', '--project', proj, '--only', 'responsive'], root);
    assert.equal(r2.status, 1);
    assert.equal(JSON.parse(readFileSync(join(proj, 'qa', 'gates.json'), 'utf8')).round, 2);
    // waivers turn a fail into waived
    mkdirSync(join(proj, 'qa'), { recursive: true });
    writeFileSync(join(proj, 'qa', 'waivers.json'), JSON.stringify([{ check: 'responsive.overflow', reason: 'intentional wide block' }]));
    const r3 = await runGatesAsync(['--url', origin, '--routes', '/', '--project', proj, '--only', 'responsive'], root);
    assert.equal(r3.status, 0, r3.stdout);
    const g3 = JSON.parse(readFileSync(join(proj, 'qa', 'gates.json'), 'utf8'));
    assert.ok(g3.records.some((x) => x.id === 'responsive.overflow' && x.status === 'waived'));
    // ESCALATE at round >= 4 while failing
    writeFileSync(join(proj, 'qa', 'waivers.json'), '[]');
    let last;
    for (let i = 0; i < 2; i++) last = await runGatesAsync(['--url', origin, '--routes', '/', '--project', proj, '--only', 'responsive', '--quick'], root);
    assert.equal(last.status, 1);
    assert.match(last.stdout, /^ESCALATE:/m);
  } finally {
    server.close();
    rmSync(proj, { recursive: true, force: true });
  }
});

gate('a clean site exits 0', async () => {
  const { server, origin } = await serve(join(fixtures, 'clean'));
  const proj = mkdtempSync(join(tmpdir(), 'gates-ok-'));
  try {
    const r = await runGatesAsync(['--url', origin, '--routes', '/,/about.html', '--project', proj, '--only', 'content,a11y,responsive,perf,tells'], root);
    const g = JSON.parse(readFileSync(join(proj, 'qa', 'gates.json'), 'utf8'));
    const bad = g.records.filter((x) => x.status === 'fail' || x.status === 'error');
    const axeOnly = bad.length > 0 && bad.every((x) => x.id === 'a11y.axe' && x.status === 'error');
    if (axeOnly) return; // axe-core neither installed nor reachable: UNVERIFIED by design
    assert.equal(r.status, 0, `expected exit 0, got ${r.status}\n${r.stdout}\n${JSON.stringify(bad, null, 1)}`);
    assert.equal(g.verdict, 'PASS');
  } finally {
    server.close();
    rmSync(proj, { recursive: true, force: true });
  }
});

gate('an unreachable server is UNVERIFIED (exit 3), never PASS', async () => {
  const proj = mkdtempSync(join(tmpdir(), 'gates-down-'));
  try {
    const r = await runGatesAsync(['--url', 'http://127.0.0.1:9', '--routes', '/', '--project', proj, '--only', 'content', '--quick'], root);
    assert.equal(r.status, 3, `${r.stdout}\n${r.stderr}`);
  } finally {
    rmSync(proj, { recursive: true, force: true });
  }
});
