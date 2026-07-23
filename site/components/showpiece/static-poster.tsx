// The Compile — designed per-era SVG poster (static fallback).
// Renders an isometric linework diorama of a GENERIC bombsite (original composition,
// copied from no real map) that gains detail per era:
//   0 GoldSrc  → wireframe
//   1 Source   → filled orange dev-texture blockout
//   2 CS:GO    → shaded neutral faces (directional read)
//   3 CS2      → shaded + drifting smoke plume drawn as layered circles
// Pure presentational component (no hooks) — safe in server or client trees.
// Colors are token-driven: strokes/fills use currentColor; accent bits sit inside a
// `text-primary` group so they inherit the section's remapped --primary (era world).

type Era = 0 | 1 | 2 | 3;

const ERAS = [
  {
    act: "ACT I",
    name: "GOLDSRC",
    years: "1999–2004",
    stage: "WIREFRAME",
    narrative:
      "In 1999 Counter-Strike was a Half-Life mod, and its maps were gray boxes with ambition. Dave Johnston's Dust and Dust II, Chris Auty's Inferno, Jo Bieg's Nuke — the geometry that still decides rounds today was drafted here, on the GoldSrc engine, by teenagers with a compiler.",
  },
  {
    act: "ACT II",
    name: "SOURCE",
    years: "2004–2011",
    stage: "BLOCKOUT",
    narrative:
      "Counter-Strike: Source moved the same layouts onto Valve's Source engine in November 2004, smoothing the world without redrawing it. The blockout stayed sacred: prettier walls, identical angles — the orange dev-texture stage every mapper knows, geometry proven before a single texture is painted.",
  },
  {
    act: "ACT III",
    name: "CS:GO",
    years: "2012–2023",
    stage: "TEXTURED",
    narrative:
      "Global Offensive launched in August 2012 and, over thirteen years, turned these maps into a sport. The 2013 Arms Deal update seeded the skins economy; DreamHack Winter 2013 crowned the first Major. Dust II, Mirage and Inferno were relit and re-textured, their sightlines argued over frame by frame.",
  },
  {
    act: "ACT IV",
    name: "CS2",
    years: "2023–",
    stage: "LIT",
    narrative:
      "Counter-Strike 2 replaced CS:GO on Source 2 in September 2023, and the smoke finally became volumetric — a voxel cloud you can shoot a hole through. Twenty-plus years on, the bombsites are lit like cinema and still shaped like 1999. The war is the same; only the light changed.",
  },
] as const;

// ── isometric projection ────────────────────────────────────────────────────
const S = 34;
const OX = 400;
const OY = 348;
function proj(x: number, y: number, z: number): [number, number] {
  return [OX + (x - z) * S, OY + (x + z) * S * 0.5 - y * S * 0.62];
}
function poly(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

type Box = { cx: number; cy: number; cz: number; hw: number; hh: number; hd: number };

// Original generic A-site blockout: ground slab, back + side wall, raised site
// platform, three approach steps, stacked crates, a doorway arch. 16 boxes.
const BOXES: Box[] = [
  { cx: 0, cy: -0.15, cz: 0, hw: 4.6, hh: 0.15, hd: 4.4 }, // ground slab
  { cx: 0, cy: 1.05, cz: -4.0, hw: 4.6, hh: 1.2, hd: 0.22 }, // back wall
  { cx: -4.2, cy: 1.05, cz: -0.6, hw: 0.22, hh: 1.2, hd: 3.2 }, // side wall
  { cx: 1.6, cy: 0.35, cz: -1.4, hw: 2.0, hh: 0.35, hd: 1.6 }, // site platform
  { cx: -1.1, cy: 0.12, cz: -1.4, hw: 0.5, hh: 0.12, hd: 1.5 }, // step 1
  { cx: -0.2, cy: 0.24, cz: -1.4, hw: 0.5, hh: 0.24, hd: 1.5 }, // step 2
  { cx: 0.6, cy: 0.34, cz: -1.4, hw: 0.4, hh: 0.34, hd: 1.5 }, // step 3
  { cx: 1.2, cy: 0.92, cz: -1.7, hw: 0.44, hh: 0.44, hd: 0.44 }, // crate A
  { cx: 2.3, cy: 0.92, cz: -1.0, hw: 0.44, hh: 0.44, hd: 0.44 }, // crate B
  { cx: 2.3, cy: 1.78, cz: -1.0, hw: 0.4, hh: 0.42, hd: 0.4 }, // crate C (stacked)
  { cx: 0.5, cy: 0.86, cz: -0.5, hw: 0.4, hh: 0.4, hd: 0.4 }, // crate D
  { cx: -1.7, cy: 0.56, cz: 1.7, hw: 0.56, hh: 0.56, hd: 0.56 }, // front cover
  { cx: -1.7, cy: 1.48, cz: 1.7, hw: 0.5, hh: 0.4, hd: 0.5 }, // front cover (stacked)
  { cx: -1.5, cy: 0.9, cz: -3.2, hw: 0.22, hh: 0.9, hd: 0.22 }, // arch post L
  { cx: 0.2, cy: 0.9, cz: -3.2, hw: 0.22, hh: 0.9, hd: 0.22 }, // arch post R
  { cx: -0.65, cy: 1.96, cz: -3.2, hw: 1.05, hh: 0.22, hd: 0.22 }, // arch lintel
];

function faces(b: Box) {
  const x0 = b.cx - b.hw,
    x1 = b.cx + b.hw,
    y0 = b.cy - b.hh,
    y1 = b.cy + b.hh,
    z0 = b.cz - b.hd,
    z1 = b.cz + b.hd;
  return {
    top: [proj(x0, y1, z0), proj(x1, y1, z0), proj(x1, y1, z1), proj(x0, y1, z1)] as [number, number][],
    right: [proj(x1, y0, z0), proj(x1, y1, z0), proj(x1, y1, z1), proj(x1, y0, z1)] as [number, number][],
    left: [proj(x0, y0, z1), proj(x0, y1, z1), proj(x1, y1, z1), proj(x1, y0, z1)] as [number, number][],
    key: b.cx + b.cz,
    y: b.cy,
  };
}

// painter's order: farthest (smallest cx+cz) first, ties by height
const ORDERED = BOXES.map(faces).sort((a, b) => a.key - b.key || a.y - b.y);

export function StaticPoster({ era = 0, narrative }: { era?: Era | number; narrative?: string }) {
  const e = (Math.min(3, Math.max(0, Math.round(era))) as Era);
  const meta = ERAS[e];
  const wire = e === 0;
  const block = e === 1;
  const lit = e === 3;

  // face fill opacities per stage (top brightest → directional read)
  const fill = block
    ? { top: 0.22, right: 0.13, left: 0.07 }
    : e >= 2
      ? { top: e === 3 ? 0.2 : 0.16, right: 0.1, left: 0.05 }
      : { top: 0, right: 0, left: 0 };
  const stroke = wire ? 1.3 : 0.9;
  const strokeOpacity = wire ? 0.85 : 0.55;

  const alt = `Isometric blockout diorama of a generic Counter-Strike bombsite in its ${meta.name} ${meta.stage.toLowerCase()} stage: a raised A-site platform reached by steps, stacked crates, a doorway arch and perimeter walls, drawn as gray-box level geometry.`;

  const siteTop = proj(1.6, 0.7, -1.4); // A-marker anchor on the platform
  const plume = proj(1.6, 1.0, -1.6); // smoke origin

  return (
    <figure className="w-full text-foreground">
      <svg
        viewBox="0 0 800 640"
        className="block h-auto w-full"
        role="img"
        aria-label={alt}
      >
        <defs>
          {/* orange dev-texture grid, inherits currentColor from the text-primary group */}
          <pattern id="compile-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M16 0H0V16"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeOpacity="0.5"
            />
          </pattern>
          <linearGradient id="compile-key" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* faint ground grid to sell the dev-texture stage on blockout */}
        {block && (
          <g className="text-primary" opacity={0.5}>
            <polygon
              points={poly(faces(BOXES[0]).top)}
              fill="url(#compile-grid)"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeOpacity="0.4"
            />
          </g>
        )}

        {/* the diorama */}
        <g strokeLinejoin="round">
          {ORDERED.map((f, i) => {
            const faceFill = block ? "url(#compile-grid)" : "currentColor";
            const inPrimary = block; // blockout tints the whole solid in dev orange
            const group = (
              <g key={i} className={inPrimary ? "text-primary" : undefined}>
                {/* left (front) face */}
                <polygon
                  points={poly(f.left)}
                  fill={wire ? "none" : faceFill}
                  fillOpacity={wire ? 0 : fill.left}
                  stroke="currentColor"
                  strokeWidth={stroke}
                  strokeOpacity={strokeOpacity}
                />
                {/* right face */}
                <polygon
                  points={poly(f.right)}
                  fill={wire ? "none" : faceFill}
                  fillOpacity={wire ? 0 : fill.right}
                  stroke="currentColor"
                  strokeWidth={stroke}
                  strokeOpacity={strokeOpacity}
                />
                {/* top face */}
                <polygon
                  points={poly(f.top)}
                  fill={wire ? "none" : faceFill}
                  fillOpacity={wire ? 0 : fill.top}
                  stroke="currentColor"
                  strokeWidth={stroke}
                  strokeOpacity={strokeOpacity}
                />
                {/* lit stage: soft key-light wash on the top face */}
                {lit && (
                  <polygon points={poly(f.top)} fill="url(#compile-key)" stroke="none" />
                )}
              </g>
            );
            return group;
          })}
        </g>

        {/* A-site marker — radar bracket + letter, in the era accent */}
        <g className="text-primary">
          <circle
            cx={siteTop[0]}
            cy={siteTop[1]}
            r={17}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeOpacity={wire ? 0.7 : 0.9}
          />
          <path
            d={`M${siteTop[0] - 24} ${siteTop[1] - 24}h8M${siteTop[0] - 24} ${siteTop[1] - 24}v8
                M${siteTop[0] + 24} ${siteTop[1] + 24}h-8M${siteTop[0] + 24} ${siteTop[1] + 24}v-8`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.8"
          />
          <text
            x={siteTop[0]}
            y={siteTop[1] + 5}
            textAnchor="middle"
            fontSize="15"
            fontWeight="700"
            fill="currentColor"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            A
          </text>
        </g>

        {/* CS2 stage — cheap smoke plume as layered circles rising off the site */}
        {lit && (
          <g className="text-primary" style={{ mixBlendMode: "screen" }}>
            {[
              { dx: 0, dy: -18, r: 26, o: 0.22 },
              { dx: -10, dy: -46, r: 34, o: 0.17 },
              { dx: 8, dy: -74, r: 44, o: 0.13 },
              { dx: -6, dy: -104, r: 54, o: 0.09 },
              { dx: 4, dy: -138, r: 64, o: 0.06 },
              { dx: -2, dy: -176, r: 74, o: 0.035 },
            ].map((c, i) => (
              <circle
                key={i}
                cx={plume[0] + c.dx}
                cy={plume[1] + c.dy}
                r={c.r}
                fill="currentColor"
                fillOpacity={c.o}
              />
            ))}
          </g>
        )}
      </svg>

      <figcaption className="type-meta mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-primary">{meta.act}</span>
        <span aria-hidden="true">//</span>
        <span>{meta.name}</span>
        <span aria-hidden="true">//</span>
        <span>{meta.years}</span>
        <span aria-hidden="true">//</span>
        <span>{meta.stage}</span>
      </figcaption>

      {/* Narrative text-track: hidden for sighted no-preference users, revealed to
          screen readers and under prefers-reduced-motion. Carries the argument in
          words, not just a picture. */}
      <p className="sr-only motion-reduce:not-sr-only motion-reduce:mt-5 motion-reduce:block motion-reduce:max-w-[65ch] motion-reduce:text-base motion-reduce:leading-relaxed motion-reduce:text-muted-foreground">
        {narrative ?? meta.narrative}
      </p>
    </figure>
  );
}

export default StaticPoster;
