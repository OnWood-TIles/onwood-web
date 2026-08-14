import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { RangeCard } from "../../components/shop/shared";
import { listRanges, type WebsiteRange } from "../../../lib/onbase/client";
import { getSuburb, SHOP } from "../../../lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";

type Params = { suburb: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { suburb } = await params;
  const s = await getSuburb(suburb);
  if (!s) return { title: "Areas we service | OnWood Tiles" };
  const url = `${SITE}/tile-shop/${s.slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      url,
      type: "website",
    },
  };
}

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--accent)",
};

// Small inline icons for the value band (stroke = currentColor so they inherit).
function Icon({ name }: { name: "truck" | "pin" | "coast" }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "truck")
    return (
      <svg {...common}>
        <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    );
  if (name === "pin")
    return (
      <svg {...common}>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.4" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M3 15c2 0 2-1.6 4-1.6S9 15 11 15s2-1.6 4-1.6S17 15 19 15" />
      <path d="M3 19c2 0 2-1.6 4-1.6S9 19 11 19s2-1.6 4-1.6S17 19 19 19" />
      <path d="M12 3v5M9.5 5.5 12 8l2.5-2.5" />
    </svg>
  );
}

export default async function SuburbPage({ params }: { params: Promise<Params> }) {
  const { suburb } = await params;
  const s = await getSuburb(suburb);
  if (!s) notFound();

  // Curated products for "Popular for {name}". Fail-open: any error -> empty
  // list -> the section simply hides. Prefer ranges with a real installed room
  // shot and/or an outdoor tag, since those suit coastal homes and look best.
  let popular: WebsiteRange[] = [];
  try {
    const all = await listRanges({ department: "tiles" });
    const bySlug = new Map(all.map((r) => [r.slug, r]));
    // Curated picks for this suburb come first (ordered), so each area shows a
    // genuinely different, on-character set - browns/wood-look for Buderim,
    // affordable 450s for Harmony, coastal large-format for Pelican Waters, etc.
    const curated = (s.popularSlugs ?? [])
      .map((sl) => bySlug.get(sl))
      .filter((r): r is WebsiteRange => Boolean(r));
    const chosen = new Set(curated.map((r) => r.slug));
    // Backfill to ~8 with auto-picked tiles (a real room shot + outdoor rating
    // look best), so the grid is always full even if a curated slug is missing.
    const hasRoom = (r: WebsiteRange) => r.swatches.some((sw) => sw.installedImage);
    const isOutdoor = (r: WebsiteRange) =>
      (r.filters?.["location-use"]?.includes("outdoor") ?? false) || r.categories.includes("outdoor");
    const auto = [...all]
      .map((r, i) => ({ r, i, score: (hasRoom(r) ? 2 : 0) + (isOutdoor(r) ? 1 : 0) }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((x) => x.r)
      .filter((r) => !chosen.has(r.slug));
    popular = [...curated, ...auto].slice(0, 8);
    if (popular.length === 0) popular = all.slice(0, 6);
  } catch {
    popular = [];
  }

  // Hero image: the first curated product's installed room shot, else any range
  // hero, else null (hero media block hides). Presentational only.
  const heroImg =
    popular.map((r) => r.swatches.find((sw) => sw.installedImage)?.installedImage).find(Boolean) ||
    popular.map((r) => r.heroImage).find(Boolean) ||
    null;
  const heroRange = popular[0] ?? null;

  const address = `${SHOP.street}, ${SHOP.suburb} ${SHOP.state} ${SHOP.postcode}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `OnWood Tiles, ${address}`,
  )}`;

  const chips = [
    { icon: "truck" as const, label: `Delivery to ${s.name}` },
    { icon: "pin" as const, label: s.proximityChip ?? `~${s.driveMins} min from Baringa` },
    { icon: "coast" as const, label: "Supply only" },
  ];

  const valueCards = [
    {
      icon: "truck" as const,
      title: `Delivery to ${s.name}`,
      body: `We deliver right across ${s.name}, just tell us your suburb for a delivery quote, or collect from Baringa. Ask us about any current delivery deals.`,
    },
    {
      icon: "pin" as const,
      title: s.proximityCard?.title ?? `About ${s.driveMins} minutes away`,
      body: s.proximityCard?.body ?? `Our Baringa showroom is a short drive via ${s.driveVia}, so it is easy to see full-size boards and take samples home before you commit.`,
    },
    {
      icon: "coast" as const,
      title: "Coastal-home expertise",
      body: `We know what stands up to salt air, humidity and the Queensland light, and which finishes suit relaxed ${s.name} homes.`,
    },
  ];

  // ── JSON-LD (same in-page <script> technique as the department page) ──
  const businessLd = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: "OnWood Tiles",
    url: `${SITE}/tile-shop/${s.slug}`,
    email: SHOP.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP.street,
      addressLocality: SHOP.suburb,
      addressRegion: SHOP.state,
      postalCode: SHOP.postcode,
      addressCountry: "AU",
    },
    areaServed: { "@type": "City", name: s.name },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Areas we service", item: `${SITE}/tile-shop` },
      { "@type": "ListItem", position: 3, name: s.name, item: `${SITE}/tile-shop/${s.slug}` },
    ],
  };

  const ctaSolid: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--accent)",
    color: "#fff6ee",
    fontWeight: 800,
    fontSize: 15.5,
    textDecoration: "none",
    padding: "14px 26px",
    borderRadius: 999,
    boxShadow: "0 16px 40px -22px rgba(208,106,69,.7)",
  };
  const ctaOutline: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    color: "var(--ink)",
    fontWeight: 800,
    fontSize: 15.5,
    textDecoration: "none",
    padding: "14px 26px",
    borderRadius: 999,
    border: "1px solid var(--line)",
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        {/* ── Breadcrumb ── */}
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/tile-shop" style={{ color: "inherit", textDecoration: "none" }}>Areas we service</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.name}</span>
        </nav>

        {/* ── HERO ── */}
        <section className="ts-hero">
          <div className="ts-hero-text">
            <p style={eyebrow}>Sunshine Coast · Areas we service</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-.02em", lineHeight: 1.05, margin: "12px 0 16px" }}>
              Tile Shop {s.name}
            </h1>
            {s.intro.map((para, i) => (
              <p key={i} style={{ fontSize: 16.5, lineHeight: 1.7, color: "#3a444a", margin: "0 0 12px", maxWidth: "60ch" }}>
                {para}
              </p>
            ))}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "20px 0 4px" }}>
              {chips.map((c) => (
                <span key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
                  <span style={{ color: "var(--accent)", display: "inline-flex" }}><Icon name={c.icon} /></span>
                  {c.label}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
              <Link href="/book" style={ctaSolid}>Book a showroom visit <span aria-hidden>→</span></Link>
              <Link href="/shop/tiles" style={ctaOutline}>Browse tiles <span aria-hidden>→</span></Link>
            </div>
          </div>

          {heroImg && (
            <div className="ts-hero-media">
              <div className="ts-hero-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ts-hero-img" src={heroImg} alt={`Tiles styled in a ${s.name} home by OnWood Tiles, Sunshine Coast`} />
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

        {/* ── Why us value band ── */}
        <section style={{ marginTop: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            {valueCards.map((v) => (
              <div key={v.title} style={{ border: "1px solid var(--line)", borderRadius: 18, background: "var(--surface)", padding: "22px 22px 20px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 12, background: "color-mix(in oklab, var(--accent) 13%, transparent)", color: "var(--accent)" }}>
                  <Icon name={v.icon} />
                </span>
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, letterSpacing: "-.01em", margin: "14px 0 8px" }}>{v.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6067", margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Guidance: tiles that suit these homes ── */}
        <section style={{ marginTop: 64 }}>
          <p style={eyebrow}>The right tiles for the postcode</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
            Tiles that suit {s.name} homes
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 26px" }}>
            {s.guidanceIntro ?? "A few honest pointers from people who fit tiles to Sunshine Coast homes every day. Follow a link to browse the exact range."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 18 }}>
            {s.guidance.map((g) => (
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

        {/* ── Popular for {name} ── */}
        {popular.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <p style={eyebrow}>A good place to start</p>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "10px 0 6px" }}>
              Popular for {s.name}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 26px" }}>
              {s.popularIntro ?? `Hard-wearing, coastal-friendly tiles our ${s.name} customers reach for. Every one is a real OnWood product with live availability.`}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
              {popular.map((r) => (
                <RangeCard key={r.id} range={r} />
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href="/shop/tiles" style={ctaOutline}>Browse all tiles <span aria-hidden>→</span></Link>
            </div>
          </section>
        )}

        {/* ── Delivery + showroom band (dark ground) ── */}
        <section style={{ marginTop: 66 }}>
          <div style={{ borderRadius: 24, padding: "clamp(28px,4vw,46px)", background: "var(--ink)", color: "#fff6ee" }}>
            <div className="ts-band">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,246,238,.6)", margin: "0 0 12px" }}>
                  Delivery &amp; showroom
                </p>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 820, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", lineHeight: 1.1, margin: "0 0 14px" }}>
                  We deliver to {s.name}
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,246,238,.82)", maxWidth: "52ch", margin: "0 0 10px" }}>
                  {s.deliveryLine ?? `We deliver across ${s.name}, or you can collect from the showroom. Tell us your suburb for a delivery quote, we are about ${s.driveMins} minutes south via ${s.driveVia}.`}
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,246,238,.72)", margin: 0 }}>
                  {SHOP.name}, {address}
                  <br />
                  Open {SHOP.hours}. {SHOP.email}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "center" }}>
                <Link href="/book" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999 }}>
                  Book a visit <span aria-hidden>→</span>
                </Link>
                <a href={directionsUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,246,238,.1)", color: "#fff6ee", fontWeight: 800, fontSize: 15.5, textDecoration: "none", padding: "15px 28px", borderRadius: 999, border: "1px solid rgba(255,246,238,.24)" }}>
                  Get directions <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        {s.faqs.length > 0 && (
          <section style={{ marginTop: 64, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "0 0 20px" }}>
              Tile shop {s.name}, your questions
            </h2>
            <div style={{ maxWidth: 820 }}>
              {s.faqs.map((f, i) => (
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

        {/* ── Areas we service ── */}
        <section style={{ marginTop: 64, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
          <p style={eyebrow}>Nearby</p>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(22px,2.6vw,30px)", letterSpacing: "-.02em", margin: "10px 0 8px" }}>
            Areas we service around {s.name}
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 20px" }}>
            We deliver to {s.name} and surrounding suburbs, including:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {s.nearby.map((n) => (
              <span key={n} style={{ padding: "7px 15px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
                {n}
              </span>
            ))}
            <span style={{ padding: "7px 15px", borderRadius: 999, background: "transparent", border: "1px dashed var(--line)", fontSize: 13.5, fontWeight: 700, color: "#8a8577" }}>
              and surrounding suburbs
            </span>
          </div>
          <div style={{ marginTop: 22 }}>
            <Link href="/tile-shop" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "var(--accent)", textDecoration: "none" }}>
              See all areas we service <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* ── Closing CTA row ── */}
        <section style={{ marginTop: 62 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 18 }}>
            {[
              { name: "Showroom", tagline: "See the finishes in the flesh", body: s.showroomLine ?? `Full-size boards, big-format samples and a coffee. About ${s.driveMins} minutes from ${s.name}.`, cta: "Book a visit", href: "/book" },
              { name: "Tile calculator", tagline: "How many boxes will you need?", body: "Give us your square metres, we will add the cuts and wastage for your job.", cta: "Work out my order", href: "/calculator" },
              { name: "Talk to us", tagline: "Choosing tiles for a project?", body: "Tell us about your build or reno and we will point you at the right finishes.", cta: "Get in touch", href: "/contact" },
            ].map((u) => (
              <Link key={u.href} href={u.href} className="ow-util" style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", border: "1px solid var(--line)", borderRadius: 18, background: "var(--surface)", padding: "24px 24px 22px" }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)" }}>{u.name}</span>
                <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, letterSpacing: "-.01em", lineHeight: 1.2, margin: "10px 0 8px", color: "var(--ink)" }}>{u.tagline}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6067", flex: 1 }}>{u.body}</span>
                <span style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "var(--accent)" }}>{u.cta} <span aria-hidden>→</span></span>
              </Link>
            ))}
          </div>
        </section>

        <style>{`
          .ow-faq > summary::-webkit-details-marker { display: none; }
          .ow-faq[open] .ow-faq-plus { transform: rotate(45deg); }
          .ow-util { transition: transform .2s ease, box-shadow .2s ease; }
          .ow-util:hover { transform: translateY(-3px); box-shadow: 0 24px 44px -28px rgba(32,48,58,.5); }

          .ts-hero { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; margin: 4px 0 0; }
          .ts-hero-text { min-width: 0; }
          .ts-hero-media { position: relative; min-width: 0; }
          .ts-hero-frame { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 24px 60px -34px rgba(30,20,10,.5); background: #fff; aspect-ratio: 4 / 3; }
          .ts-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
          .ts-band { display: grid; grid-template-columns: 1fr; gap: 22px; }
          @media (min-width: 900px) {
            .ts-hero { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); column-gap: clamp(28px, 4vw, 52px); align-items: center; }
            .ts-hero-frame { aspect-ratio: 4 / 3; }
            .ts-band { grid-template-columns: minmax(0, 1.4fr) minmax(0, auto); align-items: center; gap: 40px; }
          }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
