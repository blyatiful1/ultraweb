"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render a fixed-size placeholder until mounted so the server and first
  // client render agree — no hydration mismatch, no layout shift.
  if (!mounted) {
    return <span aria-hidden className="inline-flex h-8 w-8" />;
  }

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isDark ? (
        <Sun size={16} strokeWidth={1.5} aria-hidden />
      ) : (
        <Moon size={16} strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const atlasActive = pathname === "/maps" || pathname.startsWith("/maps/");

  return (
    <>
      <a
        href="#main"
        className="type-meta sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
          <Link
            href="/"
            aria-label="BLOCKOUT — home"
            className="inline-flex items-center gap-2.5"
          >
            <span aria-hidden className="h-2.5 w-2.5 bg-primary" />
            <span className="font-mono text-sm font-medium tracking-[0.12em] text-foreground">
              BLOCKOUT
            </span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/maps"
              aria-current={atlasActive ? "page" : undefined}
              className="relative px-2 py-1 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground after:pointer-events-none after:absolute after:inset-x-2 after:bottom-0 after:h-px after:bg-primary after:opacity-0 after:content-[''] aria-[current=page]:after:opacity-100"
            >
              Atlas
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </>
  );
}
