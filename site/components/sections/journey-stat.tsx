"use client";

// One Framed-Data figure: a real DOM number counting up inside a radar-style SVG
// frame. The whole cell carries a single accessible name (value + label) via
// role="img" so a screen reader never hears partial counts. Count-up fires once
// on first view; under reduced motion (or no-JS) the final value is already
// rendered. Frame strokes are token-driven — border hairlines + text-primary
// accents that inherit the section's era world.

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { dur } from "@/lib/motion";
import type { Stat } from "@/lib/eras";

function parse(value: string) {
  const m = value.match(/^([\d.,]+)(.*)$/);
  if (!m) return { target: 0, decimals: 0, suffix: value };
  const numStr = m[1];
  const target = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { target, decimals, suffix: m[2] };
}

function Frame({ kind }: { kind: Stat["frame"] }) {
  const common = {
    viewBox: "0 0 100 100",
    fill: "none",
    stroke: "currentColor",
    className: "absolute inset-0 h-full w-full text-border",
    "aria-hidden": true,
  } as const;

  if (kind === "ring") {
    return (
      <svg {...common} strokeWidth={1}>
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="38" strokeDasharray="2 4" opacity={0.7} />
        <g className="text-primary" strokeWidth={1.5}>
          <line x1="50" y1="2" x2="50" y2="10" />
          <line x1="50" y1="90" x2="50" y2="98" />
          <line x1="2" y1="50" x2="10" y2="50" />
          <line x1="90" y1="50" x2="98" y2="50" />
        </g>
      </svg>
    );
  }
  if (kind === "grid") {
    return (
      <svg {...common} strokeWidth={1}>
        <rect x="4" y="4" width="92" height="92" />
        <line x1="35" y1="4" x2="35" y2="96" opacity={0.5} />
        <line x1="65" y1="4" x2="65" y2="96" opacity={0.5} />
        <line x1="4" y1="35" x2="96" y2="35" opacity={0.5} />
        <line x1="4" y1="65" x2="96" y2="65" opacity={0.5} />
        <g className="text-primary" strokeWidth={1.5}>
          <path d="M4 20 L4 4 L20 4" />
          <path d="M96 80 L96 96 L80 96" />
        </g>
      </svg>
    );
  }
  if (kind === "crosshair") {
    return (
      <svg {...common} strokeWidth={1}>
        <circle cx="50" cy="50" r="44" opacity={0.6} />
        <g className="text-primary" strokeWidth={1.5}>
          <line x1="50" y1="6" x2="50" y2="30" />
          <line x1="50" y1="70" x2="50" y2="94" />
          <line x1="6" y1="50" x2="30" y2="50" />
          <line x1="70" y1="50" x2="94" y2="50" />
        </g>
      </svg>
    );
  }
  // brackets
  return (
    <svg {...common} strokeWidth={1.5}>
      <g className="text-primary">
        <path d="M4 26 L4 4 L26 4" />
        <path d="M74 4 L96 4 L96 26" />
        <path d="M96 74 L96 96 L74 96" />
        <path d="M26 96 L4 96 L4 74" />
      </g>
      <line x1="50" y1="4" x2="50" y2="96" strokeWidth={1} strokeDasharray="2 5" opacity={0.4} />
    </svg>
  );
}

export function StatFigure({ stat }: { stat: Stat }) {
  const { target, decimals, suffix } = parse(stat.value);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(
    () => target.toFixed(decimals) + suffix,
  );

  // SSR/no-JS/reduced-motion show the final value; motion users get reset to 0
  // at mount — off-screen, before the count-up — so the figure never flashes
  // final → 0 as it enters view.
  useEffect(() => {
    if (reduced === false) setDisplay((0).toFixed(decimals) + suffix);
  }, [reduced, decimals, suffix]);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now();
    const ms = dur.section * 1000;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay((target * eased).toFixed(decimals) + suffix);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, target, decimals, suffix]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${stat.value}, ${stat.label}`}
      className="flex flex-col items-center"
    >
      <div aria-hidden className="relative grid aspect-square w-32 place-items-center sm:w-36">
        <Frame kind={stat.frame} />
        <span className="type-display text-3xl tabular-nums sm:text-4xl">
          {display}
        </span>
      </div>
      <p aria-hidden className="type-meta mt-4 max-w-[16ch] text-center">
        {stat.label}
      </p>
    </div>
  );
}
