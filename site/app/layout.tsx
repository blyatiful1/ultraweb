import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { archivo, jetbrains } from "@/lib/fonts";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blockout-cs.vercel.app"),
  title: {
    default: "BLOCKOUT — A History of Counter-Strike Maps",
    template: "%s — BLOCKOUT",
  },
  description:
    "Three engines, 27 years, nine maps. The history of Counter-Strike's levels, from the 1999 beta to CS2 — told as one scroll.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
