import type { MetadataRoute } from "next";

const BASE_URL = "https://blockout-cs.vercel.app";

// aiCrawlerPolicy: "disallow" — BLOCKOUT is a personal, non-commercial fan
// project (design/BRIEF.md, design/SITEMAP.md). No stake in AI-answer-engine
// reach, so the default posture holds: let search indexers in, keep the
// AI-training crawlers out. Google Search itself is unaffected by this list.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "Google-Extended",
          "CCBot",
          "Bytespider",
          "Applebot-Extended",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
