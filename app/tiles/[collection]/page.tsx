import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { RangeCard } from "../../components/shop/shared";
import { listRanges, type WebsiteRange } from "../../../lib/onbase/client";
import { getCollection, COLLECTION_LIST, SHOP, type TileCollection } from "../../../lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";

type Params = { collection: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { collection } = await params;
  const c = await getCollection(collection);
  if (!c) return { title: "Tile collections | OnWood Tiles" };
  const url = `${SITE}/tiles/${c.slug}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url, type: "website" },
  };
}

// Match a live range to a collection: by a filter group/value, or by a keyword in
// the product name (looks with no filter, e.g. timber-look). Kept lenient so a page
// never sits empty, but specific enough that the grid stays genuinely on-theme.
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
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--accent)",
};

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { collection } = await params;
  const c = await getCollection(collection);
  if (!c) notFound();

  // Real products for this collection, pulled live. Fail-open to an empty grid.
  let products: WebsiteRange[] = [];
  try {
    const all = await listRanges({ department: "tiles" });
    products = all
      .filter((r) => matches(c, r))
      .map((r, i) => ({ r, i, score: r.swatches.some((s) => s.installedImage) ? 1 : 0 }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((x) => x.r)
      .slice(0, 12);
  } catch {
    products = [];
  }

  const heroImg =
    products.map((r) => r.swatches.find((s) => s.installedImage)?.installedImage).find(Boolean) ||
    products.map((r) => r.heroImage).find(Boolean) ||
    null;
  const heroRange = products[0] ?? null;

  const address = `${SHOP.street}, ${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`;
  // Other collections (for the "more collections" strip), this one excluded.
  const others = COLLECTION_LIST.filter((x) => x.slug !== c.slug);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${c.name} | OnWood Tiles`,
    description: c.metaDescription,
    url: `${SITE}/tiles/${c.slug}`,
    isPartOf: { "@type": "WebSite", name: "OnWood Tiles", url: SITE },
    about: c.name,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Tiles", item: `${SITE}/tiles` },
      { "@type": "ListItem", position: 3, name: c.name, item: `${SITE}/tiles/${c.slug}` },
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
    display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999,
    background: "var(--surface)", border: "1px solid var(--line)", fontSize: 13.5, fontWeight: 700, color: "var(--ink)",
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/tiles" style={{ color: "inherit", textDecoration: "none" }}>Tiles</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{c.name}</span>
        </nav>

        {/* HERO */}
        <section className="tc-hero">
          <div style={{ minWidth: 0 }}>
            <p style={eyebrow}>{c.eyebrow}</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-.02em", lineHeight: 1.05, margin: "12px 0 16px" }}>
              {c.name}
            </h1>
            {c.intro.map((para, i) => (
              <p key={i} style={{ fontSize: 16.5, lineHeight: 1.7, color: "#3a444a", margin: "0 0 12px", maxWidth: "60ch" }}>{para}</p>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "20px 0 4px" }}>
              <span style={pill}>Prices on every tile</span>
              <span style={pill}>Order online or in store</span>
              <span style={pill}>Sunshine Coast delivery</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
              <Link href={c.shopHref} style={ctaSolid}>Browse in the shop <span aria-hidden>→</span></Link>
              <Link href="/book" style={ctaOutline}>Book a showroom visit <span aria-hidden>→</span></Link>
            </div>
          </div>
          {heroImg && (
            <div className="tc-hero-media">
              <div className="tc-hero-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="tc-hero-img" src={heroImg} alt={`${c.name} styled in a Sunshine Coast home by OnWood Tiles`} />
              </div>
              {heroRange && (
                <Link href={`/product/${heroRange.slug}`} style={{ position: "absolute", left: 14, top: 14, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,246,238,.94)", color: "var(--ink)", textDecoration: "none", fontWeight: 700, fontSize: 12.5, padding: "7px 13px", borderRadius: 999, boxShadow: "0 6px 18px -8px rgba(30,20,10,.5)" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)" }}>In focus</span>
                  {heroRange.name}
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Guidance */}
        <section style={{ marginTop: 60 }}>
          <p style={eyebrow}>Choosing well</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
            The right {c.name.toLowerCase()} for the job
          </h2>
          {c.guidanceIntro && (
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 26px" }}>{c.guidanceIntro}</p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 18 }}>
            {c.guidance.map((g) => (
              <div key={g.title} style={{ border: "1px solid var(--line)", borderRadius: 18, background: "var(--surface)", padding: "24px 24px 22px", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, letterSpacing: "-.01em", lineHeight: 1.2, margin: "0 0 10px" }}>{g.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#5a6067", margin: "0 0 16px", flex: 1 }}>{g.body}</p>
                <Link href={g.href} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "var(--accent)", textDecoration: "none", alignSelf: "flex-start" }}>
                  {g.hrefLabel} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Product grid */}
        {products.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <p style={eyebrow}>In our range</p>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
              {c.name} in our range
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 26px" }}>
              A selection from the range, each a real OnWood product with a price. See the full choice in the shop.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
              {products.map((r) => (<RangeCard key={r.id} range={r} />))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href={c.shopHref} style={ctaOutline}>See all {c.name.toLowerCase()} <span aria-hidden>→</span></Link>
            </div>
          </section>
        )}

        {/* FAQ */}
        {c.faqs.length > 0 && (
          <section style={{ marginTop: 64, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "0 0 20px" }}>
              {c.name}, your questions
            </h2>
            <div style={{ maxWidth: 820 }}>
              {c.faqs.map((f, i) => (
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
        )}

        {/* Related collections + areas */}
        <section style={{ marginTop: 64, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
          <p style={eyebrow}>Keep exploring</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(22px,2.6vw,30px)", letterSpacing: "-.02em", margin: "10px 0 16px" }}>
            More ways to shop
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {c.related.map((r) => (
              <Link key={r.href} href={r.href} style={{ ...pill, textDecoration: "none" }}>{r.label}</Link>
            ))}
            {others.map((o) => (
              <Link key={o.slug} href={`/tiles/${o.slug}`} style={{ ...pill, textDecoration: "none" }}>{o.name}</Link>
            ))}
          </div>
        </section>

        {/* Delivery + showroom band */}
        <section style={{ marginTop: 60 }}>
          <div style={{ borderRadius: 24, padding: "clamp(28px,4vw,46px)", background: "var(--ink)", color: "#fff6ee" }}>
            <div className="tc-band">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,246,238,.6)", margin: "0 0 12px" }}>Delivery &amp; showroom</p>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 820, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", lineHeight: 1.1, margin: "0 0 14px" }}>
                  Local delivery across the Sunshine Coast
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,246,238,.82)", maxWidth: "52ch", margin: "0 0 10px" }}>
                  Order online for delivery from our Baringa base, or collect in store. Tell us your suburb for a delivery quote. We supply tiles only and do not install.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,246,238,.72)", margin: 0 }}>
                  {SHOP.name}, {address}<br />Open {SHOP.hours}. {SHOP.email}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "center" }}>
                <Link href="/book" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999 }}>Book a visit <span aria-hidden>→</span></Link>
                <Link href="/tile-shop" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,246,238,.1)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999, border: "1px solid rgba(255,246,238,.24)" }}>Areas we service <span aria-hidden>→</span></Link>
              </div>
            </div>
          </div>
        </section>

        <style>{`
          .ow-faq > summary::-webkit-details-marker { display: none; }
          .ow-faq[open] .ow-faq-plus { transform: rotate(45deg); }
          .tc-hero { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; margin: 4px 0 0; }
          .tc-hero-media { position: relative; min-width: 0; }
          .tc-hero-frame { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 24px 60px -34px rgba(30,20,10,.5); background: #fff; aspect-ratio: 4 / 3; }
          .tc-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
          .tc-band { display: grid; grid-template-columns: 1fr; gap: 22px; }
          @media (min-width: 900px) {
            .tc-hero { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); column-gap: clamp(28px, 4vw, 52px); align-items: center; }
            .tc-band { grid-template-columns: minmax(0, 1.4fr) minmax(0, auto); align-items: center; gap: 40px; }
          }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
