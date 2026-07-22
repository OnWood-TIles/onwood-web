import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaxonomy, getFilterGroups } from "../../../../../lib/onbase/client";
import { tradeRanges } from "../../../../../lib/onbase/trade";
import { buildFilterGroupVMs, parseActiveFilters } from "../../../../../lib/shopFilters";
import TradeDepartmentShop from "../TradeDepartmentShop";

export const dynamic = "force-dynamic";

type Params = { department: string };
type Search = { c?: string; f?: string | string[] };

// Trade department page: identical to the public shop department (breadcrumb, big
// title, category chips, filter bar + search + colourway explode), but the grid
// shows trade-priced add-to-order cards. Fetches ALL of the department's ranges
// once; the client filters them instantly (see DepartmentShop).
export default async function TradeDepartmentPage({
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

  const filterGroupsVM = buildFilterGroupVMs(allFilterGroups, department);
  const initialActive = parseActiveFilters(f, filterGroupsVM);

  const { ranges } = await tradeRanges({ department, category: activeCategory }).catch(() => ({ rrpLevel: "SELL", ranges: [] }));
  const labelMap: Record<string, string> = {};
  for (const t of taxonomy) for (const cat of t.categories) labelMap[cat.slug] = cat.label;

  const chip = (label: string, href: string, on: boolean) => (
    <Link key={href} href={href} style={{ textDecoration: "none", padding: "8px 18px", borderRadius: 99, fontSize: 14, fontWeight: 700, border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "var(--accent)" : "#fff", color: on ? "#fff6ee" : "var(--ink)", transition: "all .2s ease" }}>
      {label}
    </Link>
  );

  return (
    <div>
      <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
        <Link href="/trade/catalogue" style={{ color: "inherit", textDecoration: "none" }}>Catalogue</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>{dept.label}</span>
      </nav>
      <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-.02em", margin: "0 0 6px" }}>
        {dept.label}
      </h1>
      <p style={{ color: "#5a6067", fontSize: 14.5, margin: "0 0 22px" }}>
        Your trade pricing. RRP is shown struck through, with your price beneath.
      </p>

      {dept.categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: filterGroupsVM.length ? 18 : 30 }}>
          {chip("Shop All", `/trade/catalogue/${dept.slug}`, !activeCategory)}
          {dept.categories.map((cat) => chip(cat.label, `/trade/catalogue/${dept.slug}?c=${cat.slug}`, activeCategory === cat.slug))}
        </div>
      )}

      <TradeDepartmentShop
        allRanges={ranges}
        groups={filterGroupsVM}
        labelMap={labelMap}
        initialActive={initialActive}
        deptSlug={dept.slug}
        activeCategory={activeCategory}
      />
    </div>
  );
}
