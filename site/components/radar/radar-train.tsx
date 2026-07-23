// Original simplified radar schematic — hand-drawn geometry, traced from no asset.
export function RadarTrain({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Simplified radar overview of Train: two rail yards, upper A and lower B, each drawn as rows of train-car rectangles between long platforms."
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* yard boundary */}
      <rect x="30" y="24" width="140" height="152" />
      {/* A yard — upper rows of train cars */}
      <rect x="50" y="42" width="40" height="16" />
      <rect x="98" y="42" width="40" height="16" />
      <rect x="50" y="66" width="40" height="16" />
      <rect x="98" y="66" width="40" height="16" />
      {/* B yard — lower rows of train cars */}
      <rect x="50" y="120" width="40" height="16" />
      <rect x="98" y="120" width="40" height="16" />
      <rect x="50" y="144" width="40" height="16" />
      <rect x="98" y="144" width="40" height="16" />
      {/* Popdog / Ivy — connectors on the left edge */}
      <path d="M30 92 L14 92 L14 108 L30 108" />
      {/* dashed central platform between the two yards */}
      <line x1="34" y1="100" x2="166" y2="100" strokeDasharray="4 5" />
      {/* accent site markers */}
      <g className="text-primary">
        <rect x="146" y="46" width="16" height="16" rx="1" />
        <text x="154" y="54" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">A</text>
        <rect x="146" y="124" width="16" height="16" rx="1" />
        <text x="154" y="132" fill="currentColor" stroke="none" className="font-mono" fontSize="11" fontWeight={600} textAnchor="middle" dominantBaseline="central">B</text>
      </g>
    </svg>
  );
}
