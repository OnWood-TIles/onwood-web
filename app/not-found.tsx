import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "./components/marketing/MarketingNav";
import MarketingFooter from "./components/marketing/MarketingFooter";

// Root 404. Renders INSIDE the root layout, so the NavConfig / ShopMenu
// providers (mounted in layout.tsx) are available and MarketingNav +
// MarketingFooter render cleanly here, matching every other marketing page.
export const metadata: Metadata = {
  title: "Page not found",
  description:
    "We couldn't find that page. Head back to the OnWood Tiles home or browse the tile range.",
};

const serif = (t: string) => (
  <em
    style={{
      fontFamily: "var(--font-newsreader)",
      fontStyle: "italic",
      fontWeight: 500,
      color: "var(--accent)",
    }}
  >
    {t}
  </em>
);

export default function NotFound() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MarketingNav />
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "clamp(120px,18vw,180px) 32px clamp(72px,10vw,110px)",
        }}
      >
        <section style={{ maxWidth: 640, textAlign: "center" }}>
          {/* Oversized 404 with the brand terracotta glow */}
          <div
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 900,
              fontSize: "clamp(84px,16vw,168px)",
              letterSpacing: "-.04em",
              lineHeight: 0.9,
              background: "linear-gradient(150deg, var(--accent), #b0501f)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 8,
            }}
            aria-hidden
          >
            404
          </div>

          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--accent2)",
              marginBottom: 18,
            }}
          >
            Page not found
          </div>

          <h1
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(30px,4.6vw,50px)",
              letterSpacing: "-.025em",
              lineHeight: 1.05,
              margin: "0 0 18px",
            }}
          >
            This page has been {serif("tiled over.")}
          </h1>

          <p
            style={{
              color: "#5a6067",
              fontSize: 17,
              lineHeight: 1.7,
              margin: "0 auto 34px",
              maxWidth: 460,
            }}
          >
            We couldn&rsquo;t find the page you were after. It may have moved, or
            the link might be missing a piece. Let&rsquo;s get you back on solid
            ground.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--accent)",
                color: "#fff6ee",
                fontWeight: 800,
                fontSize: 15,
                padding: "14px 28px",
                borderRadius: 999,
                textDecoration: "none",
                boxShadow: "0 14px 30px -12px rgba(208,106,69,.6)",
              }}
            >
              Back to home <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--ink)",
                fontWeight: 800,
                fontSize: 15,
                padding: "14px 26px",
                borderRadius: 999,
                textDecoration: "none",
                border: "1.5px solid var(--line)",
                background: "var(--surface)",
              }}
            >
              Browse the tiles <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
