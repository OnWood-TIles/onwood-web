import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import MagazineFlip, { type FlipLeaf, type TieItem } from "./MagazineFlip";
import { MAGAZINE, MAGAZINE_ISSUE } from "../../lib/magazine";
import { listRanges, type WebsiteRange } from "../../lib/onbase/client";

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
function heroFor(r?: WebsiteRange): string | null {
  if (!r) return null;
  const inst = (r.swatches || []).map((s) => s.installedImage).find(Boolean);
  return inst || r.heroImage || (r.swatches || []).map((s) => s.image).find(Boolean) || null;
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

  const leaves: FlipLeaf[] = MAGAZINE.map((leaf) => ({
    id: leaf.id,
    kind: leaf.kind,
    section: leaf.section,
    title: leaf.title,
    titleAccent: leaf.titleAccent,
    standfirst: leaf.standfirst,
    readMins: leaf.readMins,
    blocks: leaf.blocks,
    pullquote: leaf.pullquote,
    contents: leaf.contents,
    heroUrl: leaf.imageSlug ? heroFor(byslug.get(leaf.imageSlug)) : null,
    gallery: leaf.gallerySlug ? galleryFor(byslug.get(leaf.gallerySlug), 5) : undefined,
    tie: tieFor(leaf.tieIn, byslug),
  }));

  return (
    <div style={{ background: "var(--bg)" }}>
      <MarketingNav />
      <MagazineFlip leaves={leaves} />
      <MarketingFooter />
    </div>
  );
}
