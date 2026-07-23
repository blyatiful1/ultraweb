import type { MapDossier } from "@/lib/types";
import { getRadar } from "@/components/radar";
import { Reveal } from "@/components/sections/journey-reveal";

// radar-dossier — the evidence wall. 5/7 split: radar SVG pinned in a
// corner-ticks panel on the left (5 cols, sticky) while the lineage timeline
// and facts table scroll on the right (7 cols). On mobile the radar leads,
// stacked and non-sticky. Calm level-1 motion: only the two section headings
// fade up once; the data itself never animates (SYSTEM.md §motion).
export function DossierRadar({ map }: { map: MapDossier }) {
  const Radar = getRadar(map.slug);

  return (
    <section
      data-world={map.era}
      aria-label="The evidence"
      className="border-b border-border"
    >
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-16 lg:grid-cols-12 lg:gap-12">
        {/* radar — sticky panel, 5 cols */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20">
            <figure className="corner-ticks relative isolate overflow-hidden border border-border bg-card p-6 sm:p-8">
              <div
                aria-hidden
                className="dev-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
              />
              <div className="mx-auto aspect-square w-full max-w-[340px] text-foreground/80">
                {Radar && <Radar className="h-full w-full" />}
              </div>
              <figcaption className="mt-6 border-t border-border pt-4 font-mono text-xs uppercase tracking-[0.06em] tabular-nums text-muted-foreground">
                radar
                <span aria-hidden className="mx-2 text-border">
                  //
                </span>
                {map.file}
              </figcaption>
            </figure>
          </div>
        </div>

        {/* lineage + facts, 7 cols */}
        <div className="space-y-14 lg:col-span-7">
          {/* lineage timeline — survey-line connectors, mono years */}
          <div>
            <Reveal>
              <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
                Lineage
              </h2>
            </Reveal>
            <ol className="mt-6">
              {map.lineage.map((entry) => (
                <li
                  key={`${entry.year}-${entry.text}`}
                  className="survey-line grid grid-cols-[6.5rem_1fr] gap-x-5 py-5 first:border-t-0 first:pt-0"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.06em] tabular-nums text-foreground">
                    {entry.year}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {entry.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* facts table — hairline rules, mono labels */}
          <div>
            <Reveal>
              <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
                The file
              </h2>
            </Reveal>
            <table className="mt-6 w-full border-collapse text-sm">
              <caption className="sr-only">
                Key facts for {map.name}: author, debut, reworks, and appearances.
              </caption>
              <tbody>
                {map.facts.map((fact) => (
                  <tr
                    key={fact.label}
                    className="border-t border-border first:border-t-0"
                  >
                    <th
                      scope="row"
                      className="w-[38%] py-3 pr-6 text-left align-top font-mono text-xs font-normal uppercase tracking-[0.06em] tabular-nums text-muted-foreground"
                    >
                      {fact.label}
                    </th>
                    <td className="py-3 text-left align-top tabular-nums text-foreground">
                      {fact.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
