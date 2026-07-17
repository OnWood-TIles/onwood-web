import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getTaxonomy, getFilterGroups, listRanges } from "../../../lib/onbase/client";
import { ColourwayCard, EmptyCatalogue, RangeCard } from "../../components/shop/shared";

export const dynamic = "force-dynamic";

// Small swatch dots for the Colour filter group. Best-effort: a known colour
// name renders a dot, anything else just shows the label. Keeps the editorial
// look without needing per-value hex data on the tenant's filter values.
const COLOUR_HEX: Record<string, string> = {
  white: "#f4f1ea", cream: "#efe7d6", ivory: "#f0e9d8", beige: "#e3d7c0", sand: "#e0cfa8", tan: "#d8c3a0",
  brown: "#8a5a3b", timber: "#b07a4e", terracotta: "#c46a44", rust: "#b0563a", clay: "#c17a53",
  grey: "#9aa0a2", gray: "#9aa0a2", silver: "#c3c6c4", charcoal: "#3f4547", black: "#20282b",
  green: "#7e9678", sage: "#a6b8a0", olive: "#8a8b5c", blue: "#5b7c99", navy: "#2f4356", teal: "#3f6b6b",
  stone: "#c9c1b2", natural: "#d8cdb6", oatmeal: "#e5dcc7", pink: "#e0b8ad", blush: "#e8cfc6",
};
function colourHex(v: { slug: string; label: string }): string | null {
  return COLOUR_HEX[(v.slug || "").toLowerCase()] ?? COLOUR_HEX[(v.label || "").toLowerCase()] ?? null;
}

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

  // Colour filter active -> EXPLODE ranges into one card per matching
  // colourway, so a shopper filtering Beige sees every beige option (a range
  // showing its grey hero can never hide its three beige colourways).
  const colourSel = active["colour"] ?? [];
  const colourways = colourSel.length
    ? ranges.flatMap((r) =>
        r.swatches
          .filter((s) => (s.colours ?? []).some((c) => colourSel.includes(c)))
          .map((s) => ({ range: r, swatch: s })),
      )
    : [];
  const exploded = colourSel.length > 0 && colourways.length > 0;

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

        <div
          className="ow-shop-layout"
          style={{
            display: "grid",
            gridTemplateColumns: filterGroups.length ? "244px minmax(0, 1fr)" : "minmax(0, 1fr)",
            gap: 30,
            alignItems: "start",
          }}
        >
          {filterGroups.length > 0 && (
            <aside
              className="ow-refine"
              style={{
                position: "sticky",
                top: 110,
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: "18px 18px 20px",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--accent2)",
                  }}
                >
                  Refine results
                </span>
                {hasActive && (
                  <Link
                    href={hrefWith((next) => {
                      for (const k of Object.keys(next)) next[k] = [];
                    })}
                    style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}
                  >
                    Clear all
                  </Link>
                )}
              </div>
              <div style={{ display: "grid", gap: 20 }}>
                {filterGroups.map((g) => (
                  <div key={g.slug}>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: ".16em",
                        textTransform: "uppercase",
                        color: "#8a8577",
                        marginBottom: 10,
                      }}
                    >
                      {g.label}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {g.values.map((v) => {
                        const isOn = (active[g.slug] ?? []).includes(v.slug);
                        const hex = g.slug === "colour" ? colourHex(v) : null;
                        return (
                          <Link
                            key={v.slug}
                            href={toggleHref(g.slug, v.slug)}
                            style={{
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "5px 11px",
                              borderRadius: 99,
                              fontSize: 12.5,
                              fontWeight: isOn ? 700 : 600,
                              border: `1px solid ${isOn ? "var(--accent)" : "var(--line)"}`,
                              background: isOn ? "var(--accent)" : "transparent",
                              color: isOn ? "#fff6ee" : "var(--ink)",
                              transition: "all .2s ease",
                            }}
                          >
                            {hex && (
                              <span
                                style={{
                                  width: 11,
                                  height: 11,
                                  borderRadius: "50%",
                                  background: hex,
                                  border: "1px solid rgba(0,0,0,.15)",
                                  display: "inline-block",
                                }}
                              />
                            )}
                            {v.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          <div>
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
            ) : exploded ? (
              <>
                <p style={{ fontSize: 13, color: "#8a8577", margin: "0 0 14px" }}>
                  Showing every matching colour - {colourways.length} colourway{colourways.length === 1 ? "" : "s"} across {ranges.length} product{ranges.length === 1 ? "" : "s"}.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
                  {colourways.map(({ range, swatch }) => (
                    <ColourwayCard key={`${range.id}-${swatch.colour}`} range={range} swatch={swatch} />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
                {ranges.map((r) => (
                  <RangeCard key={r.id} range={r} categoryLabels={labelMap} />
                ))}
              </div>
            )}
          </div>
        </div>

        <style>{`@media (max-width: 860px){.ow-shop-layout{grid-template-columns:1fr !important}.ow-refine{position:static !important}}`}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
