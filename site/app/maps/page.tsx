import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasGrid } from "@/components/sections/atlas-grid";
import { MapCard } from "@/components/sections/map-card";
import { Chip } from "@/components/ui/chip";
import { eraFilters, sortedMaps } from "@/lib/atlas-order";

export const metadata: Metadata = {
  title: "The Atlas",
  description:
    "The nine-map competitive canon of Counter-Strike, drawn as radar linework and sorted by first compile — from de_dust to de_anubis. Open any dossier.",
};

// Static, non-interactive twin of the atlas grid. It is what useSearchParams
// prerenders as the Suspense fallback, so the canonical /maps HTML always ships
// all nine dossier links (crawlable, and fully usable before JS). The client
// AtlasGrid hydrates over this identical markup — no swap, no layout jump.
function AtlasGridStatic() {
  return (
    <>
      <div
        role="group"
        aria-label="Filter maps by era"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1"
      >
        {eraFilters.map((f) => (
          <Chip key={f.id} pressed={f.id === "all"}>
            {f.label}
          </Chip>
        ))}
      </div>
      <ul
        className="mt-8 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3"
        aria-label={`${sortedMaps.length} maps`}
      >
        {sortedMaps.map((map) => (
          <li key={map.slug} className={map.featured ? "sm:col-span-2" : undefined}>
            <MapCard
              map={map}
              featured={map.featured}
              className="h-full border-b border-r border-border"
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function AtlasPage() {
  return (
    <main id="main" tabIndex={-1}>
      {/* atlas-header — narrow, tight */}
      <section className="mx-auto max-w-[760px] px-6 pt-24 pb-14 sm:pt-28">
        <p className="type-meta text-primary">Index // the archive</p>
        <h1 className="type-display mt-4 text-5xl text-foreground">
          The Atlas
        </h1>
        <p className="mt-6 max-w-[54ch] text-lg text-muted-foreground">
          Nine maps, four engines, one competitive canon — each drawn as the
          radar you already read in your head. Open a file to trace its whole
          life.
        </p>
        <p className="mt-8 font-mono text-xs tracking-[0.06em] tabular-nums text-muted-foreground">
          {sortedMaps.length} entries // sorted by first compile
        </p>
      </section>

      {/* atlas-grid — contained-wide; the grid IS the page */}
      <section aria-label="Map archive" className="mx-auto max-w-[1280px] px-6 pb-16">
        <Suspense fallback={<AtlasGridStatic />}>
          <AtlasGrid />
        </Suspense>
      </section>

      {/* atlas-footnote — one crafted mono line */}
      <section className="mx-auto max-w-[1280px] px-6 pb-28">
        <div className="survey-line" />
        <p className="mt-5 font-mono text-xs leading-relaxed tracking-[0.04em] text-muted-foreground">
          Curation is a feature. Vertigo, Office, and Italy sat this one out.{" "}
          <span className="text-primary">Vertigo fans: we know.</span>
        </p>
      </section>
    </main>
  );
}
