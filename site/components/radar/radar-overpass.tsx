// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarOverpass({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Overpass: a canal of parallel water lanes along the bottom, a park with the B site above, and the A bombsite by the bathrooms on the right."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Park — B site area, upper-left */}
      <rect x="30" y="30" width="70" height="58" />
      {/* Fountain landmark in the park */}
      <circle cx="65" cy="59" r="9" />
      {/* Bathrooms + A bombsite, right */}
      <rect x="126" y="44" width="46" height="42" />
      <path d="M126 65 L108 65 L108 40" />
      {/* Connector — the pinch between halves */}
      <path d="M100 100 L126 100" />
      {/* Canal — parallel water lanes along the bottom */}
      <path d="M24 132 L176 132" />
      <path d="M24 150 L176 150" />
      <path d="M24 168 L176 168" />
      {/* Monster / pit under A */}
      <rect x="132" y="100" width="26" height="20" />
      {/* dashed mid down through connector */}
      <line x1="112" y1="88" x2="112" y2="128" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="140" y="53" width="16" height="16" rx="1" />
        <text x="148" y="61" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="82" y="42" width="16" height="16" rx="1" />
        <text x="90" y="50" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
