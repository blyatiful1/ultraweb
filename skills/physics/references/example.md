## Worked example — Framewalk, cursor-reactive hero fog for a Steam launch

design/DIRECTION.md motion stance: *"Atmospheric Dark — the fog answers the hand. One interactive moment, everything else holds still; static art under reduced motion."* The signature move (three-layer parallax fog) is the whole physics budget — no other element gets a spring.

Each fog layer lags the pointer with the **Trailing** recipe (`stiffness 180, damping 18, mass 1`), pulling a different distance so depth reads as parallax — back 8px, mid 20px, front 40px. One spring drives all three via `useTransform`; the constant lives in `lib/motion.ts` beside the easing tokens.

```tsx
"use client";
import { m, useSpring, useTransform } from "motion/react";
import { fogTrail } from "@/lib/motion"; // { stiffness: 180, damping: 18, mass: 1 }

const px = useSpring(0, fogTrail); // -1..1 from pointer, mounted only under (pointer: fine)
const back  = useTransform(px, [-1, 1], [-8, 8]);
const mid   = useTransform(px, [-1, 1], [-20, 20]);
const front = useTransform(px, [-1, 1], [-40, 40]);
```

No drag anywhere on the site, so `domAnimation` (+15kb) carries it — loading `domMax` for a hover-only effect would be dead weight (STACK.md). Under `prefers-reduced-motion` the layers render as flat art; on touch/coarse pointers the fog never mounts the springs.

Rejected: a magnetic "Wishlist on Steam" button. One physics moment is the budget, and a bouncy CTA beside somber fog-and-lantern art reads as playful marketing — wrong tone for Atmospheric Dark, so the CTA keeps only the CSS press from `micro-interactions`.

Handoff: `components/hero-fog.tsx` + the `fogTrail` constant in `lib/motion.ts`; `ultraweb:gate-performance` records the ≥5s pointer session at 60fps and `ultraweb:gate-accessibility` confirms the reduced-motion static fallback before it ships.
