import { NextResponse } from "next/server";
import { listRanges, getBlog } from "../../../lib/onbase/client";

// Global site search: products (the live catalogue), guides (the blog) and key
// pages, all matched against one query. Reads the same cached feeds the storefront
// uses, so it is fast. Every word must appear somewhere in an item to match.
export const dynamic = "force-dynamic";

const PAGES: { name: string; url: string; kw: string }[] = [
  { name: "Shop all tiles", url: "/shop", kw: "shop catalogue browse products range" },
  { name: "Floor, wall & outdoor tiles", url: "/shop/tiles", kw: "tiles porcelain ceramic floor wall outdoor timber look stone look" },
  { name: "Stone cladding", url: "/shop/stone-cladding", kw: "stone veneer cladding feature wall facade" },
  { name: "Tapware", url: "/shop/tapware", kw: "tapware mixers" },
  { name: "Wastes & grates", url: "/shop/wastes", kw: "wastes grates shower channel floor waste drainage" },
  { name: "The gallery", url: "/gallery", kw: "gallery inspiration installed room shots looks ideas" },
  { name: "Ideas & Inspiration", url: "/blog", kw: "blog guides ideas inspiration journal how to" },
  { name: "Kiln, our magazine", url: "/magazine", kw: "kiln magazine batch flip read" },
  { name: "Vision board", url: "/vision-board", kw: "vision board mood board build the look design" },
  { name: "Tile calculator", url: "/calculator", kw: "calculator how many tiles boxes square metres m2 estimate quantity" },
  { name: "Find your tile", url: "/quiz", kw: "quiz find your tile recommend style help choose" },
  { name: "Monthly specials", url: "/specials", kw: "specials deals sale clearance free delivery package cheap" },
  { name: "Areas we service", url: "/tile-shop", kw: "areas we service suburbs sunshine coast delivery near me caloundra" },
  { name: "Book a showroom visit", url: "/book", kw: "book visit appointment showroom baringa" },
  { name: "Contact us", url: "/contact", kw: "contact enquiry phone email quote get in touch" },
  { name: "Why OnWood", url: "/why", kw: "why onwood about us story family" },
  { name: "FAQ", url: "/faq", kw: "faq frequently asked questions answers help" },
  { name: "Downloads", url: "/downloads", kw: "downloads care install warranty pdf datasheet guides" },
];

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return NextResponse.json({ products: [], guides: [], pages: [] });
  const hit = (hay: string) => words.every((w) => hay.includes(w));

  const [ranges, posts] = await Promise.all([listRanges().catch(() => []), getBlog().catch(() => [])]);

  const products = ranges
    .map((r) => {
      const colours = (r.swatches || []).map((s) => s.colour).filter(Boolean).join(" ");
      const filters = Object.values(r.filters || {}).flat().join(" ");
      const hay = `${r.name} ${colours} ${r.department || ""} ${filters} ${r.description || ""}`.toLowerCase();
      return { r, hay };
    })
    .filter((x) => hit(x.hay))
    .slice(0, 8)
    .map(({ r }) => ({
      name: r.name,
      url: `/product/${r.slug}`,
      sub: r.swatches?.length ? `${r.swatches.length} colour${r.swatches.length === 1 ? "" : "s"}` : (r.department || ""),
      image: r.swatches?.find((s) => s.image)?.image || r.heroImage || r.swatches?.find((s) => s.installedImage)?.installedImage || null,
    }));

  const guides = (posts || [])
    .filter((p) => p.published)
    .filter((p) => hit(`${p.title} ${p.excerpt} ${p.category} ${p.keywords}`.toLowerCase()))
    .slice(0, 5)
    .map((p) => ({ name: p.title, url: `/blog/${p.slug}`, sub: p.category || "Guide", image: p.coverImage || null }));

  const pages = PAGES.filter((p) => hit(`${p.name} ${p.kw}`.toLowerCase())).slice(0, 6).map((p) => ({ name: p.name, url: p.url, sub: "", image: null }));

  return NextResponse.json({ products, guides, pages });
}
