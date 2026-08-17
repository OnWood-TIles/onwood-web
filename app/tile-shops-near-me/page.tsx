import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { SHOP, SUBURB_LIST, COLLECTION_LIST } from "../../lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";

export const metadata: Metadata = {
  title: "Tile Shops Near Me | Sunshine Coast Tile Shop | OnWood Tiles",
  description:
    "Looking for a tile shop near you on the Sunshine Coast? OnWood Tiles supplies floor, wall and outdoor tiles from Baringa, with delivery across the Coast and a showroom to visit.",
  alternates: { canonical: `${SITE}/tile-shops-near-me` },
  openGraph: {
    title: "Tile Shops Near Me | OnWood Tiles",
    description: "Your local Sunshine Coast tile shop in Baringa, with delivery across the Coast.",
    url: `${SITE}/tile-shops-near-me`,
    type: "website",
  },
};

const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)",
};

const FAQS = [
  { q: "Where is your tile shop?", a: `Our showroom is at ${SHOP.street}, ${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}, in the southern Sunshine Coast and easy to reach from Caloundra, Kawana, Maroochydore and the surrounding suburbs. It is the best place to see full-size boards and take samples home.` },
  { q: "Do you deliver, or do I need to come in?", a: "Both. You are welcome to visit the Baringa showroom, and we also deliver tiles across the Sunshine Coast. Tell us your suburb for a delivery quote, or collect your order in store." },
  { q: "Are prices shown online?", a: "Yes. Every tile on the website shows a price (including GST), so you can compare and plan your budget before you visit or order. Prices are supply only and do not include delivery, which we quote separately." },
  { q: "Do you install tiles?", a: "No, we are a supply-only tile shop. We help you choose the right tiles and get them to you, and you or your tiler handle the install. We are happy to work in with your tiler on quantities." },
];

export default async function NearMePage() {
  const address = `${SHOP.street}, ${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`OnWood Tiles, ${address}`)}`;

  const businessLd = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: "OnWood Tiles",
    url: `${SITE}/tile-shops-near-me`,
    email: SHOP.email,
    address: { "@type": "PostalAddress", streetAddress: SHOP.street, addressLocality: SHOP.suburb, addressRegion: SHOP.state, postalCode: SHOP.postcode, addressCountry: "AU" },
    areaServed: SUBURB_LIST.map((s) => ({ "@type": "City", name: s.name })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Tile shops near me", item: `${SITE}/tile-shops-near-me` },
    ],
  };

  const ctaSolid: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 10, background: "var(--accent)", color: "#fff6ee",
    fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 26px", borderRadius: 999,
    boxShadow: "0 16px 40px -22px rgba(208,106,69,.7)",
  };
  const ctaOutline: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: "var(--ink)",
    fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "14px 26px", borderRadius: 999, border: "1px solid var(--line)",
  };
  const pill: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 15px", borderRadius: 999,
    background: "var(--surface)", border: "1px solid var(--line)", fontSize: 13.5, fontWeight: 700, color: "var(--ink)", textDecoration: "none",
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Tile shops near me</span>
        </nav>

        {/* HERO */}
        <section>
          <p style={eyebrow}>Sunshine Coast</p>
          <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-.02em", lineHeight: 1.05, margin: "12px 0 16px" }}>
            A tile shop near you on the Sunshine Coast
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 12px" }}>
            OnWood Tiles is your local tile shop, based in Baringa in the southern Sunshine Coast. Whether you are in Caloundra, Kawana, Maroochydore or the hinterland, we are within easy reach, and we deliver right across the Sunshine Coast.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 22px" }}>
            Browse the full range online with prices, order for delivery or pickup, or come and see the full-size boards in the showroom.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/shop/tiles" style={ctaSolid}>Browse tiles <span aria-hidden>→</span></Link>
            <a href={directionsUrl} target="_blank" rel="noreferrer" style={ctaOutline}>Get directions <span aria-hidden>↗</span></a>
          </div>
        </section>

        {/* Showroom + delivery band */}
        <section style={{ marginTop: 40 }}>
          <div style={{ borderRadius: 24, padding: "clamp(26px,4vw,44px)", background: "var(--ink)", color: "#fff6ee" }}>
            <div className="nm-band">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,246,238,.6)", margin: "0 0 12px" }}>Our showroom</p>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 820, fontSize: "clamp(23px,3vw,32px)", letterSpacing: "-.02em", lineHeight: 1.1, margin: "0 0 12px" }}>
                  {SHOP.name}, {SHOP.suburb}
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,246,238,.82)", margin: "0 0 8px" }}>{address}</p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,246,238,.72)", margin: 0 }}>Open {SHOP.hours}. {SHOP.email}. Supply only, delivery across the Sunshine Coast.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "center" }}>
                <Link href="/book" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999 }}>Book a visit <span aria-hidden>→</span></Link>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,246,238,.1)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999, border: "1px solid rgba(255,246,238,.24)" }}>Ask a question <span aria-hidden>→</span></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Areas we service */}
        <section style={{ marginTop: 60 }}>
          <p style={eyebrow}>Areas we service</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
            Local to your suburb
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 22px" }}>
            We deliver to suburbs right across the Sunshine Coast. Find yours for local delivery info and the tiles that suit homes in your area.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {SUBURB_LIST.map((s) => (
              <Link key={s.slug} href={`/tile-shop/${s.slug}`} style={pill}>{s.name}</Link>
            ))}
            <Link href="/tile-shop" style={{ ...pill, background: "transparent", borderStyle: "dashed", color: "#8a8577" }}>See all areas →</Link>
          </div>
        </section>

        {/* Shop by look */}
        <section style={{ marginTop: 60 }}>
          <p style={eyebrow}>Shop by look and use</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
            Know what you are tiling?
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 22px" }}>
            Jump straight to the tiles that suit the room or look you have in mind.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {COLLECTION_LIST.map((c) => (
              <Link key={c.slug} href={`/tiles/${c.slug}`} style={pill}>{c.name}</Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginTop: 60, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "0 0 20px" }}>
            Your questions
          </h2>
          <div style={{ maxWidth: 820 }}>
            {FAQS.map((f, i) => (
              <details key={i} className="ow-faq" style={{ borderBottom: "1px solid var(--line)" }}>
                <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 2px", fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 17.5, lineHeight: 1.35, color: "var(--ink)" }}>
                  {f.q}
                  <span className="ow-faq-plus" aria-hidden style={{ flexShrink: 0, fontSize: 24, lineHeight: 1, color: "var(--accent)", transition: "transform .2s ease" }}>+</span>
                </summary>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", margin: "0 0 18px", maxWidth: "70ch" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <style>{`
          .ow-faq > summary::-webkit-details-marker { display: none; }
          .ow-faq[open] .ow-faq-plus { transform: rotate(45deg); }
          .nm-band { display: grid; grid-template-columns: 1fr; gap: 22px; }
          @media (min-width: 900px) { .nm-band { grid-template-columns: minmax(0, 1.4fr) minmax(0, auto); align-items: center; gap: 40px; } }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
