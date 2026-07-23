import Link from "next/link";
import type { MapDossier } from "@/lib/types";
import { getMap } from "@/lib/maps";
import { getRadar } from "@/components/radar";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "./journey-reveal";

// Atlas teaser — the quiet neighbour after the signature ends. Three featured
// radar cards hand off to the archive. Contained grid (not a pinned split), so it
// reads as a distinct pattern from the acts above and the full-bleed closer below.

const FEATURED = ["dust2", "mirage", "inferno"] as const;

export function JourneyAtlasTeaser() {
  const cards = FEATURED.map((slug) => getMap(slug)).filter(
    (m): m is MapDossier => Boolean(m),
  );

  return (
    <section
      aria-labelledby="atlas-title"
      className="relative border-t border-border py-28"
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <Reveal>
          <p className="type-meta">The archive</p>
          <h2 id="atlas-title" className="type-display mt-3 text-4xl">
            Open the atlas
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-[1.65] text-muted-foreground">
            Nine maps, each with a full dossier — author, lineage, callouts, and
            the moments that made them matter. Start with the three everyone
            knows.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-3">
          {cards.map((m) => {
            const Radar = getRadar(m.slug);
            return (
              <StaggerItem key={m.slug}>
                <Link
                  href={`/maps/${m.slug}`}
                  className="corner-ticks group relative block border bg-card/40 p-5 transition-[border-color] duration-[var(--dur-micro)] ease-out hover:border-foreground/25"
                >
                  <div className="aspect-square w-full text-muted-foreground transition-[color] duration-[var(--dur-micro)] ease-out group-hover:text-foreground">
                    {Radar ? <Radar className="h-full w-full" /> : null}
                  </div>
                  <p className="type-display mt-5 text-2xl">{m.name}</p>
                  <p className="type-meta mt-1">
                    {m.file} // {m.birthYear}
                  </p>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mt-14" delay={0.06}>
          <Button href="/maps">Open the Atlas</Button>
        </Reveal>
      </div>
    </section>
  );
}
