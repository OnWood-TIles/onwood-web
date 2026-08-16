import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getTaxonomy, getFilterGroups, listRanges } from "../../../lib/onbase/client";
import { buildFilterGroupVMs, parseActiveFilters } from "../../../lib/shopFilters";
import { getDepartmentSeo, SHOP } from "../../../lib/content";
import { DepartmentShop } from "../../components/shop/DepartmentShop";

export const dynamic = "force-dynamic";

type Params = { department: string };
type Search = { c?: string; f?: string | string[] };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { department } = await params;
  const [taxonomy, seo] = await Promise.all([getTaxonomy(), getDepartmentSeo(department)]);
  const dept = taxonomy.find((d) => d.slug === department);
  return {
    // Unique, keyworded title + description per department (SEO); falls back to a
    // simple template for any department without curated copy yet.
    title: seo?.metaTitle ?? (dept ? `${dept.label} | Shop` : "Shop"),
    description:
      seo?.metaDescription ??
      (dept ? `Browse ${dept.label.toLowerCase()} at OnWood Tiles - live availability from our Sunshine Coast showroom.` : undefined),
    alternates: { canonical: `https://onwoodtiles.com.au/shop/${department}` },
  };
}

// Department page: fetches ALL of the department's ranges once, then the client
// filters them instantly (see DepartmentShop) - no server round-trip per tick.
export default async function DepartmentPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { department } = await params;
  const { c, f } = await searchParams;
  const [taxonomy, allFilterGroups, seo] = await Promise.all([getTaxonomy(), getFilterGroups(), getDepartmentSeo(department)]);
  const dept = taxonomy.find((d) => d.slug === department);
  if (!dept) notFound();

  const activeCategory = dept.categories.some((x) => x.slug === c) ? c : undefined;

  const filterGroupsVM = buildFilterGroupVMs(allFilterGroups, department);
  // Initial filters from the URL (?f=group:value), validated against the groups.
  const initialActive = parseActiveFilters(f, filterGroupsVM);

  // All ranges for this department/category - filtered client-side.
  const allRanges = await listRanges({ department, category: activeCategory });

  // Hero for the department intro band: prefer a real "installed" room shot, then a
  // range hero, then any product image. Purely presentational (fails to null).
  const deptHero =
    allRanges.map((r) => r.swatches.find((s) => s.installedImage)?.installedImage).find(Boolean) ||
    allRanges.map((r) => r.heroImage).find(Boolean) ||
    allRanges.map((r) => r.swatches.find((s) => s.image)?.image).find(Boolean) ||
    allRanges.map((r) => r.images?.[0]).find(Boolean) ||
    null;

  // Featured range for the hero "sample stack" - rotates daily (by day number) so
  // it is not always the same product. Prefers a range with a real installed shot.
  const heroCandidates = allRanges.filter((r) => r.swatches.some((s) => s.installedImage));
  const featured = heroCandidates.length
    ? heroCandidates[Math.floor(Date.now() / 86_400_000) % heroCandidates.length]
    : (allRanges[0] ?? null);
  const featuredRoom = featured?.swatches.find((s) => s.installedImage)?.installedImage ?? null;
  const featuredFace = featured?.swatches.find((s) => s.image)?.image ?? null;

  // Real, honest stats for under the hero (no invented numbers).
  const rangeCount = allRanges.length;
  const colourCount = allRanges.reduce((n, r) => n + Math.max(1, r.swatches.length), 0);

  // Tiles/stone departments get a prominent "Search by inspiration" CTA into the gallery.
  const galleryDept: "tiles" | "stone" | undefined =
    /stone|veneer|cladd/i.test(dept.slug) || /stone|veneer|cladd/i.test(dept.label)
      ? "stone"
      : /tile/i.test(dept.slug) || /tile/i.test(dept.label)
        ? "tiles"
        : undefined;

  const labelMap: Record<string, string> = {};
  for (const t of taxonomy) for (const cat of t.categories) labelMap[cat.slug] = cat.label;

  // Only offer filter values that at least one LIVE product here actually carries -
  // no point showing "Oversized" if nothing is tagged Oversized. Empty groups drop out.
  const usedByGroup: Record<string, Set<string>> = {};
  for (const r of allRanges) for (const [g, vals] of Object.entries(r.filters ?? {})) {
    (usedByGroup[g] ??= new Set());
    for (const v of vals) usedByGroup[g].add(v);
  }
  const shownGroups = filterGroupsVM
    .map((g) => ({ ...g, values: g.values.filter((v) => usedByGroup[g.slug]?.has(v.slug)) }))
    .filter((g) => g.values.length > 0);

  const chip = (label: string, href: string, on: boolean) => (
    <Link key={href} href={href} style={{ textDecoration: "none", padding: "8px 18px", borderRadius: 99, fontSize: 14, fontWeight: 700, border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "var(--accent)" : "#fff", color: on ? "#fff6ee" : "var(--ink)", transition: "all .2s ease" }}>
      {label}
    </Link>
  );

  // BreadcrumbList structured data: Home -> Shop -> Department, using absolute
  // URLs. Same in-page <script> technique as app/layout.tsx.
  const SITE = "https://onwoodtiles.com.au";
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE}/shop` },
      { "@type": "ListItem", position: 3, name: dept.label, item: `${SITE}/shop/${dept.slug}` },
    ],
  };
  // CollectionPage (this page is a category listing) + FAQPage (the visible Q&A below).
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${dept.label} | OnWood Tiles`,
    ...(seo?.metaDescription ? { description: seo.metaDescription } : {}),
    url: `${SITE}/shop/${dept.slug}`,
    isPartOf: { "@type": "WebSite", name: "OnWood Tiles", url: SITE },
  };
  const faqLd = seo?.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seo.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

  // Closing utility panels (the trio the design finishes on).
  const UTILITY = [
    { name: "Tile calculator", tagline: "How many boxes will you need?", body: "Give us your square metres, we will add the cuts and wastage.", cta: "Work out my order", href: "/calculator" },
    { name: "Vision board", tagline: "Build the whole room, tile by tile", body: "Tiles, stone, timber and tapware on one live board you can share.", cta: "Start a board", href: "/vision-board" },
    { name: "Baringa showroom", tagline: "See the finishes in the flesh", body: `${SHOP.street}, ${SHOP.suburb}. Drop in for a coffee and a fistful of samples.`, cta: "Book a visit", href: "/book" },
  ];

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd).replace(/</g, "\\u003c") }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }}
        />
      )}
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(92px,10vw,112px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{dept.label}</span>
        </nav>
        <div className="ow-hero">
          <div className="ow-hero-text">
            {seo ? (
              <>
                <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 7px" }}>{seo.eyebrow}</p>
                <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(25px,3.1vw,37px)", letterSpacing: "-.02em", lineHeight: 1.05, margin: "0 0 10px" }}>{seo.h1}</h1>
                {seo.intro.map((para, i) => (
                  <p key={i} style={{ fontSize: 14.5, lineHeight: 1.58, color: "#3a444a", margin: "0 0 8px" }}>{para}</p>
                ))}
              </>
            ) : (
              <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(25px,3.1vw,37px)", letterSpacing: "-.02em", margin: 0 }}>{dept.label}</h1>
            )}
          </div>

          {(featuredRoom || featuredFace || deptHero) && (
            <div className="ow-hero-media">
              {/* Sample stack: main installed room shot + an overlapping tile plate
                  + an "In focus" chip linking to the (daily-rotating) featured range. */}
              <div className="ow-hero-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ow-hero-img" src={(featuredRoom || featuredFace || deptHero) as string} alt={`${dept.label} styled in a room by OnWood Tiles, Sunshine Coast`} />
              </div>
              {featuredRoom && featuredFace && (
                <div className="ow-hero-plate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredFace} alt={featured ? `${featured.name} tile close-up` : ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
              {featured && (
                <Link href={`/product/${featured.slug}`} style={{ position: "absolute", left: 14, top: 14, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,246,238,.94)", color: "var(--ink)", textDecoration: "none", fontWeight: 700, fontSize: 12.5, padding: "7px 13px", borderRadius: 999, boxShadow: "0 6px 18px -8px rgba(30,20,10,.5)" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)" }}>In focus</span>
                  {featured.name}
                </Link>
              )}
            </div>
          )}

          {rangeCount > 0 && (
            <div className="ow-hero-stats">
              {[{ n: rangeCount, l: rangeCount === 1 ? "range" : "ranges" }, { n: colourCount, l: colourCount === 1 ? "colour" : "colours" }].map((s) => (
                <span key={s.l} style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 25, letterSpacing: "-.02em", color: "var(--ink)" }}>{s.n}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#8a8577" }}>{s.l}</span>
                </span>
              ))}
            </div>
          )}

          {galleryDept && (
            <div className="ow-hero-cta">
              <Link href={`/gallery?dept=${galleryDept}`} style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "var(--ink)", color: "#fff6ee", fontWeight: 800, fontSize: 16, textDecoration: "none", padding: "15px 28px", borderRadius: 999, boxShadow: "0 16px 40px -22px rgba(32,48,58,.5)" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
                </svg>
                Search by inspiration <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </div>

        {dept.categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: shownGroups.length ? 18 : 30 }}>
            {chip("Shop All", `/shop/${dept.slug}`, !activeCategory)}
            {dept.categories.map((cat) => chip(cat.label, `/shop/${dept.slug}?c=${cat.slug}`, activeCategory === cat.slug))}
          </div>
        )}

        <DepartmentShop
          allRanges={allRanges}
          groups={shownGroups}
          labelMap={labelMap}
          initialActive={initialActive}
          deptSlug={dept.slug}
          activeCategory={activeCategory}
        />

        {seo?.faqs?.length ? (
          <section style={{ marginTop: 64, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "0 0 20px" }}>Frequently asked questions</h2>
            <div style={{ maxWidth: 820 }}>
              {seo.faqs.map((f, i) => (
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
        ) : null}

        <section style={{ marginTop: 62 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 18 }}>
            {UTILITY.map((u) => (
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

          /* Department hero. Mobile: stacked text -> image -> stats -> button (all
             centered, unchanged). Desktop (>=900px): a narrow text column with the
             stats + button beneath it, and a larger image spanning the full height
             on the right so it lines up with the heading and the button. */
          .ow-hero { display: grid; grid-template-columns: 1fr; grid-template-areas: "text" "media" "stats" "cta"; gap: 16px; align-items: start; margin: 0 0 20px; }
          .ow-hero-text { grid-area: text; min-width: 0; }
          .ow-hero-media { grid-area: media; position: relative; min-width: 0; }
          .ow-hero-frame { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 24px 60px -34px rgba(30,20,10,.5); background: #fff; aspect-ratio: 16 / 10; }
          .ow-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
          .ow-hero-plate { position: absolute; right: 12px; bottom: 12px; z-index: 1; width: 34%; max-width: 168px; aspect-ratio: 1 / 1; border-radius: 14px; overflow: hidden; border: 4px solid var(--bg); box-shadow: 0 16px 34px -18px rgba(30,20,10,.55); background: #fff; }
          .ow-hero-stats { grid-area: stats; display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 32px; align-items: baseline; }
          .ow-hero-cta { grid-area: cta; display: flex; justify-content: center; }
          @media (min-width: 900px) {
            .ow-hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr); grid-template-areas: "text media" "stats media" "cta media"; column-gap: clamp(28px, 4vw, 52px); row-gap: 14px; }
            .ow-hero-media { align-self: stretch; }
            .ow-hero-frame { aspect-ratio: auto; height: 100%; min-height: 200px; }
            .ow-hero-stats { justify-content: flex-start; margin-top: 6px; }
            .ow-hero-cta { justify-content: flex-start; }
          }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
