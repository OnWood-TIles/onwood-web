import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAllowedImageHost } from "../../../lib/imageHosts";
import { snapWidth } from "../../../lib/rs";

// Image resizer behind lib/rs.ts: fetches a catalogue image, shrinks it to the requested width
// step and returns WebP. The response is immutable (source URLs carry their own version stamps),
// so Vercel's edge serves repeat requests without running this again. Fails open to the original.
export const runtime = "nodejs";

const YEAR = 31536000;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u") || "";
  const w = snapWidth(Number(url.searchParams.get("w")) || 828);
  const q = Math.min(90, Math.max(40, Number(url.searchParams.get("q")) || 74));

  let src: string;
  try { src = new URL(u, url.origin).toString(); } catch { return new NextResponse("bad url", { status: 400 }); }
  if (!isAllowedImageHost(src, url.origin)) return new NextResponse("bad url", { status: 400 });

  const original = () => {
    const res = NextResponse.redirect(src, 302);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  };

  try {
    const r = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(9000) });
    if (!r.ok) return original();
    const out = await sharp(Buffer.from(await r.arrayBuffer()))
      .rotate() // honour camera orientation before EXIF is dropped
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: q })
      .toBuffer();
    return new NextResponse(new Uint8Array(out), {
      headers: { "Content-Type": "image/webp", "Cache-Control": `public, max-age=${YEAR}, immutable` },
    });
  } catch {
    return original();
  }
}
