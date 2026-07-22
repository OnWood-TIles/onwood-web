import Reveal from "../ui/Reveal";
import FeaturedProductCard, { type FeaturedProduct } from "./FeaturedProductCard";
import { FEATURED_HEAD } from "../../../lib/content";
import { listRanges, getTaxonomy, type WebsiteRange } from "../../../lib/onbase/client";

// "Currently On Trend" - a curated strip of live products from OnBase, each shown
// with its product photo AND its "see it installed" room shot. Prefers products
// that have BOTH images (the full showcase treatment); falls back to photo-only
// products so the section always has something to show. Server-rendered from the
// feed; renders nothing if there are no published products with photos yet.

const productImg = (r: WebsiteRange): string | null =>
  r.heroImage || r.swatches.find((s) => s.image)?.image || null;
const roomImg = (r: WebsiteRange): string | null =>
  r.swatches[0]?.installedImage || r.swatches.find((s) => s.installedImage)?.installedImage || null;

const gridCss = `
.ow-featured-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
@media (max-width:980px){.ow-featured-grid{grid-template-columns:repeat(2,1fr);}}
@media (max-width:600px){.ow-featured-grid{grid-template-columns:1fr;}}

.owf-card{display:block;text-decoration:none;color:inherit;border-radius:20px;overflow:hidden;border:1px solid var(--line);background:var(--surface);box-shadow:0 14px 36px -24px rgba(32,48,58,.4);transition:transform .3s ease, box-shadow .3s ease;will-change:transform;}
.owf-card:hover{transform:translateY(-6px);box-shadow:0 30px 60px -28px rgba(32,48,58,.5);}
.owf-media{position:relative;aspect-ratio:4/5;overflow:hidden;background:#efece5;}
.owf-front,.owf-back{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
.owf-front{opacity:1;transition:opacity .55s ease, transform .8s cubic-bezier(.2,.6,.2,1);}
.owf-back{opacity:0;transform:scale(1.06);transition:opacity .55s ease, transform .9s cubic-bezier(.2,.6,.2,1);}
.owf-card:hover .owf-front{transform:scale(1.05);}
.owf-has-room:hover .owf-front{opacity:0;}
.owf-has-room:hover .owf-back{opacity:1;transform:scale(1);}
.owf-bar{position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .45s cubic-bezier(.2,.6,.2,1);z-index:3;}
.owf-card:hover .owf-bar{transform:scaleX(1);}
.owf-scrim{position:absolute;inset:0;background:linear-gradient(to top, rgba(14,20,24,.82) 0%, rgba(14,20,24,.24) 46%, rgba(14,20,24,0) 72%);z-index:2;}
.owf-special{position:absolute;top:14px;left:14px;z-index:4;padding:5px 11px;border-radius:99px;background:var(--accent);color:#fff6ee;font-size:11.5px;font-weight:800;letter-spacing:.01em;}
.owf-special s{opacity:.7;font-weight:600;margin-left:3px;}
.owf-peek{position:absolute;top:14px;right:14px;z-index:4;padding:5px 10px;border-radius:99px;background:rgba(255,246,238,.92);color:var(--ink);font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transition:opacity .3s ease;}
.owf-card:hover .owf-peek{opacity:0;}
.owf-inset{position:absolute;right:14px;bottom:86px;z-index:4;width:64px;height:64px;border-radius:14px;overflow:hidden;border:2px solid rgba(255,246,238,.94);box-shadow:0 10px 22px -8px rgba(0,0,0,.55);}
.owf-inset img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .5s ease;}
.owf-inset-tile{opacity:0;}
.owf-card:hover .owf-inset-room{opacity:0;}
.owf-card:hover .owf-inset-tile{opacity:1;}
.owf-body{position:absolute;left:0;right:0;bottom:0;z-index:4;padding:20px 18px 18px;color:#fff6ee;}
.owf-tag{font-size:10.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,246,238,.74);}
.owf-name{font-family:var(--font-archivo);font-weight:800;font-size:21px;letter-spacing:-.01em;line-height:1.1;margin:5px 0 0;}
.owf-cta{display:inline-flex;align-items:center;gap:7px;margin-top:12px;font-weight:800;font-size:13px;opacity:.94;transition:gap .25s ease;}
.owf-card:hover .owf-cta{gap:12px;}
@media (prefers-reduced-motion: reduce){
  .owf-card,.owf-front,.owf-back,.owf-bar,.owf-inset img{transition:none;}
}
`;

export default async function FeaturedProducts() {
  const [ranges, taxonomy] = await Promise.all([listRanges(), getTaxonomy()]);
  const deptLabel = new Map(taxonomy.map((d) => [d.slug, d.label]));

  const withImg = ranges.filter((r) => productImg(r));
  const withRoom = withImg.filter((r) => roomImg(r));
  // Prefer products with BOTH a photo and a room shot; only fall back to
  // photo-only if there aren't enough of the full-treatment ones yet.
  const base = withRoom.length >= 3 ? withRoom : withImg;
  // Specials first (actively promoted), otherwise keep the feed's order.
  const picked = [...base]
    .sort((a, b) => (b.special ? 1 : 0) - (a.special ? 1 : 0))
    .slice(0, 6);

  if (picked.length === 0) return null;

  const cards: FeaturedProduct[] = picked.map((r) => ({
    name: r.name,
    slug: r.slug,
    productImage: productImg(r) as string,
    roomImage: roomImg(r),
    tag: (r.department && deptLabel.get(r.department)) || "Featured",
    special: r.special ?? null,
  }));

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
        {cards.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06}>
            <FeaturedProductCard p={c} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
