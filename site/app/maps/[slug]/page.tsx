import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMap, maps } from "@/lib/maps";
import { DossierHero } from "@/components/sections/dossier-hero";
import { DossierRadar } from "@/components/sections/dossier-radar";
import { DossierCallouts } from "@/components/sections/dossier-callouts";
import { DossierMoments } from "@/components/sections/dossier-moments";
import { DossierNext } from "@/components/sections/dossier-next";

// One template, nine dossiers — prerendered at build time.
export function generateStaticParams() {
  return maps.map((map) => ({ slug: map.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const map = getMap(slug);
  if (!map) {
    return { title: "Map not found" };
  }
  return {
    title: map.name,
    description: map.oneLiner,
  };
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const map = getMap(slug);
  if (!map) {
    notFound();
  }

  return (
    <main id="main" tabIndex={-1}>
      <DossierHero map={map} />
      <DossierRadar map={map} />
      <DossierCallouts map={map} />
      <DossierMoments map={map} />
      <DossierNext map={map} />
    </main>
  );
}
