import { stats } from "@/lib/eras";
import { StatFigure } from "./journey-stat";

// Framed Data row — quantify the legend. A compressed opaque band over the pinned
// diorama (survey-line rules top and bottom), tight after the hero's huge air.
// 2×2 on mobile, 4-up on desktop; nothing reorders.

export function JourneyStatsStrip() {
  return (
    <section
      id="stats"
      aria-labelledby="stats-title"
      className="relative border-y border-border bg-background/85 py-16 backdrop-blur-[2px]"
    >
      <h2 id="stats-title" className="sr-only">
        The legend in numbers
      </h2>
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {stats.map((stat) => (
            <StatFigure key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
