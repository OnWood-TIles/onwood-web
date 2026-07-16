import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getTaxonomy, getFilterGroups, listRanges } from "../../../lib/onbase/client";
import { EmptyCatalogue, RangeCard } from "../../components/shop/shared";

export const dynamic = "force-dynamic";

type Params = { department: string };
type Search = { c?: string; f?: string | string[] };

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
  const { c, f } = await searchParams;
  const [taxonomy, allFilterGroups] = await Promise.all([getTaxonomy(), getFilterGroups()]);
  const dept = taxonomy.find((d) => d.slug === department);
  if (!dept) notFound();

  const activeCategory = dept.categories.some((x) => x.slug === c) ? c : undefined;

  // Filter groups scoped to this department; active picks from repeatable ?f=group:value.
  const filterGroups = allFilterGroups.filter(
    (g) => g.values.length > 0 && (!g.departments?.length || g.departments.includes(department)),
  );
  const active: Record<string, string[]> = {};
  for (const clause of Array.isArray(f) ? f : f ? [f] : []) {
    const i = clause.indexOf(":");
    if (i <= 0) continue;
    const group = clause.slice(0, i);
    const value = clause.slice(i + 1);
    if (filterGroups.some((g) => g.slug === group && g.values.some((v) => v.slug === value)))
      (active[group] ??= []).push(value);
  }
  const hasActive = Object.values(active).some((v) => v.length);

  // Shareable toggle URLs: flip one value, keep everything else.
  const hrefWith = (mutate: (next: Record<string, string[]>) => void) => {
    const next: Record<string, string[]> = Object.fromEntries(Object.entries(active).map(([k, v]) => [k, [...v]]));
    mutate(next);
    const qs = new URLSearchParams();
    if (activeCategory) qs.set("c", activeCategory);
    for (const [g, vals] of Object.entries(next)) for (const v of vals) qs.append("f", `${g}:${v}`);
    const s = qs.toString();
    return `/shop/${dept.slug}${s ? `?${s}` : ""}`;
  };
  const toggleHref = (group: string, value: string) =>
    hrefWith((next) => {
      const cur = next[group] ?? [];
      next[group] = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    });

  const ranges = await listRanges({ department, category: activeCategory, ...(hasActive ? { filters: active } : {}) });
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: filterGroups.length ? 18 : 30 }}>
            {chip("Shop All", `/shop/${dept.slug}`, !activeCategory)}
            {dept.categories.map((cat) => chip(cat.label, `/shop/${dept.slug}?c=${cat.slug}`, activeCategory === cat.slug))}
          </div>
        )}

        {filterGroups.length > 0 && (
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 30,
              background: "#fff",
              display: "grid",
              gap: 10,
            }}
          >
            {filterGroups.map((g) => (
              <div key={g.slug} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    color: "#8a8577",
                    width: 110,
                    flexShrink: 0,
                  }}
                >
                  {g.label}
                </span>
                {g.values.map((v) => {
                  const isOn = (active[g.slug] ?? []).includes(v.slug);
                  return (
                    <Link
                      key={v.slug}
                      href={toggleHref(g.slug, v.slug)}
                      style={{
                        textDecoration: "none",
                        padding: "4px 12px",
                        borderRadius: 99,
                        fontSize: 12.5,
                        fontWeight: 600,
                        border: `1px solid ${isOn ? "var(--accent)" : "var(--line)"}`,
                        background: isOn ? "var(--accent)" : "transparent",
                        color: isOn ? "#fff6ee" : "var(--ink)",
                        transition: "all .2s ease",
                      }}
                    >
                      {v.label}
                    </Link>
                  );
                })}
              </div>
            ))}
            {hasActive && (
              <div>
                <Link
                  href={hrefWith((next) => {
                    for (const k of Object.keys(next)) next[k] = [];
                  })}
                  style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}
                >
                  Clear filters ✕
                </Link>
              </div>
            )}
          </div>
        )}

        {ranges.length === 0 ? (
          <EmptyCatalogue
            note={
              hasActive
                ? "Nothing matches those filters just yet. Try clearing a filter or two, or visit the showroom - the full range is in store."
                : activeCategory
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
