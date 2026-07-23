import type { Era } from "./types";

// Four era acts for the / journey scroll. Narratives ≤130 words each, voice:
// documentary but playful. Every date/name/number traces to design/RESEARCH.md.
export const eras: Era[] = [
  {
    id: "goldsrc",
    act: "ACT I",
    name: "GOLDSRC",
    years: "1999–2004",
    engine: "GoldSrc",
    title: "The First Draft",
    narrative:
      "On June 19, 1999, two modders — Minh “Gooseman” Le and Jess Cliffe — released a free Half-Life mod and quietly set the terms for the next quarter-century. GoldSrc was blocky, brown, and gloriously readable: a world you could parse at a glance while someone shot at you. Dave Johnston’s de_dust arrived with the beta; his Dust II followed in 2001, opening a second bombsite and, with it, the argument every match since has been about. Inferno and Nuke came up out of the same beta soup. When 1.6 shipped alongside Steam in September 2003, the grammar was set. Everything after is a rework.",
    births: ["dust2", "inferno", "nuke", "train"],
    definingMoment: {
      year: "2001",
      text: "Dave Johnston opens a second bombsite on Dust II. The map that would outlive every engine is born.",
    },
  },
  {
    id: "source",
    act: "ACT II",
    name: "SOURCE",
    years: "2004–2011",
    engine: "Source",
    title: "The Second Pass",
    narrative:
      "Counter-Strike: Source arrived November 1, 2004, dragging the war onto Valve’s new engine — real lighting, physics props, ragdolls that flopped where you shot them. Purists stayed on 1.6 for years; the mappers didn’t wait. Michael “BubkeZ” Hüll’s CPL tournament map matured into de_mirage across these versions. Salvatore “Volcano” Garozzo built de_cache from scratch and shipped its final Source cut in 2011. Neither was official yet — both were being quietly perfected in the community’s garage, waiting for a game that would take them seriously.",
    births: ["mirage", "cache"],
    definingMoment: {
      year: "2011",
      text: "Volcano ships de_cache’s final Source version — a community map good enough that Valve would later buy it outright.",
    },
  },
  {
    id: "go",
    act: "ACT III",
    name: "CS:GO",
    years: "2012–2023",
    engine: "Source",
    title: "The Sport Era",
    narrative:
      "Counter-Strike: Global Offensive launched August 21, 2012, and almost nobody flinched — a modest update. Then the Arms Deal, August 14, 2013, bolted skins and cases onto the game; the player base reportedly grew roughly sixfold, and an economy was born. Months earlier the first Valve Major, DreamHack Winter 2013, had crowned Fnatic in Sweden. The pool professionalized around it. Mirage went official in June 2013; Overpass became the first map built only for CS:GO that December. Cache and, later, Anubis crossed from the Workshop into Active Duty — the only community maps ever to. Ancient arrived in 2020 and ended Train’s long tenure. This was the decade Counter-Strike stopped being a game and became a job.",
    births: ["overpass", "anubis", "ancient"],
    definingMoment: {
      year: "2013",
      text: "Fnatic take DreamHack Winter, the first Valve-sponsored Major. Counter-Strike has a world title to fight over.",
    },
  },
  {
    id: "cs2",
    act: "ACT IV",
    name: "CS2",
    years: "2023–",
    engine: "Source 2",
    title: "Same War, Rebuilt",
    narrative:
      "On March 22, 2023, Valve announced Counter-Strike 2 on Source 2 and started a limited test the same day. By September 27 it had swallowed CS:GO whole — a free upgrade, no launcher, no going back. The pitch was engineering: sub-tick networking that registers actions the instant they happen, and volumetric smoke you can shoot a hole through. No new maps joined the canon; the old ones simply moved forward. Train came back November 13, 2024 — rainy, night-lit, Bombsite A pushed back, CT Heaven gone. Twenty-five years in, it’s the same war on the same corners, lit differently.",
    births: [],
    definingMoment: {
      year: "2024",
      text: "Train returns after three years away — rebuilt for Source 2, rainy and rearranged. The old maps aren’t retired; they’re recompiled.",
    },
  },
];

export interface Stat {
  value: string;
  label: string;
  frame: "ring" | "grid" | "crosshair" | "brackets";
}

// Framed Data row on / — figures drawn conservatively from design/RESEARCH.md.
export const stats: Stat[] = [
  { value: "27", label: "years of map history", frame: "ring" },
  { value: "9", label: "maps in the canon", frame: "grid" },
  { value: "3", label: "engines, one lineage", frame: "crosshair" },
  { value: "1.8M+", label: "peak concurrent players", frame: "brackets" },
];

export const getEra = (id: Era["id"]): Era | undefined =>
  eras.find((e) => e.id === id);
