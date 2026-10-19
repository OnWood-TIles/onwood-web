import Reveal from "../ui/Reveal";
import { RangeCard } from "../shop/shared";
import { FEATURED_HEAD } from "../../../lib/content";
import { unstable_cache } from "next/cache";
import { listRanges, getTaxonomy, type WebsiteRange } from "../../../lib/onbase/client";
import { getProductViews } from "../../../lib/analytics";

// Popularity is cached as a result (not per-fetch) so a dynamic homepage render
// still calls the analytics API at most once every 6 hours.
const getPopularity = unstable_cache(() => getProductViews(30), ["featured-popularity"], { revalidate: 6 * 3600 });

// A range card answers to its own page AND each member product's page.
const views = (r: WebsiteRange, pop: Record<string, number>): number =>
  [r.slug, ...r.swatches.map((s) => s.slug)].reduce((sum, s) => sum + (s ? pop[s] ?? 0 : 0), 0);

// "Currently On Trend" - a strip of live products from OnBase, shown with the SAME
// card as the shop catalogue (product photo + white footer with the option count
// and colour icons) so the whole site reads consistently. Order: products PINNED
// in OnBase ("Pin to homepage") first, then the most-viewed product pages over
// the last 30 days (unique visitors, Vercel Analytics), then the feed order to
// fill any gap. Renders nothing if there are no published products yet.

const productImg = (r: WebsiteRange): string | null =>
  r.heroImage || r.swatches.find((s) => s.image)?.image || null;
const roomImg = (r: WebsiteRange): string | null =>
  r.swatches[0]?.installedImage || r.swatches.find((s) => s.installedImage)?.installedImage || null;

const gridCss = `
.ow-featured-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
@media (max-width:980px){.ow-featured-grid{grid-template-columns:repeat(2,1fr);}}
@media (max-width:600px){.ow-featured-grid{grid-template-columns:1fr;}}
`;

export default async function FeaturedProducts() {
  const [ranges, taxonomy, pop] = await Promise.all([
    listRanges(),
    getTaxonomy(),
    getPopularity().catch(() => ({}) as Record<string, number>),
  ]);
  const labelMap: Record<string, string> = {};
  for (const t of taxonomy) for (const cat of t.categories) labelMap[cat.slug] = cat.label;

  const withImg = ranges.filter((r) => productImg(r));
  const withRoom = withImg.filter((r) => roomImg(r));
  // Prefer products with BOTH a photo and a room shot; only fall back to
  // photo-only if there aren't enough of the full-treatment ones yet.
  const base = withRoom.length >= 3 ? withRoom : withImg;
  // Pinned first, then specials (actively promoted), then most-viewed; ties keep
  // the feed's order (Array.sort is stable), which also fills a quiet week.
  // A pinned product shows even without a room shot - pinning is a deliberate choice.
  const pinned = withImg.filter((r) => r.featured);
  const rest = base.filter((r) => !r.featured);
  const picked = [
    ...pinned,
    ...rest.sort(
      (a, b) => (b.special ? 1 : 0) - (a.special ? 1 : 0) || views(b, pop) - views(a, pop),
    ),
  ].slice(0, 6);

  if (picked.length === 0) return null;

  return (
    <section id="featured" style={{ padding: "40px 40px 110px", maxWidth: 1240, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 40,
        }}
      >
        <div>
          <Reveal>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--accent2)",
              }}
            >
              {FEATURED_HEAD.eyebrow}
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 800,
                fontSize: "clamp(30px,4vw,52px)",
                letterSpacing: "-.02em",
                margin: "12px 0 0",
                maxWidth: 620,
              }}
            >
              {FEATURED_HEAD.title}
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <a
            href={FEATURED_HEAD.cta.href}
            style={{
              textDecoration: "none",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: 14,
              borderBottom: "2px solid var(--accent)",
              paddingBottom: 3,
              display: "inline-block",
            }}
          >
            {FEATURED_HEAD.cta.label} &rarr;
          </a>
        </Reveal>
      </div>

      <style>{gridCss}</style>
      <div className="ow-featured-grid">
        {picked.map((r, i) => (
          <Reveal key={r.id} delay={i * 0.06}>
            <RangeCard range={r} categoryLabels={labelMap} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
