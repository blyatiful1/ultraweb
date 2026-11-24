#!/usr/bin/env node
// photos.mjs — find and fetch openly licensed photographs as STAND-INS for a demo build,
// with the credit each licence requires. Search runs against the Openverse API (no key).
//
//   node photos.mjs search "<subject>" [--count 8] [--shape wide|tall|square] [--min-width 800]
//                                      [--thumbs <dir>]
//   node photos.mjs get <id> --out <file.jpg> [--role atmosphere|proof]
//   node photos.mjs credits [--dir <dir>] [--format html|md|json]
//   node photos.mjs list [--dir <dir>]
//
// A stand-in is somebody else's photograph. It never becomes the client's: the build marks
// it (data-standin), credits it, lists it in the handoff, and ship blocks production until
// the client supplies their own or approves keeping the licensed image. See
// references/imagery.md. Queries describe the subject ("rye sourdough loaf on a wooden
// board"); never put the client's name or any personal detail in a query.
//
// Exit: 0 ok, 2 bad input, 3 the search service or a download is unavailable (build on
// without photographs and say so).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename, resolve } from 'node:path';

const API = (process.env.ULTRAWEB_PHOTOS_API || 'https://api.openverse.org/v1').replace(/\/+$/, '');
const UA = 'ultraweb-photos/1 (open-licence stand-in search)';
const MAX_BYTES = 6 * 1024 * 1024;
const LICENCE_NAMES = { cc0: 'CC0', pdm: 'Public Domain Mark', by: 'CC BY', 'by-sa': 'CC BY-SA', 'by-nd': 'CC BY-ND', 'by-nc': 'CC BY-NC', 'by-nc-sa': 'CC BY-NC-SA', 'by-nc-nd': 'CC BY-NC-ND' };

const HELP = `photos.mjs — openly licensed stand-in photographs for a demo build

  node photos.mjs search "<subject>" [--count 8] [--shape wide|tall|square] [--min-width 800] [--thumbs <dir>]
  node photos.mjs get <id> --out <file.jpg> [--role atmosphere|proof]
  node photos.mjs credits [--dir <dir>] [--format html|md|json]
  node photos.mjs list [--dir <dir>]

search   lists photographs whose licence allows commercial use and changes. With --thumbs it
         also saves a small preview of each into <dir> so you can look before choosing.
get      downloads one photograph and records it in credits.json beside the file.
         --role proof marks a picture that stands for the client's own work, people or
         premises (it must carry a visible "stand-in" label on the page); atmosphere is
         everything else (the default).
credits  prints the credit line for the page footer from credits.json.

Queries describe the subject only. Never include the client's name.
Exit 3 means the service is unreachable: continue without photographs and say so.
`;

function die(msg, code = 2) {
  process.stderr.write(`photos: ${msg}\n`);
  process.exit(code);
}

function parse(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a.startsWith('--')) {
      const key = a.slice(2);
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) die(`${a} needs a value`);
      out[key] = argv[++i];
    } else out._.push(a);
  }
  return out;
}

async function getJson(url, retried = false) {
  let res;
  try {
    res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
  } catch (e) {
    die(`photo search unavailable (${(e.cause && e.cause.code) || e.name || 'network error'}): continue without photographs`, 3);
  }
  if ((res.status === 429 || res.status === 401) && !retried) {
    // the anonymous quota is per minute: wait once, then try again
    await new Promise((r) => setTimeout(r, Number(process.env.ULTRAWEB_PHOTOS_RETRY_MS ?? 20000)));
    return getJson(url, true);
  }
  if (res.status === 429 || res.status === 401) die('photo search has run out of its anonymous quota for now: wait a few minutes, or continue without photographs', 3);
  if (!res.ok) die(`photo search answered ${res.status}: continue without photographs`, 3);
  try {
    return await res.json();
  } catch {
    die('photo search returned something that is not JSON: continue without photographs', 3);
  }
}

async function getBytes(url) {
  let res;
  try {
    res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(40000) });
  } catch (e) {
    die(`download failed (${(e.cause && e.cause.code) || e.name || 'network error'}): pick another photograph`, 3);
  }
  if (!res.ok) die(`download answered ${res.status}: pick another photograph`, 3);
  const type = res.headers.get('content-type') || '';
  if (!/^image\//i.test(type)) die(`download is not an image (${type || 'no content type'}): pick another photograph`, 3);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) die(`photograph is ${Math.round(buf.length / 1024)} kB, over the ${MAX_BYTES / 1024 / 1024} MB limit: pick a smaller one`, 3);
  return { buf, type };
}

const licenceLabel = (r) => `${LICENCE_NAMES[r.license] || String(r.license || '').toUpperCase()}${r.license_version && !['cc0', 'pdm'].includes(r.license) ? ' ' + r.license_version : ''}`;
const clean = (s, n = 80) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

async function search(args) {
  const q = clean(args._[1], 200);
  if (!q) die('search needs a subject in quotes');
  if (q.length > 80) die('keep the query under 80 characters: a subject, not a sentence');
  const count = Math.max(1, Math.min(20, Number.parseInt(args.count ?? '8', 10) || 8));
  const minWidth = Math.max(0, Number.parseInt(args['min-width'] ?? '800', 10) || 0);
  const params = new URLSearchParams({ q, license_type: 'commercial,modification', page_size: String(Math.min(40, count * 3)), mature: 'false', category: 'photograph' });
  if (args.shape) {
    if (!['wide', 'tall', 'square'].includes(args.shape)) die('--shape must be wide, tall or square');
    params.set('aspect_ratio', args.shape);
  }
  const data = await getJson(`${API}/images/?${params}`);
  const rows = (data.results || []).filter((r) => r && r.id && r.url && (!minWidth || !r.width || r.width >= minWidth)).slice(0, count);
  if (!rows.length) {
    const all = (data.results || []).length;
    process.stdout.write(all ? `${all} photograph(s) found for "${q}" but none at least ${minWidth}px wide: add --min-width 0 to see them\n` : `no photographs found for "${q}": try a plainer subject of two or three words\n`);
    return;
  }
  let dir = null;
  if (args.thumbs) {
    dir = resolve(args.thumbs);
    mkdirSync(dir, { recursive: true });
  }
  process.stdout.write(`${rows.length} photograph(s) for "${q}". Licences allow commercial use and changes; each needs its credit.\n\n`);
  let n = 0;
  for (const r of rows) {
    n++;
    process.stdout.write(`${String(n).padStart(2)}. ${r.id}\n    ${r.width || '?'}x${r.height || '?'}  ${licenceLabel(r)}  by ${clean(r.creator, 40) || 'unknown'}\n    ${clean(r.title, 90) || '(untitled)'}\n`);
    if (dir && r.thumbnail) {
      try {
        const res = await fetch(r.thumbnail, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
        if (res.ok) {
          const file = join(dir, `${String(n).padStart(2, '0')}-${r.id.slice(0, 8)}.jpg`);
          writeFileSync(file, Buffer.from(await res.arrayBuffer()));
          process.stdout.write(`    preview: ${file}\n`);
        }
      } catch {
        // a missing preview is not worth failing the search for
      }
    }
  }
  process.stdout.write(`\nLook at the previews, then: node photos.mjs get <id> --out <file.jpg>\n`);
}

const creditsFile = (dir) => join(dir, 'credits.json');
function readCredits(dir) {
  try {
    const j = JSON.parse(readFileSync(creditsFile(dir), 'utf8'));
    return Array.isArray(j.photos) ? j.photos : [];
  } catch {
    return [];
  }
}

async function get(args) {
  const id = args._[1];
  if (!id || !/^[0-9a-f-]{8,40}$/i.test(id)) die('get needs the id printed by search');
  if (!args.out) die('get needs --out <file.jpg>');
  const role = args.role ?? 'atmosphere';
  if (!['atmosphere', 'proof'].includes(role)) die('--role must be atmosphere or proof');
  const out = resolve(args.out);
  const r = await getJson(`${API}/images/${encodeURIComponent(id)}/`);
  if (!r || !r.url) die('that id has no downloadable file: pick another photograph', 3);
  const { buf } = await getBytes(r.url);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  const dir = dirname(out);
  const photos = readCredits(dir).filter((p) => p.file !== basename(out));
  photos.push({
    file: basename(out),
    id: r.id,
    title: clean(r.title, 120),
    creator: clean(r.creator, 80),
    creator_url: r.creator_url || null,
    licence: licenceLabel(r),
    licence_url: r.license_url || null,
    source: r.foreign_landing_url || r.url,
    width: r.width || null,
    height: r.height || null,
    role,
    standin: true,
    added: new Date().toISOString().slice(0, 10),
  });
  writeFileSync(creditsFile(dir), JSON.stringify({ photos }, null, 2) + '\n');
  process.stdout.write(
    `saved ${out} (${Math.round(buf.length / 1024)} kB, ${r.width || '?'}x${r.height || '?'})\n` +
      `credit: "${clean(r.title, 60) || 'Untitled'}" by ${clean(r.creator, 40) || 'unknown'}, ${licenceLabel(r)}\n` +
      `mark the <img> with data-standin${role === 'proof' ? ' and show a visible "Stand-in photo" label on it' : ''}, set width and height, and write alt text for what the picture shows.\n`
  );
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function credits(args) {
  const dir = resolve(args.dir ?? '.');
  if (!existsSync(creditsFile(dir))) die(`no credits.json in ${dir}`);
  const photos = readCredits(dir);
  const format = args.format ?? 'html';
  if (format === 'json') return void process.stdout.write(JSON.stringify(photos, null, 2) + '\n');
  if (format === 'md') {
    for (const p of photos) process.stdout.write(`- ${p.file}: "${p.title || 'Untitled'}" by ${p.creator || 'unknown'}, ${p.licence} (${p.source})\n`);
    return;
  }
  if (format !== 'html') die('--format must be html, md or json');
  const items = photos.map((p) => {
    const title = p.source ? `<a href="${esc(p.source)}">${esc(p.title || 'Untitled')}</a>` : esc(p.title || 'Untitled');
    const lic = p.licence_url ? `<a href="${esc(p.licence_url)}">${esc(p.licence)}</a>` : esc(p.licence);
    return `${title} by ${esc(p.creator || 'unknown')} (${lic})`;
  });
  process.stdout.write(`<p class="credits">Stand-in photographs: ${items.join('; ')}.</p>\n`);
}

function list(args) {
  const dir = resolve(args.dir ?? '.');
  const photos = readCredits(dir);
  if (!photos.length) return void process.stdout.write('no photographs recorded\n');
  for (const p of photos) process.stdout.write(`${p.file}  ${p.role}  ${p.licence}  ${p.creator || 'unknown'}\n`);
}

const args = parse(process.argv.slice(2));
const cmd = args._[0];
if (args.help || !cmd) process.stdout.write(HELP);
else if (cmd === 'search') await search(args);
else if (cmd === 'get') await get(args);
else if (cmd === 'credits') credits(args);
else if (cmd === 'list') list(args);
else die(`unknown command "${cmd}" (try --help)`);
