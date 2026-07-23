import Link from "next/link";
import type { MapDossier } from "@/lib/types";
import { eraLabel } from "@/lib/atlas-order";
import { getRadar } from "@/components/radar";

const cn = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

interface MapCardProps {
  map: MapDossier;
  /** When true, lay the radar beside the copy (used for the Dust II 2-col span). */
  featured?: boolean;
  /** Overrides the era tag in the top-left corner — e.g. "Previous" / "Next" for the dossier pair. */
  eyebrow?: string;
  /** Heading tag so the card fits its host page's outline. Atlas uses h2; dossier prev/next uses h3. */
  headingLevel?: "h2" | "h3";
  /** Border treatment is a host concern (exposed grid rules vs. a full-bordered pair). */
  className?: string;
}

// The whole card is one link (SITEMAP.md /maps atlas-grid). At rest the radar
// linework sits at 55% foreground; on hover/focus it lifts to the accent and the
// two crosshair corner-ticks fade in — a 180ms colour+opacity micro, CSS only.
export function MapCard({
  map,
  featured = false,
  eyebrow,
  headingLevel = "h2",
  className,
}: MapCardProps) {
  const Radar = getRadar(map.slug);
  const Heading = headingLevel;

  return (
    <article
      className={cn(
        "group/card relative isolate flex h-full flex-col justify-between bg-background p-5 sm:p-6",
        "@container/card",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background",
        className,
      )}
    >
      {/* corner-ticks — the radar/HUD bracket, revealed on hover + keyboard focus */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-primary opacity-0 transition-opacity duration-[var(--dur-micro)] ease-[var(--ease-out)] group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:transition-none"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-primary opacity-0 transition-opacity duration-[var(--dur-micro)] ease-[var(--ease-out)] group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:transition-none"
      />

      <div className="flex items-start justify-between gap-4">
        <span className="type-meta">{eyebrow ?? eraLabel[map.era]}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {map.birthYear}
        </span>
      </div>

      <div
        className={cn(
          "mt-6 flex gap-5",
          featured
            ? "flex-col @md/card:flex-row @md/card:items-center @md/card:gap-8"
            : "flex-col",
        )}
      >
        <div className={featured ? "@md/card:w-1/2" : undefined}>
          {Radar && (
            <div
              className={cn(
                "mx-auto aspect-square w-full max-w-[200px]",
                featured && "@md/card:max-w-[260px]",
                "text-foreground/55 transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out)]",
                "group-hover/card:text-primary group-focus-within/card:text-primary motion-reduce:transition-none",
              )}
            >
              <Radar className="h-full w-full" />
            </div>
          )}
        </div>

        <div className={featured ? "@md/card:w-1/2" : undefined}>
          <Heading>
            <Link
              href={`/maps/${map.slug}`}
              className="type-display text-2xl text-foreground outline-none after:absolute after:inset-0 after:content-['']"
            >
              {map.name}
            </Link>
          </Heading>
          <p className="mt-3 font-mono text-xs tracking-[0.06em] tabular-nums text-muted-foreground">
            {map.file} // {map.birthYear} // {map.era}
          </p>
          {featured && (
            <p className="mt-4 hidden max-w-[42ch] text-sm text-muted-foreground @md/card:block">
              {map.oneLiner}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
