import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { getTaxonomy, listRanges, type WebsiteRange } from "../../lib/onbase/client";
import { EmptyCatalogue, RangeCard } from "../components/shop/shared";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the OnWood Tiles range - floor, wall, feature and outdoor tiles, natural stone and more, live from our Sunshine Coast showroom.",
};

export const dynamic = "force-dynamic";

// Shop overview: one section per department that actually has published
// ranges, each with its grid and a link through to the department page.
export default async function ShopPage() {
  const [taxonomy, ranges] = await Promise.all([getTaxonomy(), listRanges()]);

  const byDept = new Map<string, WebsiteRange[]>();
  for (const r of ranges) {
    const key = r.department || "other";
    const list = byDept.get(key) || [];
    list.push(r);
    byDept.set(key, list);
  }
  const labelMap: Record<string, string> = {};
  for (const d of taxonomy) for (const c of d.categories) labelMap[c.slug] = c.label;
  const sections = taxonomy
    .map((d) => ({ dept: d, ranges: byDept.get(d.slug) || [] }))
    .filter((s) => s.ranges.length > 0);
  // published departments unknown to the taxonomy still show (safety net)
  const known = new Set(taxonomy.map((d) => d.slug));
  const stray = [...byDept.entries()].filter(([slug]) => !known.has(slug));

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "150px 28px 90px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--accent2)",
            }}
          >
            Live from the showroom
          </div>
          <h1
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(34px,4.6vw,56px)",
              letterSpacing: "-.02em",
              margin: "12px 0 0",
            }}
          >
            Shop the range
          </h1>
          <p style={{ color: "#5a6067", fontSize: 15.5, maxWidth: 520, margin: "14px auto 0", lineHeight: 1.65 }}>
            Every product here is stocked and tracked in our own system, so what you see is what we can actually
            supply.
          </p>
        </div>

        {sections.length === 0 && stray.length === 0 ? (
          <EmptyCatalogue />
        ) : (
          <div style={{ display: "grid", gap: 56 }}>
            {sections.map(({ dept, ranges: deptRanges }) => (
              <section key={dept.slug}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-archivo)",
                      fontWeight: 800,
                      fontSize: 26,
                      letterSpacing: "-.015em",
                      margin: 0,
                    }}
                  >
                    {dept.label}
                  </h2>
                  <Link
                    href={`/shop/${dept.slug}`}
                    style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}
                  >
                    Shop all {dept.label.toLowerCase()} →
                  </Link>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: 18,
                  }}
                >
                  {deptRanges.slice(0, 8).map((r) => (
                    <RangeCard key={r.id} range={r} categoryLabels={labelMap} />
                  ))}
                </div>
              </section>
            ))}
            {stray.map(([slug, strayRanges]) => (
              <section key={slug}>
                <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 26, margin: "0 0 18px" }}>
                  More
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 18 }}>
                  {strayRanges.map((r) => (
                    <RangeCard key={r.id} range={r} categoryLabels={labelMap} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
