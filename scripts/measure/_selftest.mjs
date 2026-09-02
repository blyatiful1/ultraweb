// _selftest.mjs — proves the measurement channel in Phase 0 preflight.
// Purpose: return {ok:true} from the far side of the Playwright MCP, so a failure here is
// a channel failure, never a gate failure.
// Call shape that works (verified 2026-09-02 against the fixture):
//   mcp__playwright__browser_navigate { url: "http://localhost:3100/" }
//   mcp__playwright__browser_run_code_unsafe { filename: "<plugin>/scripts/measure/_selftest.mjs" }
// The tool reads the file and evaluates it as `await (<file contents>)(page)`, so the file
// must be ONE expression: a leading // comment block, then `async (page) => { ... }` and
// nothing after it. `code` is ignored when `filename` is given. The file: protocol is
// blocked by the MCP server — serve the page over http.
// Config keys read: none (reports only whether window.__ultraweb was seeded).
// Returns: { ok, url, viewport, theme, configSeen, config, library,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: ok === true. A throw or ok !== true means the library is unavailable —
// record `measure-library: unavailable` and fall back to the gates' inline snippets.
async (page) => {
  let error = null;
  const config = await page
    .evaluate(() => {
      try {
        return window.__ultraweb && typeof window.__ultraweb === 'object' ? window.__ultraweb : null;
      } catch (e) {
        return null;
      }
    })
    .catch((e) => {
      error = 'evaluate failed: ' + String((e && e.message) || e).slice(0, 160);
      return null;
    });
  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    ok: error === null,
    url: page.url(),
    viewport,
    theme: (config && config.theme) || null,
    configSeen: config !== null,
    config: config || {},
    library: 'ultraweb/scripts/measure',
    ...(error ? { error } : {}),
  };
}
