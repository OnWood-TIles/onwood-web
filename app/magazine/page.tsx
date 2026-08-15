import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import PdfMagazine from "./PdfMagazine";
import { MAGAZINE_PAGES } from "./manifest";
import { MAGAZINE_ISSUE } from "../../lib/magazine";
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
export type Pic = { url: string; caption: string };

// Distinct "installed" room shots for a product, each tagged with its colourway
// so every image can carry a product + colour credit.
function picks(r?: WebsiteRange): { url: string; colour: string | null }[] {
  if (!r) return [];
  const seen = new Set<string>();
  const out: { url: string; colour: string | null }[] = [];
  for (const s of r.swatches || []) {
    if (s.installedImage && !seen.has(s.installedImage)) {
      seen.add(s.installedImage);
      out.push({ url: s.installedImage, colour: s.colour || null });
    }
  }
  return out;
}
function credit(name: string, colour: string | null): string {
  const c = colour ? colour.trim() : "";
  return c ? `${name}, ${c}` : name;
}
// Pick one shot with its caption: by colourway if named, else the Nth distinct
// shot, falling back to the product hero so a page never renders imageless.
function pick(r?: WebsiteRange, colour?: string, index = 0): Pic | null {
  if (!r) return null;
  if (colour) {
    const m = (r.swatches || []).find((s) => s.colour?.toLowerCase() === colour.toLowerCase());
    const u = m?.installedImage || m?.image;
    if (u) return { url: u, caption: credit(r.name, m?.colour || colour) };
  }
  const arr = picks(r);
  if (arr.length) {
    const p = arr[((index % arr.length) + arr.length) % arr.length];
    return { url: p.url, caption: credit(r.name, p.colour) };
  }
  const u = r.heroImage || (r.swatches || []).map((s) => s.image).find(Boolean);
  return u ? { url: u, caption: r.name } : null;
}
export default async function MagazinePage() {
  const ranges = await listRanges({ department: "tiles" });
  const byslug = new Map(ranges.map((r) => [r.slug, r]));
  const pageCount = MAGAZINE_PAGES;

  // The magazine is designed by Claude Design and rendered to exact-colour page
  // images (public/magazine/pages) with a downloadable PDF at public/kiln.pdf.
  const explore = [
    {
      href: "/gallery",
      label: "The Gallery",
      blurb: "Hundreds of rooms styled around real OnWood tiles. Filter by look, save your favourites.",
      img: pick(byslug.get("estella-60"))?.url ?? null,
    },
    {
      href: "/blog",
      label: "Ideas & Inspiration",
      blurb: "Guides and stories on choosing, laying and living with tile, from our journal.",
      img: pick(byslug.get("terroir-60"))?.url ?? null,
    },
    {
      href: "/vision-board",
      label: "Vision Board",
      blurb: "Pull the looks you love into one place and build your own board to bring in.",
      img: pick(byslug.get("marrakesh-decor"))?.url ?? null,
    },
  ];

  return (
    <div style={{ background: "var(--bg)" }}>
      <MarketingNav />
      <PdfMagazine pages={pageCount} download="/kiln.pdf" />

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
