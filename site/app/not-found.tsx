import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Map failed to compile",
  description: "This route never made it past the compiler.",
};

const log = [
  "> compiling map: maps/void.bsp",
  "> qbsp2 | vis | rad — full compile",
  "error: brush 404 leaked into the void",
  "error: entity info_player_start unreachable",
  "leaked. 1 leaf without contents",
  "** pointfile written to maps/void.lin **",
  "0 portals · 0 clusters · 0 visible leafs",
  "compile failed after 0.404 seconds",
];

function lineClass(line: string): string {
  if (line.startsWith("error:")) return "text-destructive";
  if (line.startsWith("**")) return "text-primary";
  return "text-muted-foreground";
}

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative isolate flex min-h-[calc(100svh-3.5rem)] items-center overflow-hidden"
    >
      <div
        aria-hidden
        className="dev-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
      />
      <div className="mx-auto w-full max-w-[1280px] px-6 py-24">
        <p className="type-meta text-primary">error 404 // missing .bsp</p>

        <div className="mt-6 max-w-[60ch] overflow-x-auto rounded-sm border border-border bg-card p-5 font-mono text-xs leading-relaxed">
          {log.map((line) => (
            <p key={line} className={`whitespace-pre ${lineClass(line)}`}>
              {line}
            </p>
          ))}
        </div>

        <h1 className="type-display mt-10 text-5xl text-foreground">
          Map failed
          <br />
          to compile
        </h1>

        <p className="mt-5 max-w-[52ch] text-muted-foreground">
          This route never made it past the compiler. The layout you were
          looking for isn’t in the archive — check the map index, or head back
          to where the story starts.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/">Back to the journey</Button>
          <Button href="/maps" variant="ghost">
            Open the Atlas
          </Button>
        </div>
      </div>
    </main>
  );
}
