"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "motion/react";
import { Chip } from "@/components/ui/chip";
import { MapCard } from "@/components/sections/map-card";
import { dur, ease } from "@/lib/motion";
import {
  eraFilters,
  isEraFilter,
  sortedMaps,
  type EraFilter,
} from "@/lib/atlas-order";

// Client half of atlas-grid: the era chips write ?era= into the URL, the grid
// filters on that param and reflows via Motion layout. All nine cards are the
// canonical /maps HTML (rendered by the static fallback in page.tsx); this
// interactive copy hydrates over it, so the links stay crawler-visible.
export function AtlasGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const reduced = useReducedMotion();

  const raw = params.get("era");
  const active: EraFilter = isEraFilter(raw) ? raw : "all";

  const visible =
    active === "all"
      ? sortedMaps
      : sortedMaps.filter((map) => map.era === active);

  // Dust II only earns its second column in the full view; when a filter thins
  // the grid the span would just open a hole, so it collapses back to one cell.
  const spanFeatured = active === "all";

  const select = (id: EraFilter) => {
    const query = id === "all" ? pathname : `${pathname}?era=${id}`;
    router.replace(query, { scroll: false });
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        role="group"
        aria-label="Filter maps by era"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1"
      >
        {eraFilters.map((f) => (
          <Chip
            key={f.id}
            pressed={active === f.id}
            onClick={() => select(f.id)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {visible.length > 0 ? (
        <ul
          className="mt-8 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3"
          aria-label={`${visible.length} maps`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((map) => {
              const span = spanFeatured && map.featured;
              return (
                <m.li
                  key={map.slug}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          layout: { duration: dur.small, ease: ease.out },
                          opacity: { duration: dur.micro, ease: ease.out },
                        }
                  }
                  className={span ? "sm:col-span-2" : undefined}
                >
                  <MapCard
                    map={map}
                    featured={span}
                    className="h-full border-b border-r border-border"
                  />
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="mt-8 max-w-[52ch] border-l border-t border-b border-r border-border bg-background p-6 font-mono text-xs leading-relaxed tracking-[0.04em] text-muted-foreground">
          <span className="text-primary">// no entries</span>
          <br />
          No map in this canon debuted in the CS2 era — every one is a veteran,
          ported forward from an older engine.
        </p>
      )}
    </LazyMotion>
  );
}
