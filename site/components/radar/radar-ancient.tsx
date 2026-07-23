// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarAncient({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Ancient: a T-shaped temple with the A site up the ramp on the right, the B site by the cave on the left, and a mid corridor down the spine."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* temple T — horizontal top bar */}
      <path d="M32 46 L168 46 L168 80 L32 80 Z" />
      {/* temple T — vertical spine (mid) */}
      <path d="M84 80 L84 172 L116 172 L116 80" />
      {/* A site — up the ramp, right arm */}
      <rect x="128" y="92" width="44" height="40" />
      <path d="M128 112 L116 112" />
      {/* B site — cave, left arm */}
      <rect x="28" y="92" width="44" height="40" />
      {/* Donut — ring cover on B */}
      <circle cx="50" cy="112" r="9" />
      {/* Cave mouth into B */}
      <path d="M72 112 L84 112" />
      {/* dashed mid down the spine */}
      <line x1="100" y1="80" x2="100" y2="172" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="142" y="104" width="16" height="16" rx="1" />
        <text x="150" y="112" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="94" y="104" width="16" height="16" rx="1" />
        <text x="102" y="112" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
