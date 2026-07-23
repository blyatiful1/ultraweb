// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarCache({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Cache: three parallel lanes running top to bottom — the A site left, mid doors center, and the B site right."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* A lane — left */}
      <rect x="26" y="34" width="42" height="132" />
      {/* A site box */}
      <rect x="34" y="46" width="26" height="26" />
      {/* mid lane — center */}
      <rect x="82" y="34" width="36" height="132" />
      {/* Mid doors across the center lane */}
      <path d="M82 100 L118 100" />
      {/* B lane — right */}
      <rect x="132" y="34" width="42" height="132" />
      {/* B site box (Boiler) */}
      <rect x="140" y="128" width="26" height="26" />
      {/* Squeaky / Vents cross-connectors */}
      <path d="M68 70 L82 70" />
      <path d="M118 130 L132 130" />
      {/* dashed mid down the center lane */}
      <line x1="100" y1="34" x2="100" y2="166" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="39" y="51" width="16" height="16" rx="1" />
        <text x="47" y="59" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="145" y="133" width="16" height="16" rx="1" />
        <text x="153" y="141" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
