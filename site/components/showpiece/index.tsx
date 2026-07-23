"use client";

// The Compile — showpiece mount point (the site's ONE signature element).
// The heavy R3F scene is code-split behind next/dynamic ssr:false so three.js never
// lands in the shared bundle and the diorama can never be the LCP element; the hero
// headline paints from server HTML first. Three exits are wired:
//   • prefers-reduced-motion → StaticPoster (matchMedia via useReducedMotion)
//   • pre-hydration / no-JS   → StaticPoster (the loading + not-mounted state)
//   • no-WebGL / offscreen    → handled inside scene.tsx
// Every state renders the designed poster, so there is never a blank frame.

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import type { MotionValue } from "motion/react";
import type { EraId } from "@/lib/types";
import { StaticPoster } from "./static-poster";

const Scene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => <StaticPoster era={0} />,
});

// SSR-safe "is this the client?" flag without a setState-in-effect: the server snapshot
// is false, the client snapshot is true, and the store never changes after hydration.
const emptySubscribe = () => () => {};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function eraFromProgress(p: number | MotionValue<number>): number {
  const v = typeof p === "number" ? p : p.get();
  return clamp(Math.floor(v * 4), 0, 3);
}

// The poster/fallback paths render from React state, so the era bucket must be
// a subscription, not a render-time .get() — otherwise reduced-motion and
// no-WebGL users stay frozen on the mount-time era for the whole journey.
function useEraIndex(progress: number | MotionValue<number>, era?: number) {
  const [idx, setIdx] = useState(() => era ?? eraFromProgress(progress));
  useEffect(() => {
    if (era !== undefined || typeof progress === "number") return;
    return progress.on("change", (v) => {
      const next = clamp(Math.floor(v * 4), 0, 3);
      setIdx((prev) => (prev === next ? prev : next));
    });
  }, [progress, era]);
  return era ?? idx;
}

export type ShowpieceProps = {
  /** Journey scroll progress 0..1 — a Motion scroll value or a plain number. */
  progress: number | MotionValue<number>;
  /** Current act (0..3). If omitted it is derived from `progress`. */
  era?: number;
  /** sr-only narrative for this act (BFSG text-track); falls back to per-era copy. */
  narrative?: string;
};

export function Showpiece({ progress, era, narrative }: ShowpieceProps) {
  const reduced = useReducedMotion();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const eraIdx = useEraIndex(progress, era);

  // Server render + first client render + reduced-motion all show the poster:
  // identical markup on both sides (no hydration mismatch), and the canvas is
  // never the first paint.
  if (!mounted || reduced) {
    return <StaticPoster era={eraIdx} narrative={narrative} />;
  }

  return <Scene progress={progress} era={eraIdx} narrative={narrative} />;
}

/**
 * ShowpiecePin — sticky rail the journey page wraps its acts around so the diorama
 * holds the viewport while the era text scrolls past it (the persistent hero object).
 * Native `position: sticky` only — it never hijacks scroll. Set `world` to re-map the
 * era accent for the pinned poster/scene subtree.
 */
export function ShowpiecePin({
  children,
  world,
  className,
}: {
  children: React.ReactNode;
  world?: EraId;
  className?: string;
}) {
  return (
    <div
      data-world={world}
      className={`sticky top-0 flex h-[100svh] items-center justify-center ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export default Showpiece;
