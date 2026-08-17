import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { SUBURB_LIST, COLLECTION_LIST, SHOP } from "../../lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";

export const metadata: Metadata = {
  title: "Tile Shop Sunshine Coast | Areas We Service | OnWood Tiles",
  description:
    "OnWood Tiles supplies porcelain, wood-look and outdoor tiles across the Sunshine Coast, with delivery to local suburbs and a showroom in Baringa. Find your area.",
  alternates: { canonical: `${SITE}/tile-shop` },
  openGraph: {
    title: "Tile Shop Sunshine Coast | Areas We Service | OnWood Tiles",
    description:
      "Local tile supply across the Sunshine Coast with delivery to your suburb and a Baringa showroom.",
    url: `${SITE}/tile-shop`,
    type: "website",
  },
};

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--accent)",
};
const serif = (t: string) => (
  <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" }}>{t}</em>
);

export default async function TileShopHubPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Areas we service", item: `${SITE}/tile-shop` },
    ],
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Areas we service</span>
        </nav>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 720, margin: "0 0 44px" }}>
          <p style={eyebrow}>Sunshine Coast</p>
          <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(34px,6vw,58px)", lineHeight: 1.04, margin: "14px 0 0" }}>
            Areas we {serif("service")}.
          </h1>
          <p style={{ fontSize: 17.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "58ch", margin: "18px 0 0" }}>
            OnWood Tiles is a local Sunshine Coast tile supplier. We stock porcelain, wood-look, outdoor and pool tiles built for coastal homes, with delivery to suburbs across the coast and a showroom in Baringa.
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#4a545a", maxWidth: "60ch", margin: "12px 0 0" }}>
            Pick your area below to see local delivery, drive time from our showroom, and tile guidance tailored to homes in your suburb.
          </p>
        </section>

        {/* ── Suburb cards ── */}
        <section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 18 }}>
            {SUBURB_LIST.map((s) => (
              <Link
                key={s.slug}
                href={`/tile-shop/${s.slug}`}
                className="ow-util"
                style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", border: "1px solid var(--line)", borderRadius: 18, background: "var(--surface)", padding: "26px 26px 24px" }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)" }}>Sunshine Coast</span>
                <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, letterSpacing: "-.02em", lineHeight: 1.15, margin: "10px 0 8px", color: "var(--ink)" }}>
                  Tile Shop {s.name}
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6067", flex: 1 }}>
                  ~{s.driveMins} min from our Baringa showroom · delivery available
                </span>
                <span style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "var(--accent)" }}>
                  View area <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Shop tiles by look ── */}
        <section style={{ marginTop: 56, borderTop: "1px solid var(--line)", paddingTop: 40 }}>
          <p style={eyebrow}>Shop by look and use</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(22px,2.8vw,32px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
            Browse tiles by the job
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#4a545a", maxWidth: "60ch", margin: "0 0 20px" }}>
            Know what you are tiling? Jump straight to the tiles that suit the room or look you have in mind, each a real product with a price.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {COLLECTION_LIST.map((c) => (
              <Link key={c.slug} href={`/tiles/${c.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 14, fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}>
                {c.name}
              </Link>
            ))}
            <Link href="/tiles" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, background: "transparent", border: "1px dashed var(--line)", fontSize: 14, fontWeight: 700, color: "#8a8577", textDecoration: "none" }}>
              All collections →
            </Link>
          </div>
        </section>

        {/* ── Closing note ── */}
        <section style={{ marginTop: 56, borderTop: "1px solid var(--line)", paddingTop: 36 }}>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#4a545a", maxWidth: "62ch", margin: "0 0 18px" }}>
            Not sure if we reach you? Our Baringa showroom ({SHOP.suburb}, {SHOP.state}) is in the southern Sunshine Coast, and we deliver across the region within our zones. Get in touch and tell us your suburb.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/shop/tiles" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 26px", borderRadius: 999, boxShadow: "0 16px 40px -22px rgba(208,106,69,.7)" }}>
              Browse tiles <span aria-hidden>→</span>
            </Link>
            <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: "var(--ink)", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 26px", borderRadius: 999, border: "1px solid var(--line)" }}>
              Get in touch <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <style>{`
          .ow-util { transition: transform .2s ease, box-shadow .2s ease; }
          .ow-util:hover { transform: translateY(-3px); box-shadow: 0 24px 44px -28px rgba(32,48,58,.5); }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
