import type { ComponentType } from "react";
import { RadarDust2 } from "./radar-dust2";
import { RadarMirage } from "./radar-mirage";
import { RadarInferno } from "./radar-inferno";
import { RadarNuke } from "./radar-nuke";
import { RadarTrain } from "./radar-train";
import { RadarOverpass } from "./radar-overpass";
import { RadarCache } from "./radar-cache";
import { RadarAncient } from "./radar-ancient";
import { RadarAnubis } from "./radar-anubis";

export interface RadarProps {
  className?: string;
}

export type RadarComponent = ComponentType<RadarProps>;

// slug → radar component. Keys match MapDossier.slug in lib/maps.ts.
export const radars: Record<string, RadarComponent> = {
  dust2: RadarDust2,
  mirage: RadarMirage,
  inferno: RadarInferno,
  nuke: RadarNuke,
  train: RadarTrain,
  overpass: RadarOverpass,
  cache: RadarCache,
  ancient: RadarAncient,
  anubis: RadarAnubis,
};

export const getRadar = (slug: string): RadarComponent | undefined =>
  radars[slug];

export {
  RadarDust2,
  RadarMirage,
  RadarInferno,
  RadarNuke,
  RadarTrain,
  RadarOverpass,
  RadarCache,
  RadarAncient,
  RadarAnubis,
};
