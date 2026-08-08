import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import { getTaxonomy, listRanges } from "../../lib/onbase/client";
import { imageAlt } from "../../lib/alt";
import GalleryClient, { type GalleryItem } from "./GalleryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery | Tile & Stone Room Inspiration | OnWood Tiles",
  description:
    "A visual gallery of our tiles and stone veneer, styled in room visuals to inspire your next project. Browse the looks and find your favourite from our Sunshine Coast tile showroom.",
  keywords:
    "tile gallery, tile inspiration, stone veneer gallery, wood-look tile inspiration, bathroom tile ideas, outdoor tile ideas, stone cladding, Sunshine Coast tiles, OnWood Tiles",
  alternates: { canonical: "https://onwoodtiles.com.au/gallery" },
  openGraph: {
    title: "The OnWood Gallery | Tile & Stone Inspiration",
    description: "Browse our tiles and stone veneer, styled to inspire your next project.",
    url: "https://onwoodtiles.com.au/gallery",
    type: "website",
  },
};

const isTiles = (s: string) => /tile/i.test(s);
const isStone = (s: string) => /stone|veneer|cladd/i.test(s);

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" };
const serif = (t: string) => <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" }}>{t}</em>;

export default async function GalleryPage() {
  // Only tiles + stone veneer/cladding departments (per Reagan's scope).
  const taxonomy = await getTaxonomy().catch(() => []);
  const depts = taxonomy.filter((d) => isTiles(d.slug) || isTiles(d.label) || isStone(d.slug) || isStone(d.label));
  const lists = await Promise.all(depts.map((d) => listRanges({ department: d.slug }).catch(() => [])));

  const items: GalleryItem[] = [];
  depts.forEach((d, di) => {
    const group: "tiles" | "stone" = isStone(d.slug) || isStone(d.label) ? "stone" : "tiles";
    for (const r of lists[di]) {
      for (const sw of r.swatches) {
        if (!sw.installedImage) continue;
        items.push({
          img: sw.installedImage,
          name: r.name,
          colour: sw.colour || "",
          href: `/product/${sw.slug || r.slug}`,
          alt: imageAlt(r, { swatch: sw, kind: "installed" }),
          group,
          groupLabel: group === "stone" ? "Stone Veneer" : "Tiles",
          watermark: (sw.watermarkSecondary ?? r.watermarkSecondary) || false,
        });
      }
    }
  });

  // A colour can appear under more than one matched department; keep one card each.
  const seen = new Set<string>();
  const unique = items.filter((it) => (seen.has(it.img) ? false : (seen.add(it.img), true)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "OnWood Tiles Gallery",
    description: "Tiles and stone veneer, styled in room visuals for inspiration.",
    url: "https://onwoodtiles.com.au/gallery",
    image: unique.slice(0, 100).map((it) => it.img),
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main>
        {/* ── HERO ── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "150px 24px 26px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 480px at 80% -10%, color-mix(in srgb, var(--sea) 12%, transparent), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1040, margin: "0 auto", position: "relative", textAlign: "center" }}>
            <Reveal>
              <p style={eyebrow}>The gallery</p>
              <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(34px,6vw,64px)", lineHeight: 1.03, margin: "14px 0 0" }}>
                Find your {serif("look")}.
              </h1>
              <p style={{ fontSize: 17.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "56ch", margin: "18px auto 0" }}>
                Browse our tiles and stone veneer for a little inspiration on your next project.
              </p>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)", margin: "16px auto 0", maxWidth: "60ch" }}>
                Images are AI-generated or digitally rendered to show how a product may look installed. They are illustrations - colour, tone, scale and finish vary.{" "}
                <Link href="/terms-of-use#ai-imagery" style={{ color: "var(--accent)", fontWeight: 700 }}>Read our imagery disclosure</Link>.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section style={{ padding: "18px 20px 90px" }}>
          {unique.length === 0 ? (
            <div style={{ maxWidth: 640, margin: "20px auto", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 20, padding: "56px 28px", background: "var(--surface)" }}>
              <p style={eyebrow}>Filling up soon</p>
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 26, margin: "8px 0 10px" }}>Installed photos are on the way</h2>
              <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: "44ch", margin: "0 auto 22px" }}>We are adding room shots to our tiles and stone veneer. In the meantime, browse the full range in the shop.</p>
              <Link href="/shop" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, textDecoration: "none", padding: "13px 26px", borderRadius: 999 }}>Browse the shop</Link>
            </div>
          ) : (
            <GalleryClient items={unique} />
          )}
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
