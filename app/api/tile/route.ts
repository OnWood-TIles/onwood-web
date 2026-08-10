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
    let out: Buffer;
    try {
      out = await sharp(buf).trim({ background: "#ffffff", threshold: 18 }).resize(700, 700, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    } catch {
      // trim can throw on an image that is all one colour - serve it un-trimmed.
      out = await sharp(buf).resize(700, 700, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    }
    return new NextResponse(new Uint8Array(out), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=604800, immutable" },
    });
  } catch {
    return NextResponse.redirect(u); // network hiccup - fall back to the original
  }
}
