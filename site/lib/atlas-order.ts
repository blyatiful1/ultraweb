import type { EraId, MapDossier } from "./types";
import { maps } from "./maps";

// Derive an integer sort key from each map's (sometimes fuzzy) birth year.
// The value is used ONLY for ordering — it is never rendered, so the two
// UNVERIFIED/approximate years ("mid-2000s", "c. 2000") don't surface as claims.
const compileYear = (m: MapDossier): number => {
  if (m.birthYear.includes("mid-2000s")) return 2005;
  const match = m.birthYear.match(/\d{4}/);
  return match ? Number(match[0]) : 9999;
};

// SITEMAP.md count line: "sorted by first compile". Stable within a year, so
// ties fall back to lib/maps.ts declaration order.
export const sortedMaps: MapDossier[] = [...maps].sort(
  (a, b) => compileYear(a) - compileYear(b),
);

export type EraFilter = "all" | EraId;

// Chip row (SITEMAP.md /maps atlas-grid): ALL / GOLDSRC / SOURCE / GO / CS2.
// Labels are lower/mixed-case here; .type-meta and the Chip both uppercase in CSS.
export const eraFilters: { id: EraFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "goldsrc", label: "GoldSrc" },
  { id: "source", label: "Source" },
  { id: "go", label: "GO" },
  { id: "cs2", label: "CS2" },
];

const eraIds: readonly EraId[] = ["goldsrc", "source", "go", "cs2"];

export const isEraFilter = (v: string | null): v is EraFilter =>
  v === "all" || (v !== null && (eraIds as readonly string[]).includes(v));

// Human-facing era label for the card's top-left tag (uppercased by .type-meta).
export const eraLabel: Record<EraId, string> = {
  goldsrc: "GoldSrc",
  source: "Source",
  go: "CS:GO",
  cs2: "CS2",
};
