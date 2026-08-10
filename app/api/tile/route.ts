import { NextResponse } from "next/server";
import sharp from "sharp";

// On-demand tile-image trimmer. The catalogue tile photos are shot on a big white
// canvas (ABI / Tile One house style), so in the Vision Board + hero mood-boards a
// plank/tile floats in a white border. This fetches the source, trims the white
// margin so ONLY the tile shows, and returns a compact webp. Cached hard (the
// result is deterministic per source URL). Fails open to the original image.
export const runtime = "nodejs";
export const revalidate = 604800; // 1 week

// Only proxy images from the known catalogue image hosts.
const ALLOW = /^https:\/\/([a-z0-9-]+\.)?(onwoodtiles\.com\.au|onbasehq\.com\.au|abiinteriors\.com\.au)\//i;

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") || "";
  if (!ALLOW.test(u)) return new NextResponse("bad url", { status: 400 });
  try {
    const r = await fetch(u, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://onwoodtiles.com.au/" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return NextResponse.redirect(u);
    const buf = Buffer.from(await r.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const ow = meta.width || 0, oh = meta.height || 0;
    let src: Buffer = buf;
    try {
      const trimmed = await sharp(buf).trim({ background: "#ffffff", threshold: 18 }).toBuffer();
      const tm = await sharp(trimmed).metadata();
      const tw = tm.width || 0, th = tm.height || 0;
      const ar = tw && th ? Math.max(tw / th, th / tw) : 99;
      // Only keep the trim if it left a real tile. A near-white tile (a white subway
      // on white) has no edge for the trimmer to find and collapses to a ~10px sliver
      // - detect that by an absurd aspect / tiny dimension and serve the original so a
      // light tile is never destroyed. (A legit subway is ~2.8:1, a plank up to ~6:1.)
      if (tw >= 24 && th >= 24 && ar <= 12) src = trimmed;
    } catch {
      /* trim can throw on a single-colour image - keep the original */
    }
    const out = await sharp(src).resize(700, 700, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    return new NextResponse(new Uint8Array(out), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=604800, immutable" },
    });
  } catch {
    return NextResponse.redirect(u); // network hiccup - fall back to the original
  }
}
