## Worked example — Tidepool, port-logistics SaaS (Precision Instrument — Neo-grotesque Minimal)

design/SYSTEM.md hands down `--primary` (signal teal), the `sm/md/lg/xl` size scale, `--radius-md`, and status tokens for `tone`. A Button and a Card, built by two different Phase-6 skills, must configure identically. They do:

```tsx
// components/ui/button.tsx — variant/size/tone, asChild, cn-last, data-slot, ref-as-prop
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium " +
    "transition-[background-color,transform] duration-[--dur-micro] ease-out " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border border-input bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
      },
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-5", lg: "h-12 px-6 text-lg", xl: "h-14 px-8 text-lg" },
      tone: { default: "", danger: "bg-destructive text-primary-foreground hover:bg-destructive/90" },
    },
    defaultVariants: { variant: "primary", size: "md", tone: "default" },
  },
)
function Button({ className, variant, size, tone, asChild, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return <Comp data-slot="button" ref={ref}
    className={cn(buttonVariants({ variant, size, tone }), className)} {...props} />
}
```

The Card, from `ultraweb:cards`, speaks the same dialect — compound parts each with a `data-slot`, a `variant`/`tone` `cva()` map that resolves only to tokens, and the identical `asChild`/`ref`/`...props`/`cn`-last shape so the whole card can become one link:

```tsx
function Card({ className, variant, asChild, ref, ...props }: CardProps) {
  const Comp = asChild ? Slot : "article"
  return <Comp data-slot="card" ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
}
Card.Header = function ({ className, ...p }) { return <div data-slot="card-header" className={cn("p-6", className)} {...p} /> }
// Card.Body, Card.Footer follow the same shape; a stat card's number takes tone="brand".
```

At the call site both forward native and `aria-*` props without special-casing, and both swap element via `asChild` — no new grammar to learn:

```tsx
<Button asChild size="lg"><Link href="/demo">Book a berth demo</Link></Button>
<Card asChild variant="stat" className="ring-1 ring-primary"><Link href="/berths/atlas">…</Link></Card>
```

Rejected: giving Card a bespoke `as="a"` prop and a `highlighted` boolean — folded into `asChild` and `tone="brand"` respectively, so Card and Button stay one contract instead of two dialects. Also rejected: a `type="filled"` axis on Button — it's `variant`.

Handoff: `ultraweb:buttons`, `ultraweb:cards`, `ultraweb:forms`, `ultraweb:pricing`, and `ultraweb:data-display` each build their `cva()` maps against this vocabulary; `ultraweb:tokens` supplies every utility those maps reference; `ultraweb:gate-code` greps the tree for `forwardRef(`, `as=` polymorphism props, boolean-soup names, and arbitrary values in variant rows.
