export type EraId = "goldsrc" | "source" | "go" | "cs2";

export interface Era {
  id: EraId;
  act: string; // "ACT I"
  name: string; // "GOLDSRC"
  years: string; // "1999–2004"
  engine: string;
  title: string; // era display title, ≤3 words
  narrative: string; // ≤130 words, voice: documentary but playful
  births: string[]; // map slugs born in this era
  definingMoment: { year: string; text: string };
}

export interface TimelineEntry {
  year: string;
  text: string; // ≤20 words
}

export interface MapDossier {
  slug: string; // "dust2"
  file: string; // "de_dust2"
  name: string; // "Dust II"
  era: EraId; // birth era (drives data-world)
  birthYear: string;
  authors: string[];
  oneLiner: string; // ≤14 words, documentary but playful
  lineage: TimelineEntry[]; // 3–5 entries
  facts: { label: string; value: string }[]; // author/debut/games/reworks table
  callouts: { name: string; note: string }[]; // 3–5
  moments: { title: string; year: string; text: string }[]; // 2–3, text ≤35 words
  featured?: boolean; // Dust II spans 2 cols in the atlas
}
