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
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{dept.label}</span>
        </nav>
        {seo ? (
          <section style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px,4vw,44px)", alignItems: "center", margin: "0 0 30px" }}>
            <div style={{ flex: "1 1 340px", minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 10px" }}>{seo.eyebrow}</p>
              <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(30px,4vw,48px)", letterSpacing: "-.02em", margin: "0 0 16px" }}>
                {seo.h1}
              </h1>
              {seo.intro.map((para, i) => (
                <p key={i} style={{ fontSize: 16.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "62ch", margin: "0 0 12px" }}>{para}</p>
              ))}
            </div>
            {(featuredRoom || featuredFace || deptHero) && (
              <div style={{ flex: "1 1 320px", maxWidth: 480, width: "100%" }}>
                {/* Sample stack: main installed room shot + an overlapping tile plate
                    + an "In focus" chip linking to the (daily-rotating) featured range. */}
                <div style={{ position: "relative", paddingBottom: featuredRoom && featuredFace ? 26 : 0, paddingRight: featuredRoom && featuredFace ? 22 : 0 }}>
                  <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4 / 3", border: "1px solid var(--line)", boxShadow: "0 24px 60px -34px rgba(30,20,10,.5)", background: "#fff" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={(featuredRoom || featuredFace || deptHero) as string} alt={`${dept.label} styled in a room by OnWood Tiles, Sunshine Coast`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  {featuredRoom && featuredFace && (
                    <div style={{ position: "absolute", right: 0, bottom: 0, width: "40%", maxWidth: 178, aspectRatio: "1 / 1", borderRadius: 14, overflow: "hidden", border: "4px solid var(--bg)", boxShadow: "0 16px 34px -18px rgba(30,20,10,.55)", background: "#fff" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featuredFace} alt={featured ? `${featured.name} tile close-up` : ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}
                  {featured && (
                    <Link href={`/product/${featured.slug}`} style={{ position: "absolute", left: 14, top: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,246,238,.94)", color: "var(--ink)", textDecoration: "none", fontWeight: 700, fontSize: 12.5, padding: "7px 13px", borderRadius: 999, boxShadow: "0 6px 18px -8px rgba(30,20,10,.5)" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)" }}>In focus</span>
                      {featured.name}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : (
          <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(30px,4vw,48px)", letterSpacing: "-.02em", margin: "0 0 22px" }}>
            {dept.label}
          </h1>
        )}

        {rangeCount > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 32px", alignItems: "baseline", margin: "0 0 26px" }}>
            {[{ n: rangeCount, l: rangeCount === 1 ? "range" : "ranges" }, { n: colourCount, l: colourCount === 1 ? "colour" : "colours" }].map((s) => (
              <span key={s.l} style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 25, letterSpacing: "-.02em", color: "var(--ink)" }}>{s.n}</span>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#8a8577" }}>{s.l}</span>
              </span>
            ))}
          </div>
        )}

        {seo?.links?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", margin: "0 0 30px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Related:</span>
            {seo.links.map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13.5, fontWeight: 700, color: "var(--accent)", textDecoration: "none", padding: "6px 13px", borderRadius: 99, border: "1px solid var(--line)", background: "var(--surface)" }}>{l.label}</Link>
            ))}
          </div>
        ) : null}

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
          galleryDept={
            /stone|veneer|cladd/i.test(dept.slug) || /stone|veneer|cladd/i.test(dept.label)
              ? "stone"
              : /tile/i.test(dept.slug) || /tile/i.test(dept.label)
                ? "tiles"
                : undefined
          }
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
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
