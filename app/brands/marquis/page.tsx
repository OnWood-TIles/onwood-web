import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { RangeCard } from "../../components/shop/shared";
import { listRanges, type WebsiteRange } from "../../../lib/onbase/client";
import { SHOP, SUBURB_LIST, showroomAddress } from "../../../lib/content";
import { rs } from "../../../lib/rs";

// Brand landing page for Marquis (sold under its own name, unlike the tile suppliers, whose
// ranges carry OnWood names and never get a brand page). Targets "Marquis vanities Sunshine
// Coast": real Marquis facts (marquis.com.au about + warranty pages), the live Marquis
// products from the catalogue, and brand FAQs with FAQPage / CollectionPage structured data.

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";
const URL_ = `${SITE}/brands/marquis`;

export const metadata: Metadata = {
  title: { absolute: "Marquis Vanities Sunshine Coast | Basins & Mirrors | OnWood Tiles" },
  description:
    "Marquis vanities, basins and mirrors on the Sunshine Coast. Build yours in 3D with live prices, made to order in Australia, freight to Baringa included.",
  alternates: { canonical: URL_ },
  openGraph: {
    title: "Marquis Vanities Sunshine Coast | OnWood Tiles",
    description: "Build a Marquis vanity in 3D with live prices: made to order in Australia, with freight to our Baringa warehouse included.",
    url: URL_,
    type: "website",
  },
};

// Express ranges leave the Marquis factory within 5 business days (with Symphony or moulded tops).
const EXPRESS = ["marquis-shore-vanity", "marquis-cove-vanity", "marquis-pier-vanity", "marquis-marq-vanity", "marquis-marq-compact-vanity"];

const WARRANTY: [string, string][] = [
  ["Vanity cabinets and hardware", "Lifetime"],
  ["Silestone tops", "25 years"],
  ["Dekton tops", "15 years"],
  ["Caesarstone, Symphony and Monaco Grande tops", "10 years"],
  ["Timber tops", "7 years"],
  ["Marquis acrylic tops", "Lifetime"],
  ["Polymarble and ceramic basins", "2 years"],
  ["Solid surface basins", "1 year"],
  ["Mirrors and shaving cabinet doors", "1 year"],
  ["LED strip lighting", "3 years"],
];

const FAQS = [
  { q: "Where can I buy Marquis vanities on the Sunshine Coast?", a: `From OnWood Tiles in ${SHOP.suburb}. Every Marquis vanity, basin and mirror on our website shows a price, and you can build your vanity online, add it to a quote list and we confirm the details with you before anything is ordered.` },
  { q: "Who makes Marquis vanities?", a: "Marquis is a family-owned Australian manufacturer, first established in 1979 in the NSW Hunter Valley. Its vanities are made to order to the size, layout, benchtop, basin, finish and handles you choose." },
  { q: "How long does a Marquis vanity take?", a: "Most Marquis vanities take around 3 to 4 weeks to be made and delivered to our Baringa warehouse, and stone or timber tops can take a little longer. Express ranges (Shore, Cove, Pier, Marq and Marq Compact with Symphony or moulded tops) usually leave the factory within 5 business days. We confirm a realistic timeframe on your quote." },
  { q: "Can I see the price before I order?", a: "Yes. The builder on each vanity page updates the price as you choose the size, layout, benchtop, basin, colour and handles, and you can view your build in 3D before adding it to your quote list. Prices include GST." },
  { q: "Can I get a wall-hung vanity, legs or LED lighting?", a: "Most ranges come wall-hung or on a kickboard, many can sit on legs instead, and LED strip lighting is available under many wall-hung vanities. The builder only shows the options each range offers." },
  { q: "What warranty do Marquis vanities have?", a: "Marquis vanity cabinets and hardware carry a lifetime warranty against manufacturing faults. Benchtops are covered for 7 to 25 years depending on the material, basins for 1 to 2 years, mirrors and shaving cabinet doors for 1 year and LED lighting for 3 years (1 year for commercial use). Installation by a licensed tradesperson is required." },
  { q: "Do you deliver Marquis vanities?", a: "Freight from Marquis to our Baringa warehouse is included in the price. You can collect from us or we can deliver to your home or site across the Sunshine Coast for a delivery fee, quoted with your order. We supply only and do not install." },
];

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" };
const h2: React.CSSProperties = { fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" };
const body: React.CSSProperties = { fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "64ch", margin: "0 0 22px" };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 };
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

const isMarquis = (r: WebsiteRange) => r.slug.startsWith("marquis-");
const money = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;

async function marquis(department: string) {
  try { return (await listRanges({ department })).filter(isMarquis); } catch { return []; }
}

export default async function MarquisBrandPage() {
  const [vanities, basins, mirrors] = await Promise.all([marquis("vanities"), marquis("basins"), marquis("mirrors")]);
  const express = EXPRESS.map((s) => vanities.find((r) => r.slug === s)).filter((r): r is WebsiteRange => !!r);
  const from = vanities.map((r) => r.price).filter((p): p is number => typeof p === "number" && p > 0);
  const priceFrom = from.length ? Math.min(...from) : null;
  const heroRange = vanities.find((r) => r.heroImage) ?? null;
  const heroImg = heroRange?.heroImage ?? null;
  const builderHref = `/product/${(express[0] ?? vanities[0])?.slug ?? "marquis-shore-vanity"}/3d`;
  const all = [...vanities, ...basins, ...mirrors];

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Marquis vanities, basins and mirrors on the Sunshine Coast",
    url: URL_,
    about: { "@type": "Brand", name: "Marquis" },
    provider: { "@type": "HomeGoodsStore", name: "OnWood Tiles", url: SITE, address: { "@type": "PostalAddress", addressLocality: SHOP.suburb, addressRegion: SHOP.state, postalCode: SHOP.postcode, addressCountry: "AU" } },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: all.length,
      itemListElement: all.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/product/${r.slug}`, name: r.name })),
    },
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
      { "@type": "ListItem", position: 2, name: "Vanities", item: `${SITE}/shop/vanities` },
      { "@type": "ListItem", position: 3, name: "Marquis", item: URL_ },
    ],
  };
  const ld = (o: object) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, "\\u003c") }} />;

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {ld(collectionLd)}
      {ld(faqLd)}
      {ld(breadcrumbLd)}
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/shop/vanities" style={{ color: "inherit", textDecoration: "none" }}>Vanities</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Marquis</span>
        </nav>

        {/* HERO */}
        <section className="mq-hero">
          <div style={{ minWidth: 0 }}>
            <p style={eyebrow}>Marquis on the Sunshine Coast</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-.02em", lineHeight: 1.05, margin: "12px 0 16px" }}>
              Marquis vanities, basins and mirrors
            </h1>
            <p style={{ ...body, fontSize: 16.5, margin: "0 0 12px" }}>
              Marquis is a family-owned Australian maker of bathroom furniture, established in 1979 in the NSW Hunter Valley. Every Marquis vanity is made to order to the size, layout, benchtop, basin, colour and handles you choose.
            </p>
            <p style={{ ...body, fontSize: 16.5 }}>
              OnWood Tiles supplies the Marquis range from {SHOP.suburb} on the Sunshine Coast. Build your vanity online with the price updating as you go{priceFrom ? ` (vanities from ${money(priceFrom)} including GST)` : ""}, see it in 3D, then send it to us as a quote request. Freight to our Baringa warehouse is included.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <a href="#vanities" style={ctaSolid}>See the vanity ranges <span aria-hidden>→</span></a>
              <Link href={builderHref} style={ctaOutline}>Build one in 3D <span aria-hidden>→</span></Link>
            </div>
          </div>
          {heroImg && (
            <div className="mq-hero-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="mq-hero-img" src={rs(heroImg, 1080)} alt={`${heroRange!.name} by Marquis`} fetchPriority="high" />
            </div>
          )}
        </section>

        {/* Key facts */}
        <section className="mq-facts" style={{ marginTop: 44 }}>
          {[
            [`${vanities.length || "30+"} vanity ranges`, "Wall-hung, floor-standing and on legs, from compact powder rooms to double-basin ensuites."],
            ["Made to order", "Your size, layout, benchtop, basin, cabinet colour and handles, built for your bathroom."],
            ["Lifetime cabinet warranty", "Marquis covers vanity cabinets and hardware for life against manufacturing faults."],
            ["3 to 4 weeks", "Typical make and freight time to Baringa. Express ranges leave the factory within 5 business days."],
          ].map(([t, d]) => (
            <div key={t} className="mq-fact">
              <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, margin: "0 0 6px" }}>{t}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#3a444a", margin: 0 }}>{d}</p>
            </div>
          ))}
        </section>

        {/* Vanities */}
        {vanities.length > 0 && (
          <section id="vanities" style={{ marginTop: 60, scrollMarginTop: 110 }}>
            <p style={eyebrow}>Build your own</p>
            <h2 style={h2}>Marquis vanity ranges</h2>
            <p style={body}>
              Each range has its own builder: pick the size and layout, then the benchtop, basin, cabinet colour and handles, and the price updates as you go. Open the 3D view to see your vanity before you send it to us.
            </p>
            <div style={grid}>{vanities.map((r) => <RangeCard key={r.id} range={r} />)}</div>
          </section>
        )}

        {/* Express */}
        {express.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <div style={{ borderRadius: 24, padding: "clamp(26px,4vw,40px)", background: "var(--surface)", border: "1px solid var(--line)" }}>
              <p style={eyebrow}>Need it sooner?</p>
              <h2 style={h2}>Marquis Express vanities</h2>
              <p style={body}>
                With a Symphony or moulded top, these ranges usually leave the Marquis factory within 5 business days, a good fit for a renovation that is already underway.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                {express.map((r) => <Link key={r.slug} href={`/product/${r.slug}`} style={pill}>{r.name.replace(/^Marquis /, "")}</Link>)}
              </div>
            </div>
          </section>
        )}

        {/* Basins */}
        {basins.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <p style={eyebrow}>Finish the top</p>
            <h2 style={h2}>Marquis basins</h2>
            <p style={body}>Above-counter, semi-inset and under-counter basins to pair with your vanity top, or to use on their own.</p>
            <div style={grid}>{basins.map((r) => <RangeCard key={r.id} range={r} />)}</div>
          </section>
        )}

        {/* Mirrors */}
        {mirrors.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <p style={eyebrow}>Above the vanity</p>
            <h2 style={h2}>Marquis mirrors and shaving cabinets</h2>
            <p style={body}>Mirrors and shaving cabinets sized to sit with your Marquis vanity.</p>
            <div style={grid}>{mirrors.map((r) => <RangeCard key={r.id} range={r} />)}</div>
          </section>
        )}

        {/* How it works + warranty */}
        <section className="mq-two" style={{ marginTop: 60 }}>
          <div>
            <p style={eyebrow}>How it works</p>
            <h2 style={h2}>Ordering a Marquis vanity from us</h2>
            <ol style={{ ...body, paddingLeft: 20, margin: 0 }}>
              <li><strong>Build it online.</strong> Choose your range, size, top, basin, colour and handles, and check it in 3D.</li>
              <li><strong>Add it to your quote list.</strong> We check every detail with you, so nothing is ordered until you are happy.</li>
              <li><strong>Made for you.</strong> Marquis builds it to order, usually in 3 to 4 weeks, with freight to Baringa included.</li>
              <li><strong>Collect or delivery.</strong> Pick it up from {SHOP.suburb} or we deliver across the Sunshine Coast for a quoted fee. Installation must be by a licensed tradesperson.</li>
            </ol>
          </div>
          <div>
            <p style={eyebrow}>Peace of mind</p>
            <h2 style={h2}>Marquis warranty</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5 }}>
              <tbody>
                {WARRANTY.map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "9px 0", color: "#3a444a" }}>{k}</td>
                    <td style={{ padding: "9px 0", textAlign: "right", fontWeight: 700 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 13, color: "#8a8577", margin: "10px 0 0" }}>Commercial use: 1 year on all products. Warranty is provided by Marquis against manufacturing faults.</p>
          </div>
        </section>

        {/* The Vanity Edition magazine */}
        <section style={{ marginTop: 60 }}>
          <Link href="/magazines/vanity-edition" style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: "clamp(18px,3vw,34px)", alignItems: "center", textDecoration: "none", color: "inherit", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "clamp(18px,3vw,30px)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/magazines/vanity-edition-cover.webp" alt="Kiln: The Vanity Edition cover" loading="lazy" style={{ width: "clamp(96px,16vw,150px)", height: "auto", borderRadius: 6, transform: "rotate(-2deg)", boxShadow: "0 24px 40px -20px rgba(0,0,0,.55)" }} />
            <span>
              <span style={eyebrow}>Our magazine</span>
              <span style={{ ...h2, display: "block", margin: "6px 0 8px" }}>Kiln: The Vanity Edition</span>
              <span style={{ ...body, display: "block", margin: "0 0 10px" }}>Sizes, handles, benchtops, basins and the Duragrain, Thermograin and painted finishes explained, in 40 pages. Flick through it online or download a copy.</span>
              <span style={{ fontWeight: 800, color: "var(--accent)" }}>Read the Vanity Edition →</span>
            </span>
          </Link>
        </section>

        {/* Areas */}
        <section style={{ marginTop: 60 }}>
          <p style={eyebrow}>Delivered across the Coast</p>
          <h2 style={h2}>Marquis vanities for Sunshine Coast homes</h2>
          <p style={body}>
            We supply Marquis vanities for bathrooms and ensuites right across the Sunshine Coast, from Caloundra and Kawana to Maroochydore, Buderim and the hinterland.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {SUBURB_LIST.map((s) => <Link key={s.slug} href={`/tile-shop/${s.slug}`} style={pill}>{s.name}</Link>)}
          </div>
        </section>

        {/* Visit band */}
        <section style={{ marginTop: 60 }}>
          <div className="mq-band" style={{ borderRadius: 24, padding: "clamp(28px,4vw,46px)", background: "var(--ink)", color: "#fff6ee" }}>
            <div>
              <h2 style={{ ...h2, color: "#fff6ee", margin: "0 0 12px" }}>Questions about a Marquis vanity?</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,246,238,.82)", maxWidth: "52ch", margin: "0 0 10px" }}>
                Talk to us about sizes, tops and finishes, or send your build as a quote request and we will come back to you.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,246,238,.72)", margin: 0 }}>{SHOP.name}, {showroomAddress()}. {SHOP.email}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "center" }}>
              <Link href="/contact" style={{ ...ctaSolid, justifyContent: "center" }}>Contact us <span aria-hidden>→</span></Link>
              <Link href="/book" style={{ ...ctaSolid, justifyContent: "center", background: "rgba(255,246,238,.1)", border: "1px solid rgba(255,246,238,.24)", boxShadow: "none" }}>Book a visit <span aria-hidden>→</span></Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginTop: 60, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
          <h2 style={{ ...h2, margin: "0 0 20px" }}>Marquis vanities, your questions</h2>
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
          <p style={{ fontSize: 14, color: "#8a8577", marginTop: 20 }}>
            More answers in our <Link href="/faq" style={{ color: "var(--accent)" }}>FAQ</Link> and <Link href="/terms-of-sale" style={{ color: "var(--accent)" }}>Terms of Sale</Link>.
          </p>
        </section>

        <style>{`
          .ow-faq > summary::-webkit-details-marker { display: none; }
          .ow-faq[open] .ow-faq-plus { transform: rotate(45deg); }
          .mq-hero { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; margin: 4px 0 0; }
          .mq-hero-frame { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 24px 60px -34px rgba(30,20,10,.5); background: #fff; aspect-ratio: 4 / 3; min-width: 0; }
          .mq-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
          .mq-facts { display: grid; grid-template-columns: 1fr; gap: 14px; }
          .mq-fact { padding: 20px 22px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
          .mq-two { display: grid; grid-template-columns: 1fr; gap: 40px; }
          .mq-band { display: grid; grid-template-columns: 1fr; gap: 22px; }
          @media (min-width: 640px) { .mq-facts { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 900px) {
            .mq-hero { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); column-gap: clamp(28px, 4vw, 52px); align-items: center; }
            .mq-facts { grid-template-columns: repeat(4, 1fr); }
            .mq-two { grid-template-columns: 1.2fr 1fr; gap: 56px; }
            .mq-band { grid-template-columns: minmax(0, 1.4fr) minmax(0, auto); align-items: center; gap: 40px; }
          }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
