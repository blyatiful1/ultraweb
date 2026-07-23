import type { MetadataRoute } from "next";
import { maps } from "@/lib/maps";

const BASE_URL = "https://blockout-cs.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/maps`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const dossierRoutes: MetadataRoute.Sitemap = maps.map((m) => ({
    url: `${BASE_URL}/maps/${m.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...dossierRoutes];
}
