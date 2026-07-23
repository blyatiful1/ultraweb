import { eras } from "@/lib/eras";
import { JourneyCompileSpine } from "@/components/sections/journey-compile-spine";
import { JourneyHero } from "@/components/sections/journey-hero";
import { JourneyStatsStrip } from "@/components/sections/journey-stats-strip";
import { JourneyAct } from "@/components/sections/journey-act";
import { JourneyAtlasTeaser } from "@/components/sections/journey-atlas-teaser";
import { JourneyCloser } from "@/components/sections/journey-closer";

// The Journey — the whole 1999→2026 story as one authored scroll. Hero, stats and
// the four era acts share THE COMPILE spine: the diorama pins as a backdrop and
// compiles wireframe→blockout→textured→lit while the acts pass. The spine is a
// "use client" boundary that keeps every section below it server-rendered, so the
// LCP is the hero headline, never the canvas. Acts alternate their text rail
// (left/right) and carry the era world; the atlas teaser and closer sit outside
// the spine, quiet neighbours after the signature ends.

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <JourneyCompileSpine>
        <JourneyHero />
        <JourneyStatsStrip />
        <JourneyAct era={eras[0]} side="left" id="act-i" />
        <JourneyAct era={eras[1]} side="right" id="act-ii" />
        <JourneyAct era={eras[2]} side="left" id="act-iii" />
        <JourneyAct era={eras[3]} side="right" id="act-iv" release />
      </JourneyCompileSpine>
      <JourneyAtlasTeaser />
      <JourneyCloser />
    </main>
  );
}
