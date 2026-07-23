import Link from "next/link";
import type { MapDossier } from "@/lib/types";

// dossier-hero — the document header. Carries data-world so the whole file
// takes the map's birth-era accent (SITEMAP.md /maps/[slug] §1). Tight,
// document-like rhythm; the H1 is the page LCP, so nothing here mounts hidden.
export function DossierHero({ map }: { map: MapDossier }) {
  return (
    <section
      data-world={map.era}
      aria-labelledby="dossier-title"
      className="border-b border-border"
    >
      <div className="mx-auto max-w-[1280px] px-6 pt-24 pb-12 sm:pt-28">
        {/* file-path breadcrumb — the mono chrome that IS the decoration */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs uppercase tracking-[0.06em] tabular-nums text-muted-foreground">
            <li>{map.era}</li>
            <li aria-hidden className="text-border">
              /
            </li>
            <li>
              <Link
                href="/maps"
                className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
              >
                maps
              </Link>
            </li>
            <li aria-hidden className="text-border">
              /
            </li>
            <li className="text-foreground">
              <span aria-current="page">{map.file}.bsp</span>
            </li>
          </ol>
        </nav>

        <h1
          id="dossier-title"
          className="type-display mt-6 text-5xl text-foreground"
        >
          {map.name}
        </h1>

        <p className="mt-6 max-w-[46ch] text-balance text-xl leading-snug text-foreground/90">
          {map.oneLiner}
        </p>

        <p className="mt-6 font-mono text-xs uppercase tracking-[0.06em] tabular-nums text-muted-foreground">
          {map.authors.join(" · ")}
          <span aria-hidden className="mx-2 text-border">
            //
          </span>
          {map.birthYear}
        </p>
      </div>
    </section>
  );
}
