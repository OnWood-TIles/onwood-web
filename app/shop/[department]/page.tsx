import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getTaxonomy, getFilterGroups, listRanges } from "../../../lib/onbase/client";
import { buildFilterGroupVMs, parseActiveFilters } from "../../../lib/shopFilters";
import { getDepartmentSeo } from "../../../lib/content";
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
            {deptHero && (
              <div style={{ flex: "1 1 300px", maxWidth: 460 }}>
                <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4 / 3", border: "1px solid var(--line)", boxShadow: "0 24px 60px -34px rgba(30,20,10,.5)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={deptHero} alt={`${dept.label} styled in a room by OnWood Tiles, Sunshine Coast`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              </div>
            )}
          </section>
        ) : (
          <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(30px,4vw,48px)", letterSpacing: "-.02em", margin: "0 0 22px" }}>
            {dept.label}
          </h1>
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
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.02em", margin: "0 0 26px" }}>Frequently asked questions</h2>
            <div style={{ display: "grid", gap: 22, maxWidth: 820 }}>
              {seo.faqs.map((f, i) => (
                <div key={i}>
                  <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 18.5, lineHeight: 1.3, margin: "0 0 7px", color: "var(--ink)" }}>{f.q}</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <MarketingFooter />
    </div>
  );
}
