// WebSite JSON-LD for BLOCKOUT. Server component, no client behavior.
// Not wired into any page yet — pages import this where needed.

const BASE_URL = "https://blockout-cs.vercel.app";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BLOCKOUT",
  alternateName: "BLOCKOUT — A History of Counter-Strike Maps",
  url: BASE_URL,
  description:
    "A history of Counter-Strike maps, GoldSrc to CS2 — the nine-map canon, one authored scroll.",
};

export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
