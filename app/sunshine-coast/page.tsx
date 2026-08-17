import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { RangeCard } from "../components/shop/shared";
import { listRanges, type WebsiteRange } from "../../lib/onbase/client";
import { SHOP, SUBURB_LIST, COLLECTION_LIST } from "../../lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";

export const metadata: Metadata = {
  title: "Tiles Sunshine Coast | Floor, Wall & Outdoor | OnWood Tiles",
  description:
    "OnWood Tiles is a Sunshine Coast tile shop in Baringa: porcelain, wood-look, outdoor and pool tiles built for coastal homes. Prices, local delivery and a showroom.",
  alternates: { canonical: `${SITE}/sunshine-coast` },
  openGraph: {
    title: "Tiles Sunshine Coast | OnWood Tiles",
    description: "Porcelain, wood-look and outdoor tiles built for Sunshine Coast homes, with local delivery.",
    url: `${SITE}/sunshine-coast`,
    type: "website",
  },
};

const eyebrow: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)",
};

const FAQS = [
  { q: "Are you a Sunshine Coast tile shop?", a: `Yes. Our showroom is at ${SHOP.street}, ${SHOP.suburb}, in the southern Sunshine Coast, and we deliver tiles across the Coast and the hinterland. We are a local, family-run supplier.` },
  { q: "What tiles suit a coastal home?", a: "For homes near the water we lean towards hard-wearing porcelain that copes with salt air and humidity, matt or textured floors for grip, and outdoor-rated ranges for alfresco areas and pool surrounds. Light, warm tones tend to suit the relaxed coastal look." },
  { q: "Do you deliver across the whole Sunshine Coast?", a: "Yes, from Caloundra and Kawana up to Maroochydore, Buderim and the hinterland. Tell us your suburb for a delivery quote, or collect from Baringa." },
  { q: "Do prices include GST?", a: "Yes. Every tile on the website shows a price including GST, so you can plan your budget before you order or visit. Prices are for supply only and do not include delivery, which we quote separately." },
];

export default async function SunshineCoastPage() {
  let popular: WebsiteRange[] = [];
  try {
    const all = await listRanges({ department: "tiles" });
    const hasRoom = (r: WebsiteRange) => r.swatches.some((s) => s.installedImage);
    const isOutdoor = (r: WebsiteRange) => (r.filters?.["location-use"]?.includes("outdoor") ?? false);
    popular = [...all]
      .map((r, i) => ({ r, i, score: (hasRoom(r) ? 2 : 0) + (isOutdoor(r) ? 1 : 0) }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((x) => x.r)
      .slice(0, 8);
  } catch {
    popular = [];
  }
  const heroImg =
    popular.map((r) => r.swatches.find((s) => s.installedImage)?.installedImage).find(Boolean) ||
    popular.map((r) => r.heroImage).find(Boolean) ||
    null;
  const address = `${SHOP.street}, ${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`OnWood Tiles, ${address}`)}`;

  const businessLd = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: "OnWood Tiles",
    url: `${SITE}/sunshine-coast`,
    email: SHOP.email,
    address: { "@type": "PostalAddress", streetAddress: SHOP.street, addressLocality: SHOP.suburb, addressRegion: SHOP.state, postalCode: SHOP.postcode, addressCountry: "AU" },
    areaServed: { "@type": "AdministrativeArea", name: "Sunshine Coast, Queensland" },
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
      { "@type": "ListItem", position: 2, name: "Sunshine Coast", item: `${SITE}/sunshine-coast` },
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
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Sunshine Coast</span>
        </nav>

        {/* HERO */}
        <section className="sc-hero">
          <div style={{ minWidth: 0 }}>
            <p style={eyebrow}>Your local tile shop</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-.02em", lineHeight: 1.05, margin: "12px 0 16px" }}>
              Tiles for Sunshine Coast homes
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "60ch", margin: "0 0 12px" }}>
              OnWood Tiles is a local, family-run tile shop in Baringa, in the southern Sunshine Coast, and we deliver right across the Coast. We supply floor, wall and outdoor tiles chosen for coastal living: hard-wearing, low-maintenance and beautiful in the Queensland light.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "60ch", margin: "0 0 22px" }}>
              Every tile shows a price online, so you can plan the job, then order for delivery across the Coast or come and see the boards in person.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href="/shop/tiles" style={ctaSolid}>Browse tiles <span aria-hidden>→</span></Link>
              <Link href="/book" style={ctaOutline}>Book a showroom visit <span aria-hidden>→</span></Link>
            </div>
          </div>
          {heroImg && (
            <div className="sc-hero-media">
              <div className="sc-hero-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sc-hero-img" src={heroImg} alt="Tiles styled in a Sunshine Coast home by OnWood Tiles" />
              </div>
            </div>
          )}
        </section>

        {/* Shop by look */}
        <section style={{ marginTop: 60 }}>
          <p style={eyebrow}>Shop by look and use</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 14px" }}>
            Start with the room you are tiling
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {COLLECTION_LIST.map((c) => (
              <Link key={c.slug} href={`/tiles/${c.slug}`} style={pill}>{c.name}</Link>
            ))}
            <Link href="/tiles" style={{ ...pill, background: "transparent", borderStyle: "dashed", color: "#8a8577" }}>All collections →</Link>
          </div>
        </section>

        {/* Popular products */}
        {popular.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <p style={eyebrow}>A good place to start</p>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
              Popular on the Coast
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 26px" }}>
              Coastal-friendly tiles our Sunshine Coast customers reach for, each a real OnWood product with a price.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
              {popular.map((r) => (<RangeCard key={r.id} range={r} />))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href="/shop/tiles" style={ctaOutline}>Browse all tiles <span aria-hidden>→</span></Link>
            </div>
          </section>
        )}

        {/* Areas */}
        <section style={{ marginTop: 60 }}>
          <p style={eyebrow}>Delivery across the Coast</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
            Areas we service
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

        {/* Delivery + showroom band */}
        <section style={{ marginTop: 60 }}>
          <div style={{ borderRadius: 24, padding: "clamp(28px,4vw,46px)", background: "var(--ink)", color: "#fff6ee" }}>
            <div className="sc-band">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,246,238,.6)", margin: "0 0 12px" }}>Visit or order</p>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 820, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", lineHeight: 1.1, margin: "0 0 14px" }}>
                  See the boards in Baringa
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,246,238,.82)", maxWidth: "52ch", margin: "0 0 10px" }}>
                  Order online for delivery across the Sunshine Coast, or come and stand on the full-size boards and take samples home. We supply tiles only and do not install.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,246,238,.72)", margin: 0 }}>{SHOP.name}, {address}<br />Open {SHOP.hours}. {SHOP.email}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "center" }}>
                <Link href="/book" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999 }}>Book a visit <span aria-hidden>→</span></Link>
                <a href={directionsUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,246,238,.1)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999, border: "1px solid rgba(255,246,238,.24)" }}>Get directions <span aria-hidden>↗</span></a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginTop: 60, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "0 0 20px" }}>
            Sunshine Coast tiles, your questions
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
          .sc-hero { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; margin: 4px 0 0; }
          .sc-hero-media { position: relative; min-width: 0; }
          .sc-hero-frame { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 24px 60px -34px rgba(30,20,10,.5); background: #fff; aspect-ratio: 4 / 3; }
          .sc-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
          .sc-band { display: grid; grid-template-columns: 1fr; gap: 22px; }
          @media (min-width: 900px) {
            .sc-hero { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); column-gap: clamp(28px, 4vw, 52px); align-items: center; }
            .sc-band { grid-template-columns: minmax(0, 1.4fr) minmax(0, auto); align-items: center; gap: 40px; }
          }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
