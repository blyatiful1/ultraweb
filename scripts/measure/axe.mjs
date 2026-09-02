// axe.mjs — axe-core run over the live page for WCAG 2.0/2.1/2.2 A and AA. Loads the library
// from config.axePath when the project has it on disk (no network), else from the pinned CDN
// build; when neither works it reports the failure instead of a clean bill of health.
// Config keys read: axePath (absolute path to axe.min.js), axeUrl (override the CDN),
//                   tags (default wcag2a, wcag2aa, wcag22aa), theme.
// Returns: { url, viewport, theme, violations:[{id,impact,help,helpUrl,nodes:[{target,html}]}],
//            passes, incomplete, source:'path'|'cdn'|'page'|null, tags, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// source 'page' means axe was already loaded by the previous route — acceptable, record it as
// the source. The gate asserts: violations.length === 0. source === null means UNVERIFIED, not PASS.
async (page) => {
  const config =
    (await page
      .evaluate(() => {
        try {
          return window.__ultraweb && typeof window.__ultraweb === 'object' ? window.__ultraweb : {};
        } catch (e) {
          return {};
        }
      })
      .catch(() => ({}))) || {};

  const already = await page.evaluate(() => typeof window.axe !== 'undefined').catch(() => false);
  let source = already ? 'page' : null;
  let error = null;
  if (!source && config.axePath) {
    try {
      await page.addScriptTag({ path: config.axePath });
      source = 'path';
    } catch (e) {
      error = 'axePath failed: ' + String((e && e.message) || e).slice(0, 160);
    }
  }
  if (!source) {
    const url = config.axeUrl || 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
    try {
      await page.addScriptTag({ url });
      source = 'cdn';
      error = null;
    } catch (e) {
      error = (error ? error + ' | ' : '') + 'cdn failed: ' + String((e && e.message) || e).slice(0, 160);
    }
  }
  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  const tags = Array.isArray(config.tags) && config.tags.length ? config.tags : ['wcag2a', 'wcag2aa', 'wcag22aa'];
  if (!source) {
    return {
      url: page.url(),
      viewport,
      theme: config.theme || null,
      violations: [],
      passes: 0,
      incomplete: 0,
      source: null,
      tags,
      error: error || 'axe-core unavailable (no axePath, no network)',
      truncated: false,
    };
  }

  const data = await page
    .evaluate(
      (t) =>
        window.axe
          .run(document, { runOnly: { type: 'tag', values: t }, resultTypes: ['violations'] })
          .then((r) => {
            const cap = 500;
            const violations = r.violations.slice(0, cap).map((v) => ({
              id: v.id,
              impact: v.impact || null,
              help: String(v.help || '').slice(0, 160),
              helpUrl: String(v.helpUrl || '').slice(0, 200),
              nodes: (v.nodes || []).slice(0, 10).map((n) => ({
                target: (n.target || []).join(' ').slice(0, 200),
                html: String(n.html || '').replace(/\s+/g, ' ').slice(0, 200),
              })),
            }));
            return {
              violations,
              passes: (r.passes || []).length,
              incomplete: (r.incomplete || []).length,
              truncated: r.violations.length > cap,
            };
          })
          .catch((e) => ({ violations: [], passes: 0, incomplete: 0, truncated: false, error: String((e && e.message) || e).slice(0, 160) })),
      tags
    )
    .catch((e) => ({ violations: [], passes: 0, incomplete: 0, truncated: false, error: String((e && e.message) || e).slice(0, 160) }));

  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    violations: data.violations,
    passes: data.passes,
    incomplete: data.incomplete,
    source: data.error ? null : source, // a run that threw measured nothing — never green
    tags,
    truncated: !!data.truncated,
    ...(data.error ? { error: data.error } : {}),
  };
}
