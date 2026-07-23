import Link from "next/link";
import { eras } from "@/lib/eras";
import { maps } from "@/lib/maps";

const actAnchors = ["act-i", "act-ii", "act-iii", "act-iv"] as const;

const linkClass =
  "font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground transition-colors duration-[var(--dur-micro)] ease-out hover:text-foreground";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <h2 className="sr-only">Site footer</h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr]">
          <nav aria-label="The journey" className="flex flex-col gap-3">
            <p className="type-meta">{"// the journey"}</p>
            <ul className="flex flex-col gap-2">
              {eras.map((era, i) => (
                <li key={era.id}>
                  <Link href={`/#${actAnchors[i]}`} className={linkClass}>
                    {era.act} · {era.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Map index" className="flex flex-col gap-3">
            <p className="type-meta">{"// the atlas"}</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {maps.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/maps/${m.slug}`}
                    className="font-mono text-xs tracking-[0.04em] text-muted-foreground transition-colors duration-[var(--dur-micro)] ease-out hover:text-foreground"
                  >
                    {m.file}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <p className="type-meta">{"// colophon"}</p>
            <p className="max-w-[36ch] text-sm text-muted-foreground">
              A fan project. Not affiliated with Valve Corporation.
            </p>
            <p className="max-w-[36ch] text-sm text-muted-foreground">
              Built with Next.js. Every visual is original — radar linework,
              dev-texture patterns, procedural geometry. No game assets.
            </p>
          </div>
        </div>

        <div className="corner-ticks mt-14 flex flex-col gap-2 border-t border-border px-4 pt-6 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-meta">
            © {year} BLOCKOUT · A history of Counter-Strike maps
          </p>
          <p className="type-meta">{"// end of file"}</p>
        </div>
      </div>
    </footer>
  );
}
