import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getTaxonomy, listRanges } from "../../../lib/onbase/client";
import { EmptyCatalogue, RangeCard } from "../../components/shop/shared";

export const dynamic = "force-dynamic";

type Params = { department: string };
type Search = { c?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { department } = await params;
  const taxonomy = await getTaxonomy();
  const dept = taxonomy.find((d) => d.slug === department);
  return {
    title: dept ? `${dept.label} | Shop` : "Shop",
    description: dept
      ? `Browse ${dept.label.toLowerCase()} at OnWood Tiles - live availability from our Sunshine Coast showroom.`
      : undefined,
  };
}

// Department page: "Shop All" plus one chip per category, filtering
// server-side so the grid is always shareable via URL (?c=floor).
export default async function DepartmentPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { department } = await params;
  const { c } = await searchParams;
  const taxonomy = await getTaxonomy();
  const dept = taxonomy.find((d) => d.slug === department);
  if (!dept) notFound();

  const activeCategory = dept.categories.some((x) => x.slug === c) ? c : undefined;
  const ranges = await listRanges({ department, category: activeCategory });
  const labelMap: Record<string, string> = {};
  for (const t of taxonomy) for (const c of t.categories) labelMap[c.slug] = c.label;

  const chip = (label: string, href: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      style={{
        textDecoration: "none",
        padding: "8px 18px",
        borderRadius: 99,
        fontSize: 14,
        fontWeight: 700,
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
        background: active ? "var(--accent)" : "#fff",
        color: active ? "#fff6ee" : "var(--ink)",
        transition: "all .2s ease",
      }}
    >
      {label}
    </Link>
  );

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "150px 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>
            Shop
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{dept.label}</span>
        </nav>
        <h1
          style={{
            fontFamily: "var(--font-archivo)",
            fontWeight: 800,
            fontSize: "clamp(30px,4vw,48px)",
            letterSpacing: "-.02em",
            margin: "0 0 22px",
          }}
        >
          {dept.label}
        </h1>

        {dept.categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 30 }}>
            {chip("Shop All", `/shop/${dept.slug}`, !activeCategory)}
            {dept.categories.map((cat) => chip(cat.label, `/shop/${dept.slug}?c=${cat.slug}`, activeCategory === cat.slug))}
          </div>
        )}

        {ranges.length === 0 ? (
          <EmptyCatalogue
            note={
              activeCategory
                ? "Nothing in this category just yet. Try Shop All, or visit the showroom - the full range is in store."
                : undefined
            }
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 18 }}>
            {ranges.map((r) => (
              <RangeCard key={r.id} range={r} categoryLabels={labelMap} />
            ))}
          </div>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
