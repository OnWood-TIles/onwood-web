import { NextResponse } from "next/server";
import sharp from "sharp";
import { cutout } from "../../../lib/tileCutout";
import { fetchAllowedImage, SHARP_PIXEL_LIMIT } from "../../../lib/safeImageFetch";

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
  // Never our own /api/ routes (a request could otherwise nest image calls inside each other).
  if (!ALLOW.test(u) || /^https:\/\/[^/]+\/api\//i.test(u)) return new NextResponse("bad url", { status: 400 });
  try {
    const got = await fetchAllowedImage(u, (x) => ALLOW.test(x) && !/^https:\/\/[^/]+\/api\//i.test(x), {
      timeoutMs: 8000,
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://onwoodtiles.com.au/" },
    });
    if (!got) return NextResponse.redirect(u);
    const buf = got.buf;
    const meta = await sharp(buf, { limitInputPixels: SHARP_PIXEL_LIMIT }).metadata();
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
    // ?w= asks for a smaller copy (hero boards show tiles well under 700px); snapped so the CDN only
    // ever holds a few sizes per tile.
    const wq = Number(new URL(req.url).searchParams.get("w")) || 700;
    const box = [160, 320, 480, 700].find((s) => s >= wq) ?? 700;
    const sized = sharp(src).resize(box, box, { fit: "inside", withoutEnlargement: true });
    // ?cut=1 (Vision Board): shaped tiles (hex, fan, crazy pave, tumbled edges) still
    // sit on white after the rectangular trim - knock that white out to transparency.
    const cut = new URL(req.url).searchParams.get("cut") === "1" ? await cutout(await sized.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true })) : null;
    const out = cut ?? (await sized.webp({ quality: 84 }).toBuffer());
    return new NextResponse(new Uint8Array(out), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=604800, immutable" },
    });
  } catch {
    return NextResponse.redirect(u); // network hiccup - fall back to the original
  }
}
