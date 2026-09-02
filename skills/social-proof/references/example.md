## Worked example — Loop & Thread, photo reviews as the proof

BRIEF.md proof inventory: 40 real customer reviews, each with a customer-shot photo of the textile in use — no press, no logos the maker has permission to show. SITEMAP.md names one `#reviews` section on `/` and `/products/[slug]`.

Proof this specific calls for the **Testimonial Wall**, letting the photo carry the trust: a 5-item masonry (`columns-2 break-inside-avoid`) of customer photo + quote, heights deliberately uneven. Quotes stay concrete — "The indigo runner has survived two toddlers and three washes; the color hasn't budged and it's softer now than the day it arrived." Attribution is name + city + product bought, not a business role:

```tsx
<figure className="break-inside-avoid rounded-2xl bg-card p-6">
  <Image src={r.photo} alt={`${r.name}'s ${r.product}`} width={480} height={600}
    className="rounded-xl" /> {/* explicit w/h so the row never shifts */}
  <blockquote className="mt-4 font-body text-[1.125rem] leading-relaxed text-walnut">{r.quote}</blockquote>
  <figcaption className="mt-3 text-sm text-muted-foreground">
    {r.name} · {r.city} · <span className="text-indigo">{r.product}</span>
  </figcaption>
</figure>
```

Rejected a `★★★★★` row on every card — unverifiable, emoji-adjacent, and the customer's own photo already does the trust work a glyph can't. Also rejected a "10,000+ sold" stat band: round-number inflation undercuts a small-batch maker's scarcity story.
Photos pull from blob-storage originals through `ultraweb:imagery` (warm treatment to match SYSTEM §imagery); the finished `components/sections/testimonials.tsx` hands to `ultraweb:gate-antislop`, which greps it for `★★★★★` and `highly recommend` before it ships.
