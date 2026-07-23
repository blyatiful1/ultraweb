import type { MapDossier } from "@/lib/types";
import { Reveal } from "@/components/sections/journey-reveal";

// callouts — the map's spoken language. A mono tag grid: each callout is a
// HUD-style tag chip plus a one-line note. Narrow measure, tight rhythm.
export function DossierCallouts({ map }: { map: MapDossier }) {
  return (
    <section
      data-world={map.era}
      aria-labelledby="callouts-heading"
      className="border-b border-border"
    >
      <div className="mx-auto max-w-[860px] px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
            The vocabulary
          </p>
          <h2
            id="callouts-heading"
            className="type-display mt-3 text-3xl text-foreground"
          >
            Speak the language
          </h2>
        </Reveal>

        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {map.callouts.map((callout) => (
            <div
              key={callout.name}
              className="border-t border-border pt-4"
            >
              <dt>
                <span className="inline-flex items-center rounded-sm border border-border px-2.5 py-1 font-mono text-xs uppercase tracking-[0.06em] text-primary">
                  {callout.name}
                </span>
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {callout.note}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
