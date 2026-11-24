// Tests for scripts/photos.mjs against a local stand-in for the Openverse API, so nothing
// here touches the network. Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'photos.mjs');
const JPEG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
const ID = '11111111-2222-3333-4444-555555555555';

function fakeApi() {
  const seen = [];
  const server = createServer((req, res) => {
    seen.push(req.url);
    const origin = `http://127.0.0.1:${server.address().port}`;
    const item = { id: ID, title: 'Rye loaf <on> a board', creator: 'A. Baker', creator_url: 'https://example.org/a', license: 'by', license_version: '2.0', license_url: 'https://creativecommons.org/licenses/by/2.0/', foreign_landing_url: 'https://example.org/photo/1', url: `${origin}/file.jpg`, thumbnail: `${origin}/thumb.jpg`, width: 1600, height: 900 };
    if (req.url.startsWith('/v1/images/?')) {
      if (/q=nothing/.test(req.url)) return void res.end(JSON.stringify({ results: [] }));
      if (/q=limited/.test(req.url)) { res.writeHead(429); return void res.end('{}'); }
      res.setHeader('content-type', 'application/json');
      return void res.end(JSON.stringify({ results: [item, { ...item, id: ID.replace(/^1/, '2'), width: 400 }] }));
    }
    if (req.url === `/v1/images/${ID}/`) { res.setHeader('content-type', 'application/json'); return void res.end(JSON.stringify(item)); }
    if (req.url === '/file.jpg' || req.url === '/thumb.jpg') { res.setHeader('content-type', 'image/jpeg'); return void res.end(JPEG); }
    res.writeHead(404); res.end('{}');
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, seen, base: `http://127.0.0.1:${server.address().port}/v1` })));
}

// async spawn: the fake API lives in this process, so a sync spawn would deadlock it
const run = (args, base) => new Promise((ok) => {
  const child = spawn('node', [script, ...args], { env: { ...process.env, ULTRAWEB_PHOTOS_API: base, HTTPS_PROXY: '', https_proxy: '', HTTP_PROXY: '', http_proxy: '', NODE_USE_ENV_PROXY: '' } });
  let stdout = '', stderr = '';
  child.stdout.on('data', (d) => (stdout += d));
  child.stderr.on('data', (d) => (stderr += d));
  child.on('close', (status) => ok({ status, stdout, stderr }));
});

test('search lists photographs with licence and creator, filters by width, saves previews', async () => {
  const api = await fakeApi();
  try {
    const dir = mkdtempSync(join(tmpdir(), 'uw-photos-'));
    const r = await run(['search', 'rye sourdough loaf', '--thumbs', join(dir, 'previews')], api.base);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, new RegExp(ID));
    assert.match(r.stdout, /CC BY 2\.0 {2}by A\. Baker/);
    assert.doesNotMatch(r.stdout, /^ 2\./m, 'the 400px-wide result should be filtered out by --min-width');
    assert.ok(existsSync(join(dir, 'previews', `01-${ID.slice(0, 8)}.jpg`)));
    assert.match(api.seen[0], /license_type=commercial%2Cmodification/);
  } finally { api.server.close(); }
});

test('get saves the file, records the credit, and credits prints an escaped footer line', async () => {
  const api = await fakeApi();
  try {
    const dir = mkdtempSync(join(tmpdir(), 'uw-photos-'));
    const out = join(dir, 'img', 'loaf.jpg');
    const r = await run(['get', ID, '--out', out, '--role', 'proof'], api.base);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(readFileSync(out), JPEG);
    assert.match(r.stdout, /data-standin and show a visible "Stand-in photo" label/);
    const rec = JSON.parse(readFileSync(join(dir, 'img', 'credits.json'), 'utf8')).photos;
    assert.equal(rec.length, 1);
    assert.equal(rec[0].role, 'proof');
    assert.equal(rec[0].standin, true);
    assert.equal(rec[0].licence, 'CC BY 2.0');
    await run(['get', ID, '--out', out], api.base); // same file again replaces the record
    assert.equal(JSON.parse(readFileSync(join(dir, 'img', 'credits.json'), 'utf8')).photos.length, 1);
    const c = await run(['credits', '--dir', join(dir, 'img')], api.base);
    assert.match(c.stdout, /Stand-in photographs: <a href="https:\/\/example\.org\/photo\/1">Rye loaf &lt;on&gt; a board<\/a> by A\. Baker \(<a href="https:\/\/creativecommons\.org\/licenses\/by\/2\.0\/">CC BY 2\.0<\/a>\)\./);
  } finally { api.server.close(); }
});

test('no results is not an error; rate limiting and an unreachable service exit 3; bad input exits 2', async () => {
  const api = await fakeApi();
  try {
    const none = await run(['search', 'nothing here'], api.base);
    assert.equal(none.status, 0);
    assert.match(none.stdout, /no photographs found/);
    assert.equal((await run(['search', 'limited'], api.base)).status, 3);
    assert.equal((await run(['search', 'x'.repeat(90)], api.base)).status, 2);
    assert.equal((await run(['get', 'not-an-id', '--out', 'x.jpg'], api.base)).status, 2);
    assert.equal((await run(['get', ID], api.base)).status, 2);
  } finally { api.server.close(); }
  const down = await run(['search', 'bread'], 'http://127.0.0.1:9/v1');
  assert.equal(down.status, 3);
  assert.match(down.stderr, /continue without photographs/);
});
