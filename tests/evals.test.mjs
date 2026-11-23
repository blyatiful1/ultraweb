import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import http from 'node:http';
import { resolvePlaywright } from '../evals/lib.mjs';

const evals = join(dirname(fileURLToPath(import.meta.url)), '..', 'evals');

function crc(buf) { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let x = 0xffffffff; for (const b of buf) x = t[(x ^ b) & 255] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function png(w = 8, h = 8) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('compare.mjs builds a blind page with no arm names before reveal', () => {
  const root = mkdtempSync(join(tmpdir(), 'evals-'));
  const arms = { 'zz-run-one': 'armalpha', 'zz-run-two': 'armbeta' };
  for (const [id, arm] of Object.entries(arms)) {
    const shots = join(root, 'runs', id, 'shots'); mkdirSync(shots, { recursive: true });
    for (const vp of ['desktop', 'mobile']) for (const n of ['01', '02']) writeFileSync(join(shots, `${vp}-home-${n}.png`), png());
    writeFileSync(join(root, 'runs', id, 'meta.json'), JSON.stringify({ run: id, arm, tokens: { input: 1, output: 2 }, qa: { verdict: 'PASS' } }));
  }
  const out = join(root, 'compare', 'x.html');
  const r = spawnSync(process.execPath, [join(evals, 'compare.mjs'), '--root', root, '--brief', 'demo', '--runs', Object.keys(arms).join(','), '--out', out], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(out, 'utf8');
  for (const s of [...Object.keys(arms), ...Object.values(arms)]) assert.ok(!html.includes(s), `leaked ${s}`);
  assert.ok(html.includes('Reveal') && html.includes('Export JSON'));
  const assets = readdirSync(join(root, 'compare', 'x-assets'));
  assert.equal(assets.length, 8);
  assert.ok(assets.every((f) => !/zz|arm/.test(f)));
});

test('capture.mjs works against a local static page', { skip: !resolvePlaywright() && 'playwright not available' }, async () => {
  const srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); s.end('<!doctype html><title>t</title><body style="margin:0"><div style="height:2200px;background:linear-gradient(#fff,#369)">hello</div>'); });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const root = mkdtempSync(join(tmpdir(), 'evals-'));
  try {
    const r = await new Promise((res) => {
      const p = spawn(process.execPath, [join(evals, 'capture.mjs'), '--root', root, '--run', 'r1', '--url', `http://127.0.0.1:${srv.address().port}/`]);
      let o = ''; p.stdout.on('data', (d) => (o += d)); p.stderr.on('data', (d) => (o += d));
      p.on('close', (status) => res({ status, stdout: o, stderr: '' }));
    });
    assert.equal(r.status, 0, r.stderr + r.stdout);
    const shots = join(root, 'runs', 'r1', 'shots');
    for (const f of ['desktop-home-01.png', 'desktop-home-03.png', 'desktop-home-full.png', 'mobile-home-01.png', 'mobile-home-full.png', 'contact-desktop.png', 'contact-mobile.png'])
      assert.ok(existsSync(join(shots, f)), f);
    assert.ok(JSON.parse(readFileSync(join(root, 'runs', 'r1', 'meta.json'), 'utf8')).capture);
  } finally { srv.close(); }
});
