## Worked example — Kaffeewerk Ost, single-origin shop schema

BRIEF.md §Backend: "single-origin roasts sold as one-off bags and as a recurring **Abo**" → nouns `products`, `orders`, `order_items`, `subscriptions`; SITEMAP.md's `/shop/[slug]` and `/abo` fix which tables carry a URL slug and which hold a Stripe subscription id.

The `products` table, seeded in the roastery's voice — real tasting notes, never "Product 1":

```ts
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),               // /shop/[slug]
  name: text("name").notNull(),                        // "Röstung No. 14 — Washed Yirgacheffe"
  tastingNotes: text("tasting_notes").notNull(),       // "Apricot, black tea, honey"
  priceCents: integer("price_cents").notNull(),        // 1450 = €14,50 the bag
  roastLevel: roastLevelEnum("roast_level").notNull(), // pgEnum: filter|omni|espresso
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("products_roast_idx").on(t.roastLevel)]);
```

Rejected: a single `price` numeric column — floats drop cents, so money stays integer `priceCents` (€14,50 → 1450), and `roastLevel` is a closed `pgEnum` the shop filters by, not free text.
Output lands in `db/schema.ts` + a voiced `db/seed.ts`; `ultraweb:payments` writes `orders`/`subscriptions` here from the Stripe webhook, and `ultraweb:server-actions` writes the checkout rows.
