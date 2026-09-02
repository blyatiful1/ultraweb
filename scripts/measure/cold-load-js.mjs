// cold-load-js.mjs — the JavaScript a cold visitor actually downloads: reload to
// networkidle, then read the resource timings for scripts and module preloads. transferSize
// is over-the-wire (0 means served from cache — reload defeats that for same-session runs).
// Config keys read: waitUntil (default "networkidle"), theme.
// Returns: { url, viewport, theme, scripts:[{name,transferSize,encodedBodySize,initiatorType,duration}],
//            count, totalTransfer, totalEncoded, waitedFor, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: its stated first-load budget (the gate names the number in KB).
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

  let waitedFor = config.waitUntil || 'networkidle';
  try {
    await page.reload({ waitUntil: waitedFor, timeout: 45000 });
  } catch (e) {
    waitedFor = 'load (networkidle timed out)';
    try {
      await page.reload({ waitUntil: 'load', timeout: 45000 });
    } catch (e2) {
      waitedFor = 'reload failed';
    }
  }

  const data = await page
    .evaluate(() => {
      const cap = 500;
      let truncated = false;
      const scripts = [];
      let entries = [];
      try {
        entries = performance.getEntriesByType('resource') || [];
      } catch (e) {
        entries = [];
      }
      for (const e of entries) {
        if (scripts.length >= cap) {
          truncated = true;
          break;
        }
        const name = String(e.name || '');
        const isScript =
          e.initiatorType === 'script' ||
          /\.m?jsx?($|\?)/i.test(name.split('#')[0]) ||
          (e.initiatorType === 'link' && /\.m?js($|\?)/i.test(name.split('#')[0]));
        if (!isScript) continue;
        scripts.push({
          name: name.slice(0, 200),
          transferSize: e.transferSize || 0,
          encodedBodySize: e.encodedBodySize || 0,
          initiatorType: e.initiatorType || null,
          duration: Math.round(e.duration || 0),
        });
      }
      return {
        scripts,
        totalTransfer: scripts.reduce((n, s) => n + s.transferSize, 0),
        totalEncoded: scripts.reduce((n, s) => n + s.encodedBodySize, 0),
        truncated,
      };
    })
    .catch(() => ({ scripts: [], totalTransfer: 0, totalEncoded: 0, truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    scripts: data.scripts,
    count: data.scripts.length,
    totalTransfer: data.totalTransfer,
    totalEncoded: data.totalEncoded,
    waitedFor,
    truncated: !!data.truncated,
    ...(data.error ? { error: data.error } : {}),
  };
}
