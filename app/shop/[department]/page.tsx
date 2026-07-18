import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getTaxonomy, getFilterGroups, listRanges } from "../../../lib/onbase/client";
import { DepartmentShop } from "../../components/shop/DepartmentShop";

export const dynamic = "force-dynamic";

// Small swatch dots for the Colour filter group. Best-effort: a known colour
// name renders a dot, anything else just shows the label.
const COLOUR_HEX: Record<string, string> = {
  white: "#f4f1ea", cream: "#efe7d6", ivory: "#f0e9d8", beige: "#e3d7c0", sand: "#e0cfa8", tan: "#d8c3a0",
  brown: "#8a5a3b", timber: "#b07a4e", terracotta: "#c46a44", rust: "#b0563a", clay: "#c17a53",
  grey: "#9aa0a2", gray: "#9aa0a2", silver: "#c3c6c4", charcoal: "#3f4547", black: "#20282b",
  green: "#7e9678", sage: "#a6b8a0", olive: "#8a8b5c", blue: "#5b7c99", navy: "#2f4356", teal: "#3f6b6b",
  stone: "#c9c1b2", natural: "#d8cdb6", oatmeal: "#e5dcc7", pink: "#e0b8ad", blush: "#e8cfc6",
};
const colourHex = (v: { slug: string; label: string }): string | null =>
  COLOUR_HEX[(v.slug || "").toLowerCase()] ?? COLOUR_HEX[(v.label || "").toLowerCase()] ?? null;

type Params = { department: string };
type Search = { c?: string; f?: string | string[] };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { department } = await params;
  const taxonomy = await getTaxonomy();
  const dept = taxonomy.find((d) => d.slug === department);
  return {
    title: dept ? `${dept.label} | Shop` : "Shop",
    description: dept ? `Browse ${dept.label.toLowerCase()} at OnWood Tiles - live availability from our Sunshine Coast showroom.` : undefined,
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
  const [taxonomy, allFilterGroups] = await Promise.all([getTaxonomy(), getFilterGroups()]);
  const dept = taxonomy.find((d) => d.slug === department);
  if (!dept) notFound();

  const activeCategory = dept.categories.some((x) => x.slug === c) ? c : undefined;

  const filterGroups = allFilterGroups.filter(
    (g) => g.values.length > 0 && (!g.departments?.length || g.departments.includes(department)),
  );

  // Initial filters from the URL (?f=group:value), validated against the groups.
  const initialActive: Record<string, string[]> = {};
  for (const clause of Array.isArray(f) ? f : f ? [f] : []) {
    const i = clause.indexOf(":");
    if (i <= 0) continue;
    const group = clause.slice(0, i);
    const value = clause.slice(i + 1);
    if (filterGroups.some((g) => g.slug === group && g.values.some((v) => v.slug === value)))
      (initialActive[group] ??= []).push(value);
  }

  // All ranges for this department/category - filtered client-side.
  const allRanges = await listRanges({ department, category: activeCategory });
  const labelMap: Record<string, string> = {};
  for (const t of taxonomy) for (const cat of t.categories) labelMap[cat.slug] = cat.label;

  const isSizeGroup = (g: { slug: string; label: string }) => /size/i.test(g.slug) || /size/i.test(g.label);
  const parseSize = (label: string): { w: number; h: number } | null => {
    const m = (label || "").match(/(\d{2,4})\s*[x×]\s*(\d{2,4})/);
    return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
  };
  const filterGroupsVM = filterGroups.map((g) => ({
    slug: g.slug,
    label: g.label,
    values: g.values.map((v) => ({
      slug: v.slug,
      label: v.label,
      hex: g.slug === "colour" ? colourHex(v) : null,
      size: isSizeGroup(g) ? parseSize(v.label) : null,
    })),
  }));

  const chip = (label: string, href: string, on: boolean) => (
    <Link key={href} href={href} style={{ textDecoration: "none", padding: "8px 18px", borderRadius: 99, fontSize: 14, fontWeight: 700, border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "var(--accent)" : "#fff", color: on ? "#fff6ee" : "var(--ink)", transition: "all .2s ease" }}>
      {label}
    </Link>
  );

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "150px 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{dept.label}</span>
        </nav>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(30px,4vw,48px)", letterSpacing: "-.02em", margin: "0 0 22px" }}>
          {dept.label}
        </h1>

        {dept.categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: filterGroups.length ? 18 : 30 }}>
            {chip("Shop All", `/shop/${dept.slug}`, !activeCategory)}
            {dept.categories.map((cat) => chip(cat.label, `/shop/${dept.slug}?c=${cat.slug}`, activeCategory === cat.slug))}
          </div>
        )}

        <DepartmentShop
          allRanges={allRanges}
          groups={filterGroupsVM}
          labelMap={labelMap}
          initialActive={initialActive}
          deptSlug={dept.slug}
          activeCategory={activeCategory}
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
