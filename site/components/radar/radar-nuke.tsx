// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarNuke({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Nuke: a central building holding two vertically stacked bombsites, drawn as an upper A square inset above a lower B square, with an outside flank."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* main building shell */}
      <rect x="58" y="42" width="84" height="116" />
      {/* upper A site — inset square (double-decker, top level) */}
      <rect x="74" y="56" width="52" height="42" />
      {/* lower B site — inset square directly below A (stacked) */}
      <rect x="74" y="106" width="52" height="42" />
      {/* Ramp — the long T-side climb, left */}
      <path d="M58 100 L26 100 L26 168 L88 168" />
      {/* Outside flank, right */}
      <path d="M142 78 L176 78 L176 150 L142 150" />
      {/* Heaven / vents drop between the two decks */}
      <path d="M100 98 L100 106" />
      {/* dashed divider — the floor between stacked sites */}
      <line x1="74" y1="102" x2="126" y2="102" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="92" y="69" width="16" height="16" rx="1" />
        <text x="100" y="77" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="92" y="119" width="16" height="16" rx="1" />
        <text x="100" y="127" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
