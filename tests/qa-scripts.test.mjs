// Contract tests for the measurement library (scripts/measure/*.mjs) — the files the gate
// skills name and gate-runner loads through the Playwright MCP tool browser_run_code_unsafe
// with `filename:`. That tool evaluates the file as `await (<file contents>)(page)`, so the
// static tests below hold every file to exactly that shape, and the live block drives all
// fifteen against tests/fixtures/measure-page/index.html, whose planted defects must show up
// in the returned data. The live block serves that fixture from a node:http static server on
// 127.0.0.1: the MCP server refuses file:// origins, and file:// hides the three network paths
// (links-collect fetches nothing, cold-load-js weighs nothing, fonts never load), so the test
// must drive the same shape gate-runner does — a production server over http.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const measureDir = join(root, 'scripts', 'measure');
const fixtureDir = join(root, 'tests', 'fixtures', 'measure-page');

// The catalog is fixed by the plan's measurement-library contract; the gates name these files.
const CONTRACT = [
  '_selftest',
  'contrast-matrix',
  'keyboard-walk',
  'landmarks-headings',
  'alt-and-labels',
  'targets',
  'text-spacing',
  'forms-a11y',
  'overflow-culprits',
  'wallpaper-rhythm',
  'heading-narrative',
  'links-collect',
  'cold-load-js',
  'font-requests',
  'axe',
];

const files = readdirSync(measureDir).filter((f) => f.endsWith('.mjs')).sort();
const source = (f) => readFileSync(join(measureDir, f), 'utf8').replace(/\r\n/g, '\n');
const stripComments = (s) => s.replace(/^(?:[ \t]*(?:\/\/[^\n]*)?\n)+/, '');
const load = (f) => new Function('return (' + stripComments(source(f)) + ')')();

test('every measure script is one async (page) => {} expression', () => {
  for (const f of files) {
    let fn;
    assert.doesNotThrow(() => {
      fn = load(f);
    }, `scripts/measure/${f} does not parse as a single expression`);
    assert.equal(typeof fn, 'function', `${f}: not a function`);
    assert.equal(fn.length, 1, `${f}: takes ${fn.length} arguments, expected exactly (page)`);
    assert.equal(fn.constructor.name, 'AsyncFunction', `${f}: not an async function`);
  }
});

test('the library holds exactly the contract catalog', () => {
  assert.deepEqual(files, CONTRACT.map((n) => `${n}.mjs`).sort());
});

test('no script carries a relative path or a module reference', () => {
  for (const f of files) {
    const src = source(f);
    assert.ok(!src.includes('./'), `${f}: contains a bare relative path ("./") — the MCP server's cwd is not the project`);
    assert.ok(!src.includes('../'), `${f}: contains a bare relative path ("../")`);
    assert.ok(!/^\s*import[\s{]/m.test(src), `${f}: has an import statement — the file must be one expression`);
    assert.ok(!/\brequire\s*\(/.test(src), `${f}: calls require() — the file must be one expression`);
    assert.ok(!/\bfrom\s+['"]/.test(src), `${f}: has a module specifier — the file must be one expression`);
  }
});

test('every script documents its purpose, config, return shape and assertion', () => {
  for (const f of files) {
    const head = source(f).split(/^async \(page\)/m)[0];
    assert.ok(/^\/\//.test(head.trim()), `${f}: no leading // comment block`);
    assert.match(head, /Config keys read:/, `${f}: comment block does not say which config keys it reads`);
    assert.match(head, /Returns:/, `${f}: comment block does not state the return shape`);
    assert.match(head, /assert/i, `${f}: comment block does not state what the gate asserts`);
  }
});

// ---------------------------------------------------------------- live run

// Every playwright this machine can reach, best first: a project devDependency, then the
// global install, then the npx cache. Several may resolve while only one has a matching
// browser binary, so the caller tries them in order.
function findPlaywright() {
  const req = createRequire(import.meta.url);
  const candidates = [];
  const add = (path, how) => {
    if (path && !candidates.some((c) => c.path === path)) candidates.push({ path, how });
  };
  try {
    add(req.resolve('playwright'), 'resolved from tests/');
  } catch (e) {
    /* no project install — keep looking */
  }
  const roots = ['/usr/lib/node_modules', '/usr/local/lib/node_modules'];
  try {
    roots.unshift(execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
  } catch (e) {
    /* no npm on PATH */
  }
  const npxCache = join(homedir(), '.npm', '_npx');
  if (existsSync(npxCache)) {
    for (const d of readdirSync(npxCache)) roots.push(join(npxCache, d, 'node_modules'));
  }
  for (const r of roots.filter(Boolean)) {
    try {
      add(req.resolve('playwright', { paths: [r] }), `install at ${r}`);
    } catch (e) {
      /* keep looking */
    }
  }
  let cli = null;
  try {
    cli = execFileSync('npx', ['--no-install', 'playwright', '--version'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (e) {
    cli = null;
  }
  return { candidates, cli };
}

// The fixture over http, Content-Type by extension, nothing cached (a cached script reports
// transferSize 0 and cold-load-js would measure a lie). Anything not on disk answers 404 —
// that is what /missing-page is for.
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};
function serveFixture() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(String(req.url || '/').split('?')[0]);
    const file = join(fixtureDir, path === '/' ? 'index.html' : path);
    if (!file.startsWith(fixtureDir + '/') || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }))
  );
}

function findAxePath() {
  for (const base of [root, process.cwd()]) {
    const p = join(base, 'node_modules', 'axe-core', 'axe.min.js');
    if (existsSync(p)) return p;
  }
  const req = createRequire(import.meta.url);
  try {
    return req.resolve('axe-core/axe.min.js');
  } catch (e) {
    return null;
  }
}

test('the library measures the fixture and its planted defects', { timeout: 180000 }, async (t) => {
  const { candidates, cli } = findPlaywright();
  const require_ = createRequire(import.meta.url);
  let browser = null;
  let why = candidates.length
    ? 'no reachable playwright could launch chromium'
    : cli
      ? `the playwright CLI is present (${cli}) but the module is not importable`
      : 'playwright is not installed here';
  for (const c of candidates) {
    try {
      // playwright's entry point is CommonJS; requiring it keeps the named exports intact
      const mod = require_(c.path);
      const chromium = mod.chromium || (mod.default && mod.default.chromium);
      if (!chromium) throw new Error('module exports no chromium');
      browser = await chromium.launch({ headless: true });
      t.diagnostic(`playwright: ${c.how}`);
      break;
    } catch (e) {
      why = `${c.how}: ${String(e.message).split('\n')[0]}`;
    }
  }
  if (!browser) {
    const install = 'npm i -D playwright axe-core && npx playwright install --with-deps chromium';
    // locally the browser is optional; in CI a skipped live block is a silent hole in the gate library
    if (process.env.CI) throw new Error(`${why} — CI must install the browser first: ${install}`);
    t.skip(`${why} — run: ${install}`);
    return;
  }

  const { server, origin } = await serveFixture();
  const url = `${origin}/`;
  const seed = (page, config) => page.evaluate((c) => { window.__ultraweb = c; }, config);
  const kinds = (list) => list.map((i) => i.kind);

  try {
    const wide = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await wide.goto(url, { waitUntil: 'load' });
    await seed(wide, { theme: 'light', themeStrategy: 'class', threshold: 24 });

    const selftest = await load('_selftest.mjs')(wide);
    assert.equal(selftest.ok, true, '_selftest did not return ok');
    assert.equal(selftest.configSeen, true, '_selftest did not see the seeded config');

    const contrast = await load('contrast-matrix.mjs')(wide);
    assert.ok(contrast.counts.pairs > 5, 'contrast-matrix found almost no text');
    assert.ok(contrast.failing.length >= 1, 'contrast-matrix missed the low-contrast paragraph');
    assert.ok(contrast.pairs.some((p) => p.pass), 'contrast-matrix reported no passing pair');

    await seed(wide, { theme: 'dark', themeStrategy: 'class', threshold: 24 });
    const dark = await load('contrast-matrix.mjs')(wide);
    assert.equal(dark.theme, 'dark');
    assert.ok(dark.failing.length >= 1, 'contrast-matrix missed the low-contrast paragraph in the dark theme');
    assert.ok(dark.pairs.some((p) => p.bg === '#111111'), 'the class-strategy dark theme was not applied');
    // the page must be handed back as it was found, or every later script measures our theme
    assert.equal(
      await wide.evaluate(() => document.documentElement.classList.contains('dark')),
      false,
      'contrast-matrix left html.dark on the page after a class-strategy dark run'
    );

    await seed(wide, { theme: 'dark', themeStrategy: 'class', keepTheme: true, threshold: 24 });
    const kept = await load('contrast-matrix.mjs')(wide);
    assert.ok(kept.pairs.some((p) => p.bg === '#111111'), 'the keepTheme run did not apply the dark theme');
    assert.equal(
      await wide.evaluate(() => document.documentElement.classList.contains('dark')),
      true,
      'keepTheme: true still reverted the applied theme'
    );
    await wide.evaluate(() => document.documentElement.classList.remove('dark'));

    await seed(wide, { theme: 'dark', themeStrategy: 'media', threshold: 24 });
    const emulatedRun = await load('contrast-matrix.mjs')(wide);
    assert.equal(emulatedRun.theme, 'dark');
    assert.equal(
      await wide.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches),
      false,
      'contrast-matrix left its colorScheme emulation standing'
    );
    await seed(wide, { theme: 'light', themeStrategy: 'class', threshold: 24 });

    const structure = await load('landmarks-headings.mjs')(wide);
    assert.ok(kinds(structure.issues).includes('skipped-level'), 'landmarks-headings missed the h1 → h3 jump');
    assert.ok(kinds(structure.issues).includes('empty-heading'), 'landmarks-headings missed the empty h2');
    assert.ok(!kinds(structure.issues).includes('no-main'), 'landmarks-headings did not see <main>');
    assert.ok(!kinds(structure.issues).includes('no-nav'), 'landmarks-headings did not see <nav>');
    assert.ok(!kinds(structure.issues).includes('no-h1'), 'landmarks-headings did not see the h1');

    const alt = await load('alt-and-labels.mjs')(wide);
    for (const kind of ['missing-alt', 'filename-alt', 'icon-button-no-name']) {
      assert.ok(kinds(alt.issues).includes(kind), `alt-and-labels missed ${kind}`);
    }
    assert.ok(alt.images.some((i) => !i.issue), 'alt-and-labels reported no correctly described image');

    const forms = await load('forms-a11y.mjs')(wide);
    assert.ok(kinds(forms.issues).includes('unlabelled'), 'forms-a11y missed the unlabelled input');
    const unmarked = forms.issues.filter((i) => i.kind === 'required-unmarked').map((i) => i.selector);
    assert.ok(
      unmarked.includes('#company'),
      'forms-a11y let aria-required="true" stand in for a visible required marker'
    );
    assert.ok(
      !unmarked.includes('#name-ok'),
      'forms-a11y flagged a required field whose label already carries "*"'
    );
    assert.equal(forms.forms.length, 1, 'forms-a11y did not find exactly the fixture form');
    assert.ok(forms.forms[0].submit && /Subscribe/.test(forms.forms[0].submit.text), 'forms-a11y missed the submit button');
    const autofill = forms.issues.filter((i) => i.kind === 'missing-autocomplete');
    assert.ok(
      autofill.some((i) => /postal_code/.test(i.detail)),
      'forms-a11y missed the postal_code field with no autocomplete'
    );
    assert.ok(
      !autofill.map((i) => i.selector).includes('#sort-by'),
      'forms-a11y read "Sortieren nach" as an address field — the tokens must match whole words'
    );
    const bound = forms.issues.filter((i) => i.kind === 'no-error-binding').map((i) => i.selector);
    assert.ok(bound.includes('#email-bad'), 'forms-a11y accepted an error node that renders nothing');
    assert.ok(!bound.includes('#email-good'), 'forms-a11y flagged an aria-invalid field bound to a visible role="alert"');
    const field = (sel) => forms.forms[0].fields.find((f) => f.selector === sel);
    assert.deepEqual(
      field('#email-good').describedByResolved,
      { exists: true, visible: true, role: 'alert', ariaLive: null, text: 'Enter a valid address.' },
      'describedByResolved did not resolve the visible error node'
    );
    assert.equal(field('#email-bad').describedByResolved.visible, false, 'a display:none error node reported visible');
    assert.equal(field('#email-ok').describedByResolved.exists, false, 'a field with no aria-describedby resolved one');

    const targets = await load('targets.mjs')(wide);
    assert.equal(targets.threshold, 24, 'targets ignored the seeded threshold');
    assert.ok(targets.small.length >= 1, 'targets missed the 16x16 icon button');
    assert.ok(targets.small.some((s) => s.w <= 16 && s.h <= 16), 'targets did not report the 16x16 box');

    const narrative = await load('heading-narrative.mjs')(wide);
    assert.ok(narrative.generic.includes('Features'), 'heading-narrative missed the generic "Features" heading');
    assert.ok(narrative.empty >= 1, 'heading-narrative missed the empty heading');

    const rhythm = await load('wallpaper-rhythm.mjs')(wide);
    assert.equal(rhythm.verdict, 'wallpaper', 'wallpaper-rhythm did not flag four identically padded sections');
    assert.equal(rhythm.sections.length, 4, 'wallpaper-rhythm did not find the four sections');

    const links = await load('links-collect.mjs')(wide);
    assert.ok(links.deadHash.length >= 1, 'links-collect missed the href="#" link');
    assert.ok(links.emptyText.length >= 1, 'links-collect missed the empty-text link');
    assert.ok(links.external.length >= 1, 'links-collect missed the external link');
    assert.ok(links.checked.length >= 1, 'links-collect fetched nothing — the fixture must be served over http');
    assert.ok(
      links.broken.some((b) => /\/missing-page$/.test(b.href) && b.status === 404),
      'links-collect missed the internal link to /missing-page'
    );

    const keys = await load('keyboard-walk.mjs')(wide);
    assert.equal(keys.skipLinkFirst, true, 'keyboard-walk did not see the skip link as the first tab stop');
    assert.equal(keys.trap, false, 'keyboard-walk reported a focus trap on the fixture');
    assert.ok(keys.count >= 5, `keyboard-walk found only ${keys.count} stops`);
    assert.ok(keys.stops.some((s) => !s.visibleFocusRing), 'keyboard-walk missed the outline:none button');
    assert.ok(keys.stops.some((s) => s.visibleFocusRing), 'keyboard-walk saw no focus ring anywhere');
    assert.ok(Array.isArray(keys.cycledWithin), 'keyboard-walk returned no cycledWithin array');

    const spacing = await load('text-spacing.mjs')(wide);
    assert.ok(Array.isArray(spacing.clipped), 'text-spacing returned no clipped array');
    assert.equal(
      spacing.overflowX,
      spacing.scrollWidth > spacing.clientWidth,
      'text-spacing must decide overflowX on documentElement.clientWidth, not innerWidth'
    );
    assert.ok(spacing.clientWidth <= spacing.innerWidth, 'clientWidth must exclude the scrollbar innerWidth counts');
    assert.equal(spacing.styleKept, false, 'text-spacing left its style injected');
    assert.equal(
      await wide.evaluate(() => !!document.getElementById('__ultraweb-text-spacing')),
      false,
      'text-spacing did not remove its injected style'
    );

    const axePath = findAxePath();
    await seed(wide, { theme: 'light', themeStrategy: 'class', axePath: axePath || undefined });
    const axe = await load('axe.mjs')(wide);
    if (!axe.source) {
      t.diagnostic(`axe skipped: ${axe.error} (install axe-core locally, or run with network)`);
    } else {
      t.diagnostic(`axe: source=${axe.source} violations=${axe.violations.length} passes=${axe.passes}`);
      assert.ok(axe.violations.length >= 1, `axe (${axe.source}) found no violation on a page full of them`);
      assert.ok(
        axe.violations.some((v) => /image-alt|button-name|label|heading/.test(v.id)),
        'axe found violations but none of the planted kinds'
      );
    }

    const cold = await load('cold-load-js.mjs')(wide);
    assert.ok(Array.isArray(cold.scripts), 'cold-load-js returned no script list');
    assert.ok(cold.count >= 1, 'cold-load-js missed the fixture.js script resource');
    assert.ok(cold.scripts.some((s) => /fixture\.js$/.test(s.name)), 'cold-load-js named no fixture.js entry');
    assert.ok(cold.totalTransfer > 0, 'cold-load-js weighed 0 bytes over the wire — the server must send no-store');

    await wide.evaluate(() => document.fonts.ready);
    const fonts = await load('font-requests.mjs')(wide);
    assert.ok(fonts.count >= 1, 'font-requests missed the fixture-face.woff2 request');
    assert.ok(fonts.faces.some((f) => f.family.includes('Fixture Face')), 'font-requests missed the @font-face');
    assert.deepEqual(fonts.errored, [], 'font-requests reported an errored face for a valid woff2');

    // an `error` field is the runner's UNVERIFIED signal — a healthy run must never carry one
    for (const [name, out] of [['contrast-matrix', contrast], ['forms-a11y', forms], ['links-collect', links],
      ['keyboard-walk', keys], ['text-spacing', spacing], ['cold-load-js', cold], ['font-requests', fonts]]) {
      assert.equal('error' in out, false, `${name} reported error "${out.error}" on a run that worked`);
    }

    await wide.close();

    const narrow = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await narrow.goto(url, { waitUntil: 'load' });
    await seed(narrow, { theme: 'light', themeStrategy: 'class', threshold: 44 });
    const overflow = await load('overflow-culprits.mjs')(narrow);
    assert.equal(overflow.overflowX, true, 'overflow-culprits missed the 1200px block at 375');
    assert.ok(Number.isFinite(overflow.clientWidth), 'overflow-culprits returned no clientWidth');
    assert.ok(overflow.clientWidth <= overflow.innerWidth, 'clientWidth must exclude the scrollbar innerWidth counts');
    assert.ok(
      overflow.scrollWidth > overflow.clientWidth,
      'overflowX is decided against documentElement.clientWidth, not innerWidth'
    );
    assert.equal(
      overflow.overflowX,
      overflow.scrollWidth > overflow.clientWidth,
      'overflowX must be exactly documentElement.scrollWidth > clientWidth'
    );
    assert.ok(overflow.culprits.some((c) => c.width >= 1200), 'overflow-culprits did not name the wide block');
    const bigTargets = await load('targets.mjs')(narrow);
    assert.equal(bigTargets.threshold, 44, 'targets ignored the responsive threshold');
    assert.ok(bigTargets.small.length >= targets.small.length, 'a 44px threshold found fewer small targets than 24px');
    await narrow.close();

    // a correct modal CYCLES: trap:true is focus pinned on one element, never a working dialog
    const modal = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await modal.goto(url, { waitUntil: 'load' });
    await modal.click('#open-dialog');
    const ring = await load('keyboard-walk.mjs')(modal);
    assert.ok(Array.isArray(ring.cycledWithin), 'keyboard-walk returned no cycledWithin array');
    assert.equal(ring.trap, false, 'keyboard-walk called a cycling dialog a trap');
    assert.deepEqual(
      ring.cycledWithin,
      ['#dialog-confirm', '#dialog-cancel', '#dialog-close'],
      'cycledWithin is not the dialog ring, in order, once each'
    );
    assert.ok(
      await modal.evaluate(
        (sels) => sels.every((s) => document.getElementById('dialog').contains(document.querySelector(s))),
        ring.cycledWithin
      ),
      'a cycledWithin selector sits outside the dialog'
    );
    await modal.close();

    // an empty page must produce data, never a throw
    const blank = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await blank.goto('about:blank');
    await seed(blank, { axeUrl: 'http://127.0.0.1:1/axe.js' });
    for (const f of files) {
      const out = await load(f)(blank);
      assert.equal(typeof out, 'object', `${f} returned no object on an empty page`);
      assert.ok('url' in out, `${f} returned no url on an empty page`);
    }
    await blank.close();
  } finally {
    await browser.close();
    server.close();
  }
});
