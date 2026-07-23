import { Button } from "@/components/ui/button";
import { Reveal } from "./journey-reveal";

// Closer — full-bleed sign-off, the ask and nothing else. Double space before it;
// a faint dev-grid ground and mono grid-coordinate chrome frame the one line the
// whole scroll has been building toward.

export function JourneyCloser() {
  return (
    <section
      aria-labelledby="closer-title"
      className="relative scroll-mt-14 overflow-hidden border-t border-border"
    >
      <div
        aria-hidden
        className="dev-grid pointer-events-none absolute inset-0 opacity-[0.05]"
      />
      <div className="relative mx-auto max-w-[1280px] px-6 pt-[calc(3.5rem+10rem)] pb-40 text-center">
        <Reveal>
          <p className="type-meta">{"// end of file"}</p>
          <h2
            id="closer-title"
            className="mx-auto mt-6 max-w-[26ch] text-2xl leading-snug text-balance text-foreground md:text-3xl"
          >
            Twenty-five years later, the double doors on Long&nbsp;A still open
            the same way. Nobody would dare touch them.
          </h2>
          <p className="type-meta mt-8">de_dust2 // grid 034,178 // long a</p>
        </Reveal>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button href="/maps">Open the Atlas</Button>
          <Button href="/maps/dust2" variant="ghost">
            Start with Dust&nbsp;II
          </Button>
        </div>
      </div>
    </section>
  );
}
