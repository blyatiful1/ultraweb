"use client";
// ultraweb kit — <Moment> for Next.js. Mounts a kit moment on the client when it nears the
// viewport; the children are server-rendered and stay readable without JavaScript.
//
// Usage (copy kit/moments/type-lines/ to <project>/kit/moments/type-lines/ and this file to
// <project>/kit/react/Moment.tsx; the @/ alias points at the project root):
//
//   import { Moment } from "@/kit/react/Moment";
//   import "@/kit/moments/type-lines/moment.css"; // in this component file or app/globals.css
//
//   <Moment name="type-lines" load={() => import("@/kit/moments/type-lines/moment.js")}
//           options={{ /* from the moment's README */ }} as="section">
//     {/* the exact markup from kit/moments/type-lines/README.md, inside data-moment's element */}
//   </Moment>
//
// Never edit files under kit/.
import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";

type MountFn = (el: HTMLElement, opts?: Record<string, unknown>) => () => void;

export type MomentProps = {
  load: () => Promise<{ default: MountFn }>;
  /** The moment's folder name; rendered as data-moment so its CSS scope matches. */
  name?: string;
  options?: Record<string, unknown>;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  /** Extra data-* attributes for the moment root, e.g. { "data-speed": "2" }. */
  attrs?: Record<string, string>;
};

export function Moment({ load, name, options, as = "div", className, children, attrs }: MomentProps) {
  const ref = useRef<HTMLElement | null>(null);
  // options are read once per mount; keep the latest without re-running the effect
  const optsRef = useRef(options);
  optsRef.current = options;
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false; // strict mode runs effect, cleanup, effect: the first run must not mount late
    let cleanup: (() => void) | null = null;
    let io: IntersectionObserver | null = null;

    const start = () => {
      loadRef
        .current()
        .then((mod) => {
          if (cancelled) return;
          if (typeof mod.default !== "function") throw new Error("moment.js has no default export");
          const c = mod.default(el, optsRef.current ?? {});
          cleanup = typeof c === "function" ? c : null;
        })
        .catch((err: unknown) => {
          console.warn(`ultraweb kit: moment "${name ?? "?"}" did not mount; content left as is.`, err);
        });
    };

    if (typeof IntersectionObserver === "undefined") start();
    else {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            io = null;
            start();
          }
        },
        { rootMargin: "100% 0px 100% 0px" }
      );
      io.observe(el);
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (cleanup) {
        try {
          cleanup();
        } catch (err) {
          console.warn(`ultraweb kit: cleanup of "${name ?? "?"}" failed.`, err);
        }
      }
      cleanup = null;
    };
  }, [name]);

  return createElement(
    as,
    { ref, className, "data-moment": name, suppressHydrationWarning: true, ...attrs },
    children
  );
}

export default Moment;
