import { ImageResponse } from "next/og";
import { tokens } from "@/lib/tokens";

export const alt = "BLOCKOUT — a history of Counter-Strike maps, 1999—2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          background: tokens.dark.background,
          color: tokens.dark.foreground,
          fontFamily: "monospace",
        }}
      >
        {/* dev-grid suggestion: bordered boxes, no background images */}
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              border: `1px solid ${tokens.dark.border}`,
            }}
          />
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              border: `1px solid ${tokens.dark.border}`,
            }}
          />
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              border: `1px solid ${tokens.dark.primary}`,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: tokens.dark.mutedForeground,
              marginLeft: 8,
              letterSpacing: "0.08em",
            }}
          >
            de_dust2.bsp // compiling
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 148,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            BLOCKOUT
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: tokens.dark.mutedForeground,
              letterSpacing: "0.01em",
            }}
          >
            A history of Counter-Strike maps · 1999—2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 10,
              background: tokens.dark.primary,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: tokens.dark.mutedForeground,
              letterSpacing: "0.08em",
            }}
          >
            GOLDSRC · SOURCE · CS:GO · CS2
          </div>
        </div>
      </div>
    ),
    size,
  );
}
