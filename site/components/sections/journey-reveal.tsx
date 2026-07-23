"use client";

// Reveal primitives for the Journey sections — the only entrance layer on /.
// Headlines and label clusters reveal; body paragraphs are passed as plain
// children and never wrapped. Durations/easings come from lib/motion.ts only;
// reduced motion collapses travel to an opacity fade (or nothing under the CSS
// layer). whileInView is always once:true.

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { dur, ease } from "@/lib/motion";

// motion typing wants a mutable bezier tuple; lib/motion.ts exposes it `as const`.
const eOut = [...ease.out] as [number, number, number, number];

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduced ? dur.small : dur.section, ease: eOut, delay }}
    >
      {children}
    </motion.div>
  );
}

// Parent orchestrates a ≤6-item stagger; children inherit the variant.
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {children}
    </motion.ul>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      className={className}
      variants={
        reduced
          ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
          : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }
      }
      transition={{ duration: dur.small, ease: eOut }}
    >
      {children}
    </motion.li>
  );
}
