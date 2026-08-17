import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { listRanges, type WebsiteRange } from "../../lib/onbase/client";
import { COLLECTION_LIST, type TileCollection } from "../../lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";

export const metadata: Metadata = {
  title: "Shop Tiles by Look & Use | OnWood Tiles Sunshine Coast",
  description:
    "Browse tiles by look and use: outdoor, timber-look, white, bathroom, splashback and floor tiles. Real products with prices, delivered across the Sunshine Coast.",
  alternates: { canonical: `${SITE}/tiles` },
  openGraph: {
    title: "Shop Tiles by Look & Use | OnWood Tiles",
    description: "Outdoor, timber-look, white, bathroom, splashback and floor tiles, with prices.",
    url: `${SITE}/tiles`,
    type: "website",
  },
};

function matches(c: TileCollection, r: WebsiteRange): boolean {
  if (c.filterGroup && c.filterValues?.length) {
    const have = r.filters?.[c.filterGroup] ?? [];
    if (c.filterValues.some((v) => have.includes(v))) return true;
  }
  if (c.keywords?.length) {
    const hay = `${r.name} ${r.description ?? ""}`.toLowerCase();
    if (c.keywords.some((k) => hay.includes(k))) return true;
  }
  return false;
}

const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)",
};

export default async function TilesIndex() {
  let all: WebsiteRange[] = [];
  try {
    all = await listRanges({ department: "tiles" });
  } catch {
    all = [];
  }
  // A representative room shot for each collection card.
  const cardImg = (c: TileCollection): string | null => {
    const hit = all.filter((r) => matches(c, r));
    return (
      hit.map((r) => r.swatches.find((s) => s.installedImage)?.installedImage).find(Boolean) ||
      hit.map((r) => r.heroImage).find(Boolean) ||
      null
    );
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Tiles", item: `${SITE}/tiles` },
    ],
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Tiles</span>
        </nav>

        <p style={eyebrow}>Shop by look and use</p>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-.02em", lineHeight: 1.05, margin: "12px 0 14px" }}>
          Find your tiles by the job
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "#3a444a", maxWidth: "60ch", margin: "0 0 34px" }}>
          Not sure where to start? Pick the room or look you are tiling and we will show you the tiles that suit it, each a real OnWood product with a price.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 20 }}>
          {COLLECTION_LIST.map((c) => {
            const img = cardImg(c);
            return (
              <Link key={c.slug} href={`/tiles/${c.slug}`} className="ow-collection-card" style={{ display: "block", textDecoration: "none", color: "inherit", borderRadius: 18, overflow: "hidden", background: "#fff", border: "1px solid var(--line)", boxShadow: "0 10px 30px -18px rgba(32,48,58,.25)" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 3", background: "var(--surface)", overflow: "hidden" }}>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={`${c.name} from OnWood Tiles, Sunshine Coast`} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, var(--accent), var(--accent2))" }} />
                  )}
                  <span style={{ position: "absolute", left: 12, top: 12, ...eyebrow, color: "#fff6ee", background: "rgba(20,20,20,.34)", padding: "5px 11px", borderRadius: 999 }}>{c.eyebrow}</span>
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, letterSpacing: "-.01em", margin: "0 0 8px" }}>{c.name}</h2>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6067", margin: "0 0 14px" }}>{c.intro[0]}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "var(--accent)" }}>Explore <span aria-hidden>→</span></span>
                </div>
              </Link>
            );
          })}
        </div>

        <section style={{ marginTop: 56, borderTop: "1px solid var(--line)", paddingTop: 40, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/shop/tiles" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 26px", borderRadius: 999 }}>Shop all tiles <span aria-hidden>→</span></Link>
          <Link href="/tile-shop" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: "var(--ink)", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 26px", borderRadius: 999, border: "1px solid var(--line)" }}>Areas we service <span aria-hidden>→</span></Link>
        </section>

        <style>{`.ow-collection-card{transition:transform .2s ease, box-shadow .2s ease}.ow-collection-card:hover{transform:translateY(-3px);box-shadow:0 24px 44px -28px rgba(32,48,58,.5)}`}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
