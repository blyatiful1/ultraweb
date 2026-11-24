// slop-patterns.mjs — the one pattern list shared by hooks/antislop.mjs (write time)
// and scripts/site-check.mjs (whole tree). Dependency-free.
//
// HARD: direction-independent defects. The hook blocks on them, site-check fails on them.
// SOFT: style tells. Whether they are wrong depends on design/DIRECTION.md, so only
// site-check reports them, as warnings. Never move a SOFT pattern into HARD.

export const HARD = [
  { id: 'lorem-ipsum', re: /\blorem\s+ipsum\b/i, label: 'lorem ipsum placeholder text' },
  {
    id: 'placeholder-copy',
    re: /\byour\s+(?:company|brand|business|logo|headline|tagline|text|title)\s+here\b|\bcompany\s+name\s+here\b/i,
    label: 'template placeholder copy',
  },
  { id: 'feature-n', re: />\s*Feature\s+\d+\s*<|(["'`])Feature\s+\d+\1/i, label: 'stock "Feature N" copy' },
  {
    id: 'placeholder-image',
    re: /\b(?:via\.)?placeholder\.com\b|\bplacehold\.(?:co|it|jp)\b|\bdummyimage\.com\b|\bfakeimg\.pl\b|\bpicsum\.photos\b|\bplacekitten\.com\b|\bplaceimg\.com\b|\bloremflickr\.com\b|\bsource\.unsplash\.com\/random\b/i,
    label: 'placeholder image service',
  },
  {
    id: 'dead-hash-link',
    // href="#", href='#', href={"#"}, href={'#'}, href={`#`}, href=# (unquoted HTML)
    re: /\bhref\s*=\s*(?:(["'])#\1|\{\s*(["'`])#\2\s*\}|#(?=[\s>/]))/,
    label: 'dead "#" link',
  },
  {
    id: 'fake-rating',
    re: /(?:★\s*){5}|(?:⭐️?\s*){5}/u,
    label: 'hard-coded five-star rating',
  },
  {
    id: 'fake-attribution',
    re: /\b(?:john|jane)\s+(?:doe\b|d\.)|(?:^|[>"'`]\s*)(?:a\s+)?(?:happy|satisfied|verified)\s+(?:customer|client|user)\s*(?:[<"'`]|$)/im,
    label: 'fabricated-proof attribution',
  },
];

export const SOFT = [
  { id: 'purple-blue-gradient', re: /from-(?:purple|violet|fuchsia)-\d+.*to-(?:blue|indigo|violet)-\d+/, label: 'purple-to-blue gradient' },
  {
    id: 'gradient-text',
    re: /bg-clip-text.*text-transparent.*bg-gradient|bg-gradient.*bg-clip-text.*text-transparent/,
    label: 'gradient headline text',
  },
  {
    id: 'startup-copy',
    re: /\b(?:elevate\s+your|unlock\s+the\s+power|empower\s+your|welcome\s+to\s+our|seamlessly\s+integrat\w*|supercharge\s+your)\b/i,
    label: 'stock startup phrasing',
  },
  { id: 'emoji-copy', re: /[✨🚀🎉🔥💡]/u, label: 'emoji in copy' },
];

export const UNVERIFIED_PROOF = 'UNVERIFIED-PROOF';

// Deployment mode from design/BRIEF.md: exactly one well-formed line, otherwise production.
export function deploymentMode(briefText) {
  const text = briefText ?? '';
  const raw = (text.match(/^Deployment mode:/gim) || []).length;
  const valid = [...text.matchAll(/^Deployment mode:[ \t]*(production|staging|demo)[ \t]*$/gim)].map((m) => m[1].toLowerCase());
  if (raw === 1 && valid.length === 1) return { mode: valid[0], wellFormed: true, raw };
  return { mode: 'production', wellFormed: false, raw };
}

// Scan text; returns [{id, label, line}] with 1-based line numbers relative to the text.
export function scan(text, patterns = HARD) {
  const hits = [];
  for (const p of patterns) {
    const re = new RegExp(p.re.source, p.re.flags.replace('g', ''));
    const m = re.exec(text);
    if (m) hits.push({ id: p.id, label: p.label, line: text.slice(0, m.index).split('\n').length });
  }
  return hits;
}
