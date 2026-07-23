import Link from "next/link";
import type { Era, MapDossier } from "@/lib/types";
import { getMap } from "@/lib/maps";
import { Reveal, Stagger, StaggerItem } from "./journey-reveal";

// One era act — a text rail floating over the pinned diorama, alternating side
// per act (page asymmetry). data-world re-maps the accent for the whole subtree
// (eyebrow, map links, corner ticks, defining-moment label) — surfaces untouched.
// Cluster budget: the eyebrow+title reveal and the birth-roster stagger are the
// only entrances; the narrative and defining-moment are body copy and stay still.

export function JourneyAct({
  era,
  side,
  id,
  release = false,
}: {
  era: Era;
  side: "left" | "right";
  id: string;
  release?: boolean;
}) {
  const births = era.births
    .map((slug) => getMap(slug))
    .filter((m): m is MapDossier => Boolean(m));

  return (
    <section
      id={id}
      data-world={era.id}
      aria-labelledby={`${id}-title`}
      className={`relative flex min-h-[100svh] items-center ${
        release ? "pt-40" : ""
      }`}
    >
      <div
        className={`flex w-full px-6 ${
          side === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <div className="corner-ticks relative w-full max-w-[36rem] border bg-background/80 p-8 backdrop-blur-[2px] sm:p-10">
          <Reveal>
            <p className="type-meta text-primary">
              {era.act} // {era.name} // {era.years}
            </p>
            <h2
              id={`${id}-title`}
              className="type-display mt-4 text-4xl md:text-5xl"
            >
              {era.title}
            </h2>
          </Reveal>

          {/* body copy — never animates */}
          <p className="mt-6 max-w-[62ch] text-base leading-[1.65] text-muted-foreground">
            {era.narrative}
          </p>

          {births.length > 0 ? (
            <div className="mt-8">
              <p className="type-meta">Born here</p>
              <Stagger className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {births.map((m) => (
                  <StaggerItem key={m.slug}>
                    <Link
                      href={`/maps/${m.slug}`}
                      className="font-mono text-sm uppercase tracking-[0.04em] text-foreground transition-[color] duration-[var(--dur-micro)] ease-out hover:text-primary"
                    >
                      {m.file}
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          ) : (
            <p className="type-meta mt-8">
              No new maps // the canon moved forward
            </p>
          )}

          <div className="mt-8 border-t border-border pt-5">
            <p className="type-meta text-primary">
              Defining moment // {era.definingMoment.year}
            </p>
            <p className="mt-2 max-w-[58ch] text-sm leading-[1.6] text-foreground">
              {era.definingMoment.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
