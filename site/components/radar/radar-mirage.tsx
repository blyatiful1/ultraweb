// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarMirage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Mirage: an A site under Palace on the right, B apartments on the left, joined by a central mid lane past the window."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* A site, top-right */}
      <rect x="126" y="30" width="48" height="36" />
      {/* Palace — raised balcony over A */}
      <path d="M150 26 L150 12 L182 12 L182 40" />
      {/* Ramp up to A from the right */}
      <path d="M174 66 L186 90 L162 112" />
      {/* Connector / jungle into A */}
      <path d="M118 100 L128 66" />
      {/* B apartments, bottom-left */}
      <rect x="26" y="128" width="48" height="40" />
      {/* stairway into apartments */}
      <path d="M74 148 L98 148 L98 120" />
      {/* mid window room, center */}
      <rect x="90" y="86" width="24" height="24" />
      {/* dashed mid lane, corner to corner */}
      <line x1="30" y1="34" x2="176" y2="176" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="142" y="40" width="16" height="16" rx="1" />
        <text x="150" y="48" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="42" y="140" width="16" height="16" rx="1" />
        <text x="50" y="148" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
