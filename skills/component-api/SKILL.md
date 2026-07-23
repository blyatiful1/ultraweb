---
name: component-api
description: The cross-cutting prop contract every component skill speaks — one shared dialect so ten independently-built components read as authored, not assembled. Fixes the canonical prop vocabulary (variant/size/tone), cva()-based variants that resolve to tokens never literals, asChild polymorphism via Radix Slot (never a custom `as` prop), the cn()/tailwind-merge order that lets a caller's className win, data-slot part targeting and ref-as-prop forwarding for React 19, controlled/uncontrolled parity, and native-attribute + a11y pass-through. Invoke in the Foundation phase after tokens and before the component tier, whenever building or restyling any component (buttons, cards, forms, pricing, data-display, hero…), deciding a prop name, adding a variant, or when the user says "the props are inconsistent", "name this prop", "should this be asChild", "why do the components feel assembled", or a component invents its own variant vocabulary.
---

# component-api — one dialect, ten components

**Stage:** Phase 3 — Foundation (after tokens, before the component tier) - **Reads:** design/SYSTEM.md, lib/utils.ts (cn) - **Writes:** no file of its own — the shared prop contract every `components/ui/*` and section component honors (a reference skill, like taste)

## Standard

A site reads as *assembled* when each component is individually fine but they speak ten prop dialects — `variant="primary"` here, `type="filled"` there, `isLarge` next to `size="lg"`, a bespoke `as="a"` beside a real `asChild`. Close inspection catches the seam even when no single component is wrong. First-grade means the opposite: every component is configured the same way, so a developer who has used one has used all of them, and the system reads as one author's work. This is a design-system discipline orthogonal to any component's visual spec — `ultraweb:buttons` owns what a button *looks* like; this skill owns how you *configure* it. It governs; it ships no file. Every component-tier skill obeys it, and `ultraweb:gate-code` greps for its violations.

## The contract

Eight rules. A component may use only the axes it needs, but the ones it uses obey these names and shapes.

1. **The vocabulary is exactly three axes: `variant`, `size`, `tone`.** `variant` = the form/weight the component takes (button: primary/secondary/ghost; card: media/stat/editorial). `size` = the scale step, shared meaning site-wide (`sm`/`md`/`lg`/`xl`). `tone` = semantic intent that selects a token *family* (`default` → foreground/muted, `brand` → primary, `danger` → destructive, `success`/`warning` → status tokens). No synonyms, ever — never `type`, `kind`, `color`, `appearance`, `emphasis`, `intent`, or `scale`. Status-bearing components (badge, alert, toast, input error) express intent through `tone`; a component whose destruction is a *distinct filled treatment* (the Button) may legitimately carry `destructive` as a `variant` — but the name of every axis is fixed.

2. **Variants are `cva()` enums that resolve to tokens, never literals.** Each `variant`/`size`/`tone` value is a row in one `cva()` map whose classes are token-backed utilities (`bg-primary`, `text-sm`, `rounded-md`, `shadow-md`) with a `defaultVariants` for the rest state. A hex, a bare `oklch(`, or an arbitrary `bg-[…]` inside a variant row is a defect — the value you reached for is a token `ultraweb:tokens` already owns. This is where "variants map to the design system" is *enforced*, not merely intended.

3. **`cn()` is the only class merge, and `className` comes last.** `cn` (clsx + tailwind-merge, from `lib/utils.ts`) is the single merge path: `cn(buttonVariants({ variant, size }), className)`. The consumer's `className` is the *final* argument so tailwind-merge lets a caller override a token utility (`rounded-none`, `w-full`) without specificity wars or `!important`. Never string-concatenate classes with `+` or template literals; never put `className` before the variants.

4. **Polymorphism is `asChild` (Radix `Slot`) — never a custom `as` prop.** When a component must render as a different element — a CTA that is a `next/link`, a card that is one big link — it accepts `asChild` and renders `<Slot>`, which merges its classes and props onto the caller's single child. No `as="a"` string, no `component={Link}` prop: those discard the child element's real types and its native props.

5. **Every root carries `data-slot="<component>[-<part>]"`; target parts by data-slot.** The shadcn/React-19 hook for styling, state, and tests. Group styling and state variants select `data-[slot=…]`, `group-data-[state=open]`, `has-[[data-slot=icon]]` — never fragile child combinators (`> div > span`).

6. **Refs are plain props (React 19) — no `forwardRef`; spread `...props` onto the root.** `function Button({ ref, className, ...props })`. Spreading `...props` last-but-one (before `className` is applied via `cn`) forwards every native attribute — `type`, `disabled`, `onClick`, `id`, `name` — *and* every `aria-*`/`role` for free. Native-attribute forwarding and a11y pass-through are the same rule: don't enumerate props you could spread.

7. **Stateful components support controlled *and* uncontrolled, one pattern.** Anything with internal state (tabs, accordion, dialog, switch) accepts `value`/`defaultValue` (or `open`/`defaultOpen`) + `onValueChange`; controlled when the value prop is present, uncontrolled otherwise. This is Radix's own contract — restyle the Radix primitive, never re-implement its state machine as a third mode.

8. **Compound components share state via context; sub-parts are `X.Header`/`X.Body`.** A multi-part component (Card, Field) exports a namespace where each part carries its own `data-slot` and shared config flows through a tiny context — not prop-drilling, not one giant props object. Callers compose the parts; the component owns the wiring.

**Three composition shapes, in order of reach-for:** the **variant enum** (rule 2) is the default closed set and covers ~90% of configuration; **`asChild`/`Slot`** (rule 4) handles element swaps; a **render-prop escape hatch** (`children` as a function receiving state — Base-UI style) is the last resort, only when a caller must inject arbitrary markup a closed variant can't express. Reach left before right.

## Anti-patterns

- `as="a"` / `component={…}` string-polymorphism props — use `asChild` + `Slot` (rule 4).
- `type=`, `kind=`, `appearance=`, `color=`, `emphasis=`, `intent=`, `scale=` as prop names — synonyms of the canonical trio; rename to `variant`/`size`/`tone`.
- Boolean soup — `isPrimary`, `isLarge`, `outlined`, `filled`, `danger` booleans instead of enum axes. Two booleans that can't both be true are one `variant`.
- `forwardRef(` in a new component file — React 19 passes `ref` as a prop; grep for it, treat a hit as a relic.
- `className` merged with `+` or a template literal, or placed *before* the variants in `cn()` — the caller can no longer override.
- A hex, bare `oklch(`, or `bg-[…]`/`text-[…]` inside a `cva()` variant row — defer to a token (`ultraweb:tokens`).
- Child-combinator selectors (`.card > div`) instead of `data-[slot=…]` targeting.
- Re-implementing a Radix stateful primitive's controlled/uncontrolled logic by hand instead of restyling it.
- Per-call-site `className` soup faking a variant that should live in the shared `cva()` map — the single loudest "assembled, not authored" tell.

## Worked example — Tidepool, port-logistics SaaS (Neo-grotesque Minimal)

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

## Composes with

- ultraweb:tokens — supplies every token-backed utility a `cva()` variant row resolves to; rule 2 forbids anything else.
- ultraweb:buttons — the canonical `variant`/`size`/`tone` + `asChild` implementation; the reference this contract generalizes.
- ultraweb:cards — the canonical compound-component (context + `X.Header`/`X.Body` + `data-slot` parts) obeying rule 8.
- ultraweb:forms — inputs express validity through `tone` and forward native + `aria-*` attributes per rule 6.
- ultraweb:pricing, ultraweb:data-display — inherit the prop vocabulary for their tier cards and table/stat components.
- ultraweb:hero — its CTA pair uses `asChild` link-buttons and the shared size scale.
- ultraweb:ui-states — skeleton/empty/error states are `variant`s or `tone`s on the same components, never separate one-off components.
- ultraweb:icons — icon slots forward through `...props`; icon-only components still demand `aria-label` (a11y pass-through, rule 6).
- ultraweb:app-structure — decides where a component is a server vs client leaf; this skill decides its prop shape regardless of that boundary.
- ultraweb:gate-code — greps the tree for every violation named in Anti-patterns, empirically enforcing this contract at Phase 11.
