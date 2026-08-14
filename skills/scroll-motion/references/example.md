## Worked example — Studio Norra, /work index case-study reveals

SYSTEM.md §motion caps section reveals at 550ms; DIRECTION.md ("Editorial Brutalist — springs, not ease-out defaults") calls for a spring on anything physical. SITEMAP.md marks `/work` as the one page that earns motion — `/studio` prose and the `/contact` form stay static.

Decision: the eight case-study rows on `/work` are one stagger group, 60ms apart, 20px rise + fade, settling on a spring so rows land rather than snap. That spring settle is exactly why these reveals stay on Motion rather than a CSS `animation-timeline` — a linear scroll-driven timeline can't spring; the default engine yields to the escalation only where the direction demands physics. The oversized Archivo Expanded row headings are the reveal unit; the exposed grid rules under them do not animate — the brutalist grid must read as fixed and honest. Signal red `oklch(0.6 0.21 25)` stays out of the entrance entirely (interaction states only). The above-fold `/work` masthead animates on load via hero, not on scroll.

```tsx
const reduced = useReducedMotion(); // motion/react
const row = reduced
  ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
  : { hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 30 } } };

<m.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
  variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
  {cases.map((c) => (
    <m.li key={c.slug} variants={row} />
  ))}
</m.ul>
```

Rejected: a fixed reading-progress bar across the index — an eight-item portfolio isn't long-form, so the bar reads as decoration the direction bans. Reduced motion collapses the rows to opacity-only.

Handoff: the Reveal + stagger land in `app/work/page.tsx`; the cursor-proximity image reveals and the shared-element case-study transition are pointer/route work, not scroll — this skill hands those off, and ultraweb:gate-performance then verifies the entrance layer adds zero CLS on `/work`.
