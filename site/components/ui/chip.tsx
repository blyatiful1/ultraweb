import type { ComponentProps, ReactNode } from "react";

const cn = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

type ChipProps = {
  pressed: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children" | "aria-pressed">;

export function Chip({ pressed, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      data-slot="chip"
      className={cn(
        "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-sm border px-3",
        "font-mono text-xs uppercase tracking-[0.06em] tabular-nums",
        "transition-[background-color,border-color,color] duration-[var(--dur-micro)] ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
