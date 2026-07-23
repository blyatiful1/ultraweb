import type { MapDossier } from "@/lib/types";
import { Reveal } from "@/components/sections/journey-reveal";

// moments — why the map mattered. Numbered editorial list: oversized mono
// numerals in the accent anchor each entry, H3 + a ≤35-word note, air between
// items (SITEMAP.md /maps/[slug] §4). No cards — hairline rules do the work.
export function DossierMoments({ map }: { map: MapDossier }) {
  return (
    <section
      data-world={map.era}
      aria-labelledby="moments-heading"
      className="border-b border-border"
    >
      <div className="mx-auto max-w-[860px] px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
            The record
          </p>
          <h2
            id="moments-heading"
            className="type-display mt-3 text-3xl text-foreground"
          >
            Why it mattered
          </h2>
        </Reveal>

        <ol className="mt-12">
          {map.moments.map((moment, i) => (
            <li
              key={moment.title}
              className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-border py-8 first:border-t-0 first:pt-0 sm:gap-x-8"
            >
              <span
                aria-hidden
                className="type-display text-3xl leading-none tabular-nums text-primary sm:text-4xl"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {moment.title}
                  <span className="ml-3 font-mono text-xs font-normal uppercase tracking-[0.06em] tabular-nums text-muted-foreground">
                    {moment.year}
                  </span>
                </h3>
                <p className="mt-3 max-w-[58ch] leading-relaxed text-muted-foreground">
                  {moment.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
