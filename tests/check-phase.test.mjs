// Tests for scripts/check-phase.mjs — structural phase validation, using temp-dir fixtures.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, '..', 'scripts', 'check-phase.mjs');
const palette = join(here, '..', 'scripts', 'palette.mjs');
const run = (phase, dir, extra = []) => spawnSync('node', [script, String(phase), '--project', dir, ...extra], { encoding: 'utf8' });
const put = (dir, rel, text) => { mkdirSync(dirname(join(dir, rel)), { recursive: true }); writeFileSync(join(dir, rel), text); };
const get = (dir, rel) => readFileSync(join(dir, rel), 'utf8');

const BRIEF = (tier = 'standard', mode = 'guided') => `# Brief — Test
Tier: ${tier}
Mode: ${mode}
Deployment mode: production
Site kind: place
## Site type
local business
## Audience
A baker's regular on her phone at 6am.
## Conversion
Reserve a loaf.
## Tone
Warm but exact. "Come early, the good ones go."
## Subject world
Flour sacks, proofing baskets, a till receipt.
## Pages
Home, privacy
## Content inventory
Opening hours, the weekly bread list.
## Material claims
none
## Backend
needs: a contact form with email
rejected: database, accounts
## Assets
No client assets provided — everything visual is invented.
`;
const DIRECTION = `# Direction: Bread as a timetable
## Subject
Proofing schedules, receipts.
## Decisions
Ground: dark (night bakery)
Type: slab (shop signs)
Colour: one accent
Layout principle: dense index
Imagery: type only
Motion: 1; nothing moves on scroll
Theme: single (dark)
## Signature move
Name: the timetable hero. Place: home, first viewport. Budget: no JS. Fallback: static table.
## Assets
None.
## Defaults used
none
## Will not
- a hero video
- a testimonial carousel
- gradient text
- a blog
- stock photography
## Approved
Maria, 2026-01-02, candidate B
`;
const SITEMAP = `# Sitemap

## Routes
| Route | Purpose | Goal | Nav |
|---|---|---|---|
| / | sell the bread list | reserve | header |
| /privacy | data protection notice | — | footer |

## Pages
### / — goal: reserve

## Copy deck
| Slot | Limit | Text |
|---|---|---|
| /.meta.title | 60 chars | Bread by the hour |
| /.hero.heading | 8 words | Fresh at six |
`;
const PROGRESS = `# Progress — Test
## Now
Phase 8
## Checkpoints
### CP1 Direction pick
Approved
### CP2 Homepage review
Shown: shots
Approved
### CP3 Acceptance
Shown: gates table
Approved with notes
## Assumptions
none
`;

function project({ tier = 'standard', mode = 'guided' } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'cp-'));
  put(d, 'design/BRIEF.md', BRIEF(tier, mode));
  put(d, 'design/DIRECTION.md', DIRECTION);
  const n = tier === 'sketch' ? 2 : 3;
  for (let i = 0; i < n; i++) put(d, `design/mockups/${'abc'[i]}-x.html`, '<html></html>');
  put(d, 'design/mockups/index.html', '<html></html>');
  put(d, 'design/SYSTEM.md', '# System\ncolor, type\n');
  const css = spawnSync('node', [palette, '--ground', 'dark', '--hue', '60', '--dual'], { encoding: 'utf8' }).stdout;
  put(d, 'app/globals.css', css);
  put(d, 'design/SITEMAP.md', SITEMAP);
  put(d, 'app/page.tsx', 'export default function P(){return null}');
  put(d, 'app/(legal)/privacy/page.tsx', 'export default function P(){return null}');
  put(d, 'design/PROGRESS.md', PROGRESS);
  put(d, 'qa/gates.json', JSON.stringify({ round: 1, verdict: 'PASS' }));
  put(d, 'qa/judge-round-1.md', '# Round 1\nverdict: FIX\n');
  put(d, 'qa/judge-round-2.md', '# Round 2\nscores...\nverdict: SHIP\n');
  put(d, 'README.md', '# Test\n');
  return d;
}
const fails = (r, ...needles) => {
  assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stdout}${r.stderr}`);
  for (const n of needles) assert.ok(r.stdout.includes(n), `output should mention "${n}":\n${r.stdout}`);
};

test('a complete minimal project passes every phase 1-8', () => {
  const d = project();
  for (let ph = 1; ph <= 8; ph++) {
    const r = run(ph, d);
    assert.equal(r.status, 0, `phase ${ph}: ${r.stdout}${r.stderr}`);
    assert.match(r.stdout, new RegExp(`phase ${ph}: ok`));
  }
});

test('--help, bad phase, bad flag, missing directory exit as documented', () => {
  assert.equal(spawnSync('node', [script, '--help'], { encoding: 'utf8' }).status, 0);
  for (const args of [['0'], ['9'], ['x'], [], ['1', '--bogus'], ['1', '--project', '/nonexistent-dir-xyz']]) {
    const r = spawnSync('node', [script, ...args], { encoding: 'utf8' });
    if (args.length === 0) { assert.equal(r.status, 0); continue; }
    assert.equal(r.status, 2, args.join(' '));
  }
});

test('phase 1: missing file, missing/invalid lines, missing or empty sections, TODO', () => {
  let d = project(); rmSync(join(d, 'design/BRIEF.md'));
  fails(run(1, d), 'design/BRIEF.md', 'missing');
  for (const line of ['Tier', 'Mode', 'Deployment mode']) {
    d = project();
    put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace(new RegExp(`^${line}:.*\\n`, 'm'), ''));
    fails(run(1, d), `${line}:`);
  }
  d = project(); put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace('Tier: standard', 'Tier: sketch | standard | flagship'));
  fails(run(1, d), 'Tier:');
  for (const sec of ['Audience', 'Subject world', 'Material claims', 'Assets']) {
    d = project();
    put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace(new RegExp(`## ${sec}\\n[^#]*`), `## ${sec}\n\n`));
    fails(run(1, d), `## ${sec}`, 'empty');
    d = project();
    put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace(`## ${sec}`, '## Renamed'));
    fails(run(1, d), `## ${sec}`, 'missing');
  }
  d = project(); put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace('rejected: database, accounts', ''));
  fails(run(1, d), 'rejected:');
  d = project(); put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace('Reserve a loaf.', 'TODO'));
  fails(run(1, d), 'TODO');
});

test('phase 2: direction sections, decision lines, signature move, Will not count, Approved', () => {
  let d = project(); rmSync(join(d, 'design/DIRECTION.md'));
  fails(run(2, d), 'design/DIRECTION.md', 'missing');
  for (const sec of ['Subject', 'Decisions', 'Signature move', 'Assets', 'Defaults used', 'Will not', 'Approved']) {
    d = project();
    put(d, 'design/DIRECTION.md', get(d, 'design/DIRECTION.md').replace(new RegExp(`## ${sec}\\n`), `## X${sec}\n`));
    fails(run(2, d), `## ${sec}`);
  }
  for (const line of ['Ground', 'Type', 'Colour', 'Layout principle', 'Imagery', 'Motion', 'Theme']) {
    d = project();
    put(d, 'design/DIRECTION.md', get(d, 'design/DIRECTION.md').replace(new RegExp(`^${line}:.*\\n`, 'm'), ''));
    fails(run(2, d), `"${line}:"`);
  }
  d = project(); put(d, 'design/DIRECTION.md', get(d, 'design/DIRECTION.md').replace('Budget: no JS. ', ''));
  fails(run(2, d), 'budget');
  d = project(); put(d, 'design/DIRECTION.md', get(d, 'design/DIRECTION.md').replace('- stock photography\n', ''));
  fails(run(2, d), '4 entries');
  d = project(); put(d, 'design/DIRECTION.md', get(d, 'design/DIRECTION.md').replace(/## Approved\n.*\n/, '## Approved\n\n'));
  fails(run(2, d), '## Approved', 'empty');
  d = project(); put(d, 'design/DIRECTION.md', get(d, 'design/DIRECTION.md').replace(/## Approved\n.*\n/, '## Approved\nautonomous\n'));
  fails(run(2, d), 'autonomous');
});

test('phase 2: sketch needs two mockups, standard three; index.html does not count', () => {
  let d = project({ tier: 'sketch' });
  assert.equal(run(2, d).status, 0);
  rmSync(join(d, 'design/mockups/b-x.html'));
  fails(run(2, d), 'design/mockups/', 'sketch tier needs 2');
  d = project({ tier: 'standard' });
  assert.equal(run(2, d).status, 0);
  rmSync(join(d, 'design/mockups/c-x.html'));
  fails(run(2, d), 'design/mockups/', 'needs 3');
  d = project({ tier: 'standard' });
  for (const f of ['a-x.html', 'b-x.html']) rmSync(join(d, 'design/mockups', f));
  fails(run(2, d), '1 candidate');
});

test('phase 3: SYSTEM.md, token file, every token, and palette check', () => {
  let d = project(); rmSync(join(d, 'design/SYSTEM.md'));
  fails(run(3, d), 'design/SYSTEM.md');
  d = project(); rmSync(join(d, 'app/globals.css'));
  fails(run(3, d), 'no token file');
  d = project(); put(d, 'app/globals.css', get(d, 'app/globals.css').replace(/ {2}--ring: [^;]+;\n/g, ''));
  fails(run(3, d), 'app/globals.css', '--ring');
  d = project(); put(d, 'app/globals.css', get(d, 'app/globals.css').replace(/ {2}--shadow-k: [^;]+;\n/g, ''));
  fails(run(3, d), '--shadow-k');
  d = project(); put(d, 'app/globals.css', get(d, 'app/globals.css').replace(/(:root \{[^}]*--muted-foreground: )[^;]+;/, '$1oklch(0.9 0.01 60);'));
  fails(run(3, d), 'contrast fails', '--muted-foreground');
  // static path
  d = project(); rmSync(join(d, 'app/globals.css'));
  put(d, 'site/styles.css', spawnSync('node', [palette, '--ground', 'light-neutral', '--hue', '200'], { encoding: 'utf8' }).stdout);
  assert.equal(run(3, d).status, 0);
});

test('phase 4: routes and copy deck', () => {
  let d = project(); put(d, 'design/SITEMAP.md', get(d, 'design/SITEMAP.md').replace(/\| \/ \|.*\n\| \/privacy \|.*\n/, ''));
  fails(run(4, d), 'no route');
  d = project(); put(d, 'design/SITEMAP.md', get(d, 'design/SITEMAP.md').replace('| Fresh at six |', '|  |'));
  fails(run(4, d), '/.hero.heading', 'empty Text cell');
  d = project(); put(d, 'design/SITEMAP.md', get(d, 'design/SITEMAP.md').replace('Fresh at six', 'TODO-COPY'));
  fails(run(4, d), 'TODO-COPY');
  d = project(); put(d, 'design/SITEMAP.md', get(d, 'design/SITEMAP.md').replace('## Copy deck', '## Deck'));
  fails(run(4, d), 'Copy deck');
});

test('phase 5: homepage file and CP2 entry; autonomous needs no CP entry', () => {
  let d = project(); rmSync(join(d, 'app/page.tsx'));
  fails(run(5, d), 'no homepage');
  d = project(); put(d, 'design/PROGRESS.md', get(d, 'design/PROGRESS.md').replace('### CP2 Homepage review', '### Review'));
  fails(run(5, d), 'CP2');
  d = project(); rmSync(join(d, 'design/PROGRESS.md'));
  fails(run(5, d), 'design/PROGRESS.md');
  d = project({ mode: 'autonomous' }); rmSync(join(d, 'design/PROGRESS.md'));
  assert.equal(run(5, d).status, 0);
  // static homepage
  d = project(); rmSync(join(d, 'app/page.tsx')); put(d, 'site/index.html', '<html></html>');
  assert.equal(run(5, d).status, 0);
});

test('phase 6: a file per route, route groups ignored, static layouts accepted', () => {
  let d = project(); rmSync(join(d, 'app/(legal)'), { recursive: true });
  fails(run(6, d), 'route /privacy', 'app/privacy/page.tsx');
  d = project(); rmSync(join(d, 'app/(legal)'), { recursive: true }); put(d, 'app/privacy/page.tsx', 'x');
  assert.equal(run(6, d).status, 0);
  d = project(); rmSync(join(d, 'app/(legal)'), { recursive: true }); put(d, 'src/app/(m)/(legal)/privacy/page.tsx', 'x');
  assert.equal(run(6, d).status, 0);
  d = project(); rmSync(join(d, 'app/page.tsx')); rmSync(join(d, 'app/(legal)'), { recursive: true });
  put(d, 'site/index.html', 'x'); put(d, 'site/privacy.html', 'x');
  assert.equal(run(6, d).status, 0);
  rmSync(join(d, 'site/privacy.html')); put(d, 'site/privacy/index.html', 'x');
  assert.equal(run(6, d).status, 0);
  rmSync(join(d, 'site/privacy'), { recursive: true });
  fails(run(6, d), 'route /privacy', 'site/privacy.html');
});

test('phase 7: gates verdict and the highest judge round', () => {
  let d = project(); rmSync(join(d, 'qa/gates.json'));
  fails(run(7, d), 'qa/gates.json', 'missing');
  d = project(); put(d, 'qa/gates.json', JSON.stringify({ verdict: 'FAIL' }));
  fails(run(7, d), 'verdict is FAIL');
  d = project(); put(d, 'qa/gates.json', 'not json');
  fails(run(7, d), 'not valid JSON');
  d = project(); put(d, 'qa/gates.json', JSON.stringify({ verdict: 'UNVERIFIED' }));
  fails(run(7, d), 'UNVERIFIED');
  const ok = run(7, d, ['--allow-unverified']);
  assert.equal(ok.status, 0);
  assert.match(ok.stderr, /warning.*UNVERIFIED/);
  d = project(); put(d, 'qa/judge-round-2.md', '# Round 2\nverdict: FIX\n');
  fails(run(7, d), 'qa/judge-round-2.md', 'SHIP');
  d = project(); put(d, 'qa/judge-round-10.md', 'verdict: FIX\n'); // numeric order: 10 is highest
  fails(run(7, d), 'judge-round-10.md');
  d = project(); rmSync(join(d, 'qa/judge-round-1.md')); rmSync(join(d, 'qa/judge-round-2.md'));
  fails(run(7, d), 'no judge round');
});

test('phase 8: CP3 approval and README; autonomous needs no CP entry', () => {
  let d = project(); rmSync(join(d, 'README.md'));
  fails(run(8, d), 'README.md');
  d = project(); put(d, 'design/PROGRESS.md', get(d, 'design/PROGRESS.md').replace('### CP3 Acceptance', '### Acceptance'));
  fails(run(8, d), 'CP3');
  d = project(); put(d, 'design/PROGRESS.md', get(d, 'design/PROGRESS.md').replace('Approved with notes', '(open)'));
  fails(run(8, d), 'CP3', 'approval');
  d = project(); put(d, 'design/PROGRESS.md', get(d, 'design/PROGRESS.md').replace('Approved with notes', 'Auto-passed (autonomous)'));
  assert.equal(run(8, d).status, 0);
  d = project({ mode: 'autonomous' }); rmSync(join(d, 'design/PROGRESS.md'));
  assert.equal(run(8, d).status, 0);
});

test('an earlier phase failure is reported when checking a later phase, one line per problem', () => {
  const d = project(); rmSync(join(d, 'design/BRIEF.md')); rmSync(join(d, 'README.md'));
  const r = run(8, d);
  fails(r, 'phase 1: design/BRIEF.md', 'phase 8: README.md');
  assert.ok(r.stdout.split('\n').filter((l) => /^phase \d: \S/.test(l) && !l.includes('INCOMPLETE')).length >= 2);
});

test('phase 1: Site kind line is required and must be a known kind', () => {
  let d = project();
  put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace(/^Site kind:.*\n/m, ''));
  fails(run(1, d), 'Site kind:');
  d = project();
  put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace(/^Site kind:.*$/m, 'Site kind: blog'));
  fails(run(1, d), 'Site kind:');
});

test('phase 2: motion level must clear the floor for the site kind', () => {
  const d = project();
  put(d, 'design/BRIEF.md', get(d, 'design/BRIEF.md').replace(/^Site kind:.*$/m, 'Site kind: launch'));
  fails(run(2, d), 'below the floor of 2 for a launch site');
  put(d, 'design/DIRECTION.md', get(d, 'design/DIRECTION.md').replace(/^Motion:.*$/m, 'Motion: 2; the hero ground drifts, nothing else moves'));
  assert.equal(run(2, d).status, 0);
});

test('phase 7: qa/judge-unavailable.md stands in for a judge round, with a warning', () => {
  const d = project();
  for (const f of readdirSync(join(d, 'qa'))) if (/^judge-round-/.test(f)) rmSync(join(d, 'qa', f));
  fails(run(7, d), 'judge-unavailable.md');
  put(d, 'qa/judge-unavailable.md', 'No agent tool in this session.\n');
  const r = run(7, d);
  assert.equal(r.status, 0);
  assert.match(r.stderr, /accepted because qa\/judge-unavailable\.md/);
});

test('phase 2: an autonomous build needs no mockups', () => {
  const d = project({ tier: 'sketch', mode: 'autonomous' });
  rmSync(join(d, 'design/mockups'), { recursive: true, force: true });
  assert.equal(run(2, d).status, 0, run(2, d).stdout);
});
