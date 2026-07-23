// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarInferno({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Inferno: a curved Banana choke rising to the B site on the left, and an Apartments route into the A site on the right."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Banana — the famous curved choke up to B */}
      <path d="M52 182 C40 150 44 118 74 104 C92 96 96 82 92 66" />
      {/* B site, top-left */}
      <rect x="60" y="30" width="46" height="36" />
      {/* Apartments — layered route into A, right */}
      <rect x="132" y="96" width="44" height="40" />
      <path d="M132 116 L110 116 L110 92" />
      {/* A site, upper-right */}
      <rect x="126" y="40" width="46" height="34" />
      {/* Arch into A */}
      <path d="M118 74 L118 92 L140 92" />
      {/* mid — from T toward the middle */}
      <path d="M118 182 L118 148" />
      {/* dashed mid lane */}
      <line x1="118" y1="146" x2="118" y2="74" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="75" y="40" width="16" height="16" rx="1" />
        <text x="83" y="48" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
        <rect x="141" y="49" width="16" height="16" rx="1" />
        <text x="149" y="57" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
      </g>
    </svg>
  );
}
