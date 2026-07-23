import type { MapDossier } from "@/lib/types";
import { sortedMaps } from "@/lib/atlas-order";
import { MapCard } from "@/components/sections/map-card";

// next-map — the closing prev/next pair. Order follows the atlas (sorted by
// first compile) and wraps around the nine so there is always a "keep reading"
// on both sides. Full-width band, base accent (no data-world — the neighbours
// belong to their own eras). The cards are the atlas MapCard, re-labelled.
export function DossierNext({ map }: { map: MapDossier }) {
  const i = sortedMaps.findIndex((m) => m.slug === map.slug);
  const count = sortedMaps.length;
  const prev = sortedMaps[(i - 1 + count) % count];
  const next = sortedMaps[(i + 1) % count];

  return (
    <section aria-labelledby="next-heading" className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-6 py-20">
        <h2
          id="next-heading"
          className="font-mono text-xs uppercase tracking-[0.06em] text-primary"
        >
          Keep reading
        </h2>
        <div className="mt-6 grid grid-cols-1 border-l border-t border-border md:grid-cols-2">
          <MapCard
            map={prev}
            eyebrow="Previous file"
            headingLevel="h3"
            className="border-b border-r border-border"
          />
          <MapCard
            map={next}
            eyebrow="Next file"
            headingLevel="h3"
            className="border-b border-r border-border"
          />
        </div>
      </div>
    </section>
  );
}
