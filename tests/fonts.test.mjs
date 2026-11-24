// Tests for scripts/fonts.mjs against a local stand-in for the font service, so nothing here
// touches the network. Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'fonts.mjs');

function fakeService() {
  const seen = [];
  const server = createServer((req, res) => {
    seen.push(req.url);
    const origin = `http://127.0.0.1:${server.address().port}`;
    const face = (subset, weight, file) => `/* ${subset} */\n@font-face {\n  font-family: 'X';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url(${origin}/${file}.woff2) format('woff2');\n  unicode-range: U+0000-00FF;\n}\n`;
    const url = decodeURIComponent(req.url);
    if (url.endsWith('.woff2')) { res.setHeader('content-type', 'font/woff2'); return void res.end(Buffer.from('wOF2-stand-in')); }
    if (url.startsWith('/css2?family=Test+Sans:wght@400;700')) return void res.end(face('cyrillic', 400, 'c4') + face('latin', 400, 'l4') + face('cyrillic', 700, 'c7') + face('latin', 700, 'l7'));
    if (url.startsWith('/css2?family=Vario:wght@400;700')) return void res.end(face('latin', 400, 'var') + face('latin', 700, 'var'));
    if (url.startsWith('/css2?family=Solo&')) return void res.end(face('latin', 400, 'solo'));
    res.writeHead(400); res.end('');
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, seen, base: `http://127.0.0.1:${server.address().port}` })));
}

// async spawn: the stand-in service lives in this process, so a sync spawn would deadlock it
const run = (args, base) => new Promise((ok) => {
  const child = spawn('node', [script, ...args], { env: { ...process.env, ULTRAWEB_FONTS_API: base, HTTPS_PROXY: '', https_proxy: '', HTTP_PROXY: '', http_proxy: '', NODE_USE_ENV_PROXY: '' } });
  let stdout = '', stderr = '';
  child.stdout.on('data', (d) => (stdout += d));
  child.stderr.on('data', (d) => (stderr += d));
  child.on('close', (status) => ok({ status, stdout, stderr }));
});

test('get saves the latin files only and prints rules relative to the site root', async () => {
  const svc = await fakeService();
  try {
    const out = join(mkdtempSync(join(tmpdir(), 'uw-fonts-')), 'site', 'fonts');
    const r = await run(['get', 'Test Sans', '--out', out], svc.base);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(readdirSync(out).sort(), ['fonts.css', 'test-sans-latin-400.woff2', 'test-sans-latin-700.woff2']);
    assert.match(r.stdout, /font-family: "Test Sans"; font-style: normal; font-weight: 700;.*url\("fonts\/test-sans-latin-700\.woff2"\)/);
    assert.match(readFileSync(join(out, 'fonts.css'), 'utf8'), /url\("test-sans-latin-400\.woff2"\)/);
    assert.ok(!svc.seen.some((u) => /c4|c7/.test(u)), 'subsets that were not asked for are not downloaded');
  } finally { svc.server.close(); }
});

test('a variable family served as one file becomes one rule with a weight range', async () => {
  const svc = await fakeService();
  try {
    const out = join(mkdtempSync(join(tmpdir(), 'uw-fonts-')), 'fonts');
    const r = await run(['get', 'Vario', '--weights', '400,700', '--out', out], svc.base);
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(join(out, 'vario-latin-400-700.woff2')));
    assert.match(r.stdout, /font-weight: 400 700;/);
    assert.equal((r.stdout.match(/@font-face/g) || []).length, 1);
  } finally { svc.server.close(); }
});

test('falls back to the weights that exist, and refuses an unknown family or bad input', async () => {
  const svc = await fakeService();
  try {
    const out = join(mkdtempSync(join(tmpdir(), 'uw-fonts-')), 'fonts');
    const solo = await run(['get', 'Solo', '--out', out], svc.base);
    assert.equal(solo.status, 0, solo.stderr);
    assert.match(solo.stdout, /does not come in every weight asked for/);
    const none = await run(['get', 'Nope Sans', '--out', out], svc.base);
    assert.equal(none.status, 2);
    assert.match(none.stderr, /not on Google Fonts/);
    assert.equal((await run(['get', '--out', out], svc.base)).status, 2);
    assert.equal((await run(['get', 'Test Sans', '--weights', '950', '--out', out], svc.base)).status, 2);
  } finally { svc.server.close(); }
});

test('reports an unreachable service with exit 3', async () => {
  const r = await run(['get', 'Test Sans', '--out', join(mkdtempSync(join(tmpdir(), 'uw-fonts-')), 'fonts')], 'http://127.0.0.1:9');
  assert.equal(r.status, 3);
  assert.match(r.stderr, /system font stack/);
});
