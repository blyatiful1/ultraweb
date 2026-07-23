import { ImageResponse } from "next/og";
import { tokens } from "@/lib/tokens";

// The dev-texture tile favicon: an orange blockout square, a darker grid
// scored across it, and a bold "B" — the site mark, generated from tokens.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tokens.dark.primary,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.22) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,0,0,0.22) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
          color: tokens.dark.primaryForeground,
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "sans-serif",
          lineHeight: 1,
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
