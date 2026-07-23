// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarAnubis({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Anubis: a central canal of water lanes splitting the map, the A site under Palace on the right, and the B site across the canal on the left."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Canal — parallel water lanes down the center */}
      <path d="M86 20 L86 180" />
      <path d="M100 20 L100 180" />
      <path d="M114 20 L114 180" />
      {/* A site, right */}
      <rect x="132" y="40" width="44" height="40" />
      {/* Palace — raised structure over A */}
      <path d="M150 36 L150 18 L182 18 L182 52" />
      {/* Connector into A */}
      <path d="M114 60 L132 60" />
      {/* B site, left */}
      <rect x="24" y="120" width="44" height="40" />
      {/* Stairs up to B */}
      <path d="M68 140 L86 140" />
      {/* Heaven perch on A */}
      <path d="M170 80 L170 104 L146 104" />
      {/* dashed mid crossing the canal */}
      <line x1="86" y1="100" x2="114" y2="100" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="146" y="49" width="16" height="16" rx="1" />
        <text x="154" y="57" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="38" y="129" width="16" height="16" rx="1" />
        <text x="46" y="137" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
