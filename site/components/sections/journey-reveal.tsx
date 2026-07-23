"use client";

// Reveal primitives for the Journey sections — the only entrance layer on /.
// Headlines and label clusters reveal; body paragraphs are passed as plain
// children and never wrapped. Durations/easings come from lib/motion.ts only;
// reduced motion collapses travel to an opacity fade (or nothing under the CSS
// layer). Entrances latch once and never un-reveal.
//
// Visibility is driven by a native IntersectionObserver (not motion's
// whileInView) so it is jump-proof: instant position changes — hash links from
// the footer (/#act-iii), Home/End/PageDown, browser back/forward scroll
// restoration, programmatic scrollTo — all fire the observer, whereas motion's
// viewport detection could leave content latched at opacity:0. A synchronous
// mount check additionally force-latches any element whose box is already at or
// above the viewport, covering arrival before the observer attaches (e.g. a hash
// in the URL on first load). Result: content NEVER stays hidden, however reached.

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { dur, ease } from "@/lib/motion";

// motion typing wants a mutable bezier tuple; lib/motion.ts exposes it `as const`.
const eOut = [...ease.out] as [number, number, number, number];

// -80px viewport margin from lib/motion.ts, expressed for the native observer.
const IO_MARGIN = "-80px";

// Once-latched in-view detector. Native IO fires on instant jumps; the mount
// check catches elements already on screen before the observer callback lands.
function useInViewOnce<T extends Element>(): {
  ref: RefObject<T | null>;
  visible: boolean;
} {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    // Force-latch anything at/above the current viewport (jump-proof mount check):
    // top edge above the viewport bottom => the box is already on or above screen.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (el.getBoundingClientRect().top < vh) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: IO_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return { ref, visible };
}

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
  const { ref, visible } = useInViewOnce<HTMLDivElement>();
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: 12 };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={visible ? shown : hidden}
      transition={{ duration: reduced ? dur.small : dur.section, ease: eOut, delay }}
    >
      {children}
    </motion.div>
  );
}

// Parent orchestrates a ≤6-item stagger; children inherit the variant. The same
// jump-proof latch flips the parent from "hidden" to "show".
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useInViewOnce<HTMLUListElement>();
  return (
    <motion.ul
      ref={ref}
      className={className}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
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
