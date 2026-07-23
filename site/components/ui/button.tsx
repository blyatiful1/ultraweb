import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "default" | "ghost";
type Size = "sm" | "default";

const cn = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium " +
  "transition-[background-color,border-color,transform] duration-[var(--dur-micro)] ease-out " +
  "active:scale-[0.98] motion-reduce:active:scale-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost:
    "border border-border text-foreground hover:border-foreground/25 hover:bg-secondary",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  default: "h-10 px-5 text-sm",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<
        ComponentProps<typeof Link>,
        "href" | "className" | "children"
      >)
    | ({ href?: undefined } & Omit<
        ComponentProps<"button">,
        "className" | "children"
      >)
  );

export function Button({
  variant = "default",
  size = "default",
  className,
  href,
  children,
  ...props
}: ButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], className);

  if (href !== undefined) {
    const linkProps = props as Omit<
      ComponentProps<typeof Link>,
      "href" | "className" | "children"
    >;
    return (
      <Link href={href} data-slot="button" className={cls} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;
  return (
    <button
      type={buttonProps.type ?? "button"}
      data-slot="button"
      className={cls}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
