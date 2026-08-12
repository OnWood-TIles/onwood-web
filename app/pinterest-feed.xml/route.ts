import { listRanges } from "../../lib/onbase/client";
import { imageAlt } from "../../lib/alt";

// Pinterest RSS auto-publish feed. Connect this URL in Pinterest
// (Business -> Bulk create Pins -> from RSS / claimed-site feed) and Pinterest
// auto-creates one Pin per product "installed" room shot, each linking back to
// its product page — no manual pinning. One <item> per colourway that has a
// room shot; the flat tile swatches are deliberately excluded so only the
// styled room images go to Pinterest. Pinterest polls it (~daily, up to 200/day).
export const revalidate = 3600; // refresh hourly so new products flow in

const BASE = "https://onwoodtiles.com.au";

const esc = (s: string) =>
  (s || "").replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );

const abs = (u: string) => (u.startsWith("http") ? u : `${BASE}${u.startsWith("/") ? "" : "/"}${u}`);

export async function GET() {
  const ranges = await listRanges().catch(() => []);

  const items: string[] = [];
  const seen = new Set<string>();
  for (const r of ranges) {
    for (const sw of r.swatches) {
      if (!sw.installedImage) continue; // only the styled room shots
      const img = abs(sw.installedImage);
      if (seen.has(img)) continue; // a colour can appear under >1 department
      seen.add(img);
      const link = `${BASE}/product/${sw.slug || r.slug}`;
      const title = `${r.name}${sw.colour ? ` — ${sw.colour}` : ""}`;
      const desc = imageAlt(r, { swatch: sw, kind: "installed" }) || title;
      items.push(
        `<item>` +
          `<title>${esc(title)}</title>` +
          `<link>${esc(link)}</link>` +
          `<guid isPermaLink="false">${esc(img)}</guid>` +
          `<description>${esc(desc)}</description>` +
          `<enclosure url="${esc(img)}" type="image/jpeg"/>` +
          `<media:content url="${esc(img)}" medium="image"/>` +
          `<media:thumbnail url="${esc(img)}"/>` +
          `</item>`,
      );
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">` +
    `<channel>` +
    `<title>OnWood Tiles — Room Inspiration</title>` +
    `<link>${BASE}/gallery</link>` +
    `<description>Tiles and stone veneer styled in real rooms — Sunshine Coast tile shop, Baringa QLD.</description>` +
    `<language>en-au</language>` +
    items.join("") +
    `</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
