import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import MagazineFlip, { type FlipLeaf, type TieItem } from "./MagazineFlip";
import { MAGAZINE, MAGAZINE_ISSUE, type MagLeaf, type MagBlock } from "../../lib/magazine";
import { listRanges, type WebsiteRange } from "../../lib/onbase/client";

// ── Auto-paginate long articles across several A4 pages ────────────────────
// A book never crams an 800-1150 word article onto one page; it flows it over
// several readable pages. We split an article's blocks into page-sized chunks
// (rough character budget), so each page holds ~one page of text at full size.
// Part 1 keeps the title / standfirst / hero (less text room); later parts get
// a light "continued" header. The pull quote + product tie-in ride the last part.
function blockWeight(b: MagBlock): number {
  if (b.t === "p" || b.t === "lead") return b.text.length + 40;
  if (b.t === "list") return b.items.reduce((s, i) => s + i.length, 0) + b.items.length * 34;
  if (b.t === "note") return b.text.length + 90;
  if (b.t === "h") return 70;
  if (b.t === "diagram") return 760;
  return 60;
}

function paginateArticle(leaf: MagLeaf): MagLeaf[] {
  if (leaf.kind !== "article" || !leaf.blocks || leaf.blocks.length === 0) return [leaf];
  const FIRST = 1850; // part 1 shares the page with the hero + title
  const REST = 3300; // later parts are text-only
  const pages: MagBlock[][] = [];
  let cur: MagBlock[] = [];
  let used = 0;
  let budget = FIRST;
  for (const b of leaf.blocks) {
    const w = blockWeight(b);
    if (cur.length && used + w > budget) {
      pages.push(cur);
      cur = [];
      used = 0;
      budget = REST;
    }
    cur.push(b);
    used += w;
  }
  if (cur.length) pages.push(cur);
  if (pages.length === 1) return [leaf];

  const runningTitle = [leaf.title, leaf.titleAccent].filter(Boolean).join(" ");
  return pages.map((blocks, i) => {
    const last = i === pages.length - 1;
    if (i === 0) {
      return { ...leaf, blocks, pullquote: undefined, tieIn: undefined };
    }
    return {
      ...leaf,
      id: `${leaf.id}-${i + 1}`,
      contd: runningTitle,
      title: undefined,
      titleAccent: undefined,
      standfirst: undefined,
      readMins: undefined,
      imageSlug: undefined,
      imageUrl: undefined,
      imageColour: undefined,
      imageCaption: undefined,
      blocks,
      pullquote: last ? leaf.pullquote : undefined,
      tieIn: last ? leaf.tieIn : undefined,
    };
  });
}

export const revalidate = 1800;

export const metadata: Metadata = {
  title: `${MAGAZINE_ISSUE.title}, ${MAGAZINE_ISSUE.batch}`,
  description:
    "Kiln is the OnWood Tiles magazine: essays and honest buying guides on tiles, terrazzo, timber look, porcelain and coastal Queensland homes. Flick through Batch One online, or pick up a copy in our Baringa showroom.",
  alternates: { canonical: "/magazine" },
  openGraph: {
    title: `${MAGAZINE_ISSUE.title} · ${MAGAZINE_ISSUE.batch} · OnWood Tiles`,
    description:
      "A magazine about tiles, and the coastal homes they belong in. Read Batch One of Kiln online.",
    url: "https://onwoodtiles.com.au/magazine",
    type: "article",
  },
};

// ── Image resolution against the live catalogue ───────────────────────────
function heroFor(r?: WebsiteRange, colour?: string): string | null {
  if (!r) return null;
  const swatches = r.swatches || [];
  if (colour) {
    const match = swatches.find((s) => s.colour?.toLowerCase() === colour.toLowerCase());
    if (match?.installedImage) return match.installedImage;
    if (match?.image) return match.image;
  }
  const inst = swatches.map((s) => s.installedImage).find(Boolean);
  return inst || r.heroImage || swatches.map((s) => s.image).find(Boolean) || null;
}
function galleryFor(r: WebsiteRange | undefined, count: number): string[] {
  if (!r) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of r.swatches || []) {
    if (s.installedImage && !seen.has(s.installedImage)) {
      seen.add(s.installedImage);
      out.push(s.installedImage);
    }
  }
  if (r.heroImage && !seen.has(r.heroImage) && out.length < count) out.unshift(r.heroImage);
  return out.slice(0, count);
}
function tieFor(slugs: string[] | undefined, byslug: Map<string, WebsiteRange>): TieItem[] {
  if (!slugs) return [];
  return slugs
    .map((slug) => {
      const r = byslug.get(slug);
      if (!r) return null;
      const thumb = r.heroImage || (r.swatches || []).map((s) => s.image).find(Boolean) || null;
      return { name: r.name, href: `/product/${slug}`, thumb } as TieItem;
    })
    .filter((x): x is TieItem => x !== null);
}

export default async function MagazinePage() {
  const ranges = await listRanges({ department: "tiles" });
  const byslug = new Map(ranges.map((r) => [r.slug, r]));

  const leaves: FlipLeaf[] = MAGAZINE.flatMap(paginateArticle).map((leaf) => ({
    id: leaf.id,
    kind: leaf.kind,
    section: leaf.section,
    title: leaf.title,
    titleAccent: leaf.titleAccent,
    standfirst: leaf.standfirst,
    readMins: leaf.readMins,
    contd: leaf.contd,
    blocks: leaf.blocks,
    pullquote: leaf.pullquote,
    contents: leaf.contents,
    heroUrl:
      leaf.imageUrl ??
      (leaf.imageSlug ? heroFor(byslug.get(leaf.imageSlug), leaf.imageColour) : null),
    imageCaption: leaf.imageCaption,
    gallery: leaf.gallerySlug ? galleryFor(byslug.get(leaf.gallerySlug), 5) : undefined,
    tie: tieFor(leaf.tieIn, byslug),
  }));

  const explore = [
    {
      href: "/gallery",
      label: "The Gallery",
      blurb: "Hundreds of rooms styled around real OnWood tiles. Filter by look, save your favourites.",
      img: heroFor(byslug.get("estella-60")),
    },
    {
      href: "/blog",
      label: "Ideas & Inspiration",
      blurb: "Guides and stories on choosing, laying and living with tile, from our journal.",
      img: heroFor(byslug.get("terroir-60")),
    },
    {
      href: "/vision-board",
      label: "Vision Board",
      blurb: "Pull the looks you love into one place and build your own board to bring in.",
      img: heroFor(byslug.get("marrakesh-decor")),
    },
  ];

  return (
    <div style={{ background: "var(--bg)" }}>
      <MarketingNav />
      <MagazineFlip leaves={leaves} />

      {/* See more inspiration */}
      <section style={{ background: "var(--bg)", borderTop: "1px solid var(--line)" }}>
        <style>{`.kx-card{position:relative;display:block;border-radius:8px;overflow:hidden;text-decoration:none;background:#e9e3d8;aspect-ratio:4/3}
.kx-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
.kx-card:hover img{transform:scale(1.05)}
.kx-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,26,32,0) 30%,rgba(14,26,32,.82) 100%)}
.kx-inner{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:22px;color:#fff}
.kx-arrow{color:var(--accent)}`}</style>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "72px 40px 84px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
            <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 12.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>
              Keep exploring
            </div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.05, margin: "10px 0 12px", color: "var(--ink)" }}>
              See more inspiration
            </h2>
            <p style={{ fontFamily: "var(--font-manrope)", fontSize: 16, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
              The reading does not stop here. Wander the gallery, dive into our guides, or start saving the looks you love for your own place.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
            {explore.map((c) => (
              <a key={c.href} href={c.href} className="kx-card">
                {c.img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.img} alt={c.label} loading="lazy" />
                )}
                <div className="kx-scrim" />
                <div className="kx-inner">
                  <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, letterSpacing: "-.01em" }}>{c.label}</div>
                  <p style={{ fontFamily: "var(--font-manrope)", fontSize: 13.5, lineHeight: 1.5, margin: "6px 0 0", opacity: 0.92 }}>
                    {c.blurb} <span className="kx-arrow">&rsaquo;</span>
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
