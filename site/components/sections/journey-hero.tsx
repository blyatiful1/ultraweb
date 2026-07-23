import { Button } from "@/components/ui/button";

// Hero — typographic over the pinned Compile backdrop. The H1 is the LCP element:
// server-rendered, never mounted hidden, no JS motion. The subline, meta chrome
// and scroll cue enter via the CSS .animate-fade-up token (opt-in under
// no-preference, fully visible under reduced motion), so this stays a server
// component and the diorama can never be the first paint.

export function JourneyHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center"
    >
      {/* AA scrim: keeps the headline legible over the diorama linework, fades
          to transparent so the compiling geometry stays visible on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/70 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-6">
        <div className="max-w-[52rem]">
          {/* LCP: server-rendered headline — no entrance, never hidden */}
          <h1 id="hero-title" className="type-display text-6xl">
            The maps outlived every engine
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg text-muted-foreground">
            Three engines, twenty-seven years, nine maps. The history of
            Counter-Strike&rsquo;s levels, from a 1999 mod to Source&nbsp;2 —
            told as one scroll.
          </p>
          <p
            className="type-meta animate-fade-up mt-8"
            style={{ animationDelay: "120ms" }}
          >
            1999 — 2026 // 3 engines // 9 maps
          </p>
          <div
            className="animate-fade-up mt-10"
            style={{ animationDelay: "240ms" }}
          >
            <Button href="#stats" variant="ghost">
              Follow the compile
              <span aria-hidden className="ml-1 translate-y-px">
                ↓
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
