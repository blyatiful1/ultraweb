// font-requests.mjs — what the page pays for type: every font file the browser fetched, plus
// the FontFace objects the document ended up with. A face with status 'error' is a face the
// visitor never sees; a long list is a subsetting or a next/font problem.
// Config keys read: none (theme is echoed from the config when present).
// Returns: { url, viewport, theme, fonts:[{name,transferSize,encodedBodySize,duration,initiatorType}],
//            faces:[{family,weight,style,status,unicodeRange}], count, faceCount, totalTransfer,
//            errored:[family], truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: its stated font budget and no face with status 'error'.
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

  const data = await page
    .evaluate(() => {
      const cap = 500;
      let truncated = false;
      const FONT = /\.(woff2|woff|ttf|otf|eot)($|\?)/i;
      const fonts = [];
      let entries = [];
      try {
        entries = performance.getEntriesByType('resource') || [];
      } catch (e) {
        entries = [];
      }
      for (const e of entries) {
        if (fonts.length >= cap) {
          truncated = true;
          break;
        }
        const name = String(e.name || '');
        const isFont = e.initiatorType === 'font' || FONT.test(name.split('#')[0]) || (e.initiatorType === 'css' && FONT.test(name.split('#')[0]));
        if (!isFont) continue;
        fonts.push({
          name: name.slice(0, 200),
          transferSize: e.transferSize || 0,
          encodedBodySize: e.encodedBodySize || 0,
          duration: Math.round(e.duration || 0),
          initiatorType: e.initiatorType || null,
        });
      }
      const faces = [];
      try {
        document.fonts.forEach((f) => {
          if (faces.length >= cap) {
            truncated = true;
            return;
          }
          faces.push({
            family: String(f.family || '').slice(0, 80),
            weight: String(f.weight || ''),
            style: String(f.style || ''),
            status: String(f.status || ''),
            unicodeRange: String(f.unicodeRange || '').slice(0, 60),
          });
        });
      } catch (e) {
        /* a document with no FontFaceSet reports no faces */
      }
      return {
        fonts,
        faces,
        totalTransfer: fonts.reduce((n, f) => n + f.transferSize, 0),
        errored: faces.filter((f) => f.status === 'error').map((f) => f.family),
        truncated,
      };
    })
    .catch(() => ({ fonts: [], faces: [], totalTransfer: 0, errored: [], truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return {
    url: page.url(),
    viewport,
    theme: config.theme || null,
    fonts: data.fonts,
    faces: data.faces,
    count: data.fonts.length,
    faceCount: data.faces.length,
    totalTransfer: data.totalTransfer,
    errored: data.errored,
    truncated: !!data.truncated,
    ...(data.error ? { error: data.error } : {}),
  };
}
