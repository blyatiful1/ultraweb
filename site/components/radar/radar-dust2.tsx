// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarDust2({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Dust II: two bombsites connected by long corridors and a central mid lane."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Long A — the long corridor up the left side */}
      <path d="M34 178 L34 62 L72 62 L72 40" />
      {/* A site box, top-left */}
      <rect x="40" y="26" width="44" height="34" />
      {/* Catwalk — diagonal from mid to A */}
      <path d="M104 96 L84 58" />
      {/* Mid doors */}
      <path d="M100 94 L124 94" />
      {/* B tunnels — up from the bottom-right into B */}
      <path d="M156 180 L156 138 L134 118" />
      {/* B site box, right */}
      <rect x="128" y="92" width="46" height="34" />
      {/* CT approach, top-right */}
      <path d="M150 26 L150 60 L128 76" />
      {/* T spawn tunnel, bottom */}
      <path d="M78 178 L118 178" />
      {/* dashed mid lane, top to bottom */}
      <line x1="112" y1="18" x2="112" y2="182" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="54" y="35" width="16" height="16" rx="1" />
        <text x="62" y="43" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="143" y="101" width="16" height="16" rx="1" />
        <text x="151" y="109" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
