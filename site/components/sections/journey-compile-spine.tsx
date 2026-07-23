"use client";

// THE COMPILE spine — the "use client" boundary that pins the diorama while the
// hero, stats and four acts scroll past it. Its children (all server components)
// stay server-rendered: the LCP headline paints from HTML first, three.js never
// enters the shared bundle. The diorama is a decorative backdrop — the acts carry
// the full narrative in the DOM, so the pinned canvas is aria-hidden and native
// scroll stays authoritative (useScroll only reads position, never hijacks it).

import { useRef } from "react";
import type { ReactNode } from "react";
import { useScroll } from "motion/react";
import { Showpiece, ShowpiecePin } from "@/components/showpiece";

export function JourneyCompileSpine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className="relative">
      {/* pinned backdrop: full spine height, sticky diorama inside */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <ShowpiecePin>
          <Showpiece progress={scrollYProgress} />
        </ShowpiecePin>
      </div>
      {/* scrolling content sits above the diorama; only its panels are opaque */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
