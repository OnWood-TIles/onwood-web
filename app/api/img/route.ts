import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import crypto from "node:crypto";
import { fetchAllowedImage } from "../../../lib/safeImageFetch";
import { rateLimit, clientIp } from "../../../lib/rateLimit";

// Self-hosting image proxy. Supplier product photos (e.g. ABI on
// abiinteriors.com.au) are hotlinked in the OnBase feed; if the supplier
// reorganises their media library the catalogue would go blank. This fetches
// each image ONCE, stores our own copy in Vercel Blob, and 302s to it. After
// the first hit every load comes from our storage, so we no longer depend on
// the supplier's URLs staying put. Fails open to the original on any error.
export const runtime = "nodejs";

// Only cache images from the supplier hosts lib/onbase/client.ts routes through here
// (SSRF guard; our own images are already self-hosted and never come this way).
const ALLOW = /^https:\/\/([a-z0-9-]+\.)?(abiinteriors\.com\.au|marquis\.com\.au)\//i;
const allowed = (u: string) => ALLOW.test(u);
const WEEK = 604800;

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") || "";
  if (!ALLOW.test(u)) return new NextResponse("bad url", { status: 400 });

  const key = crypto.createHash("sha1").update(u).digest("hex");
  const ext = (u.split("?")[0].match(/\.(jpe?g|png|webp|avif|gif)$/i)?.[1] || "jpg").toLowerCase();
  const pathname = `catalogue/${key}.${ext}`;

  const redirectTo = (url: string) => {
    const res = NextResponse.redirect(url, 302);
    // Cache the redirect so repeat views skip this function entirely.
    res.headers.set("Cache-Control", `public, max-age=${WEEK}`);
    return res;
  };

  // 1) Already have our own copy? Send them straight to it.
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const hit = blobs.find((b) => b.pathname === pathname);
    if (hit) return redirectTo(hit.url);
  } catch {
    /* no token / transient — fall through and try to fetch + cache */
  }

  // 2) Fetch the original, store our own copy, redirect to it. New copies are limited per
  //    visitor and per day, so nobody can fill our storage by inventing image addresses.
  if (!rateLimit(`img-miss:${clientIp(req)}`, 120, 600_000).ok || !rateLimit("img-miss:global:day", 3000, 86_400_000).ok) {
    return NextResponse.redirect(u, 302);
  }
  try {
    const got = await fetchAllowedImage(u, allowed, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://onwoodtiles.com.au/" },
    });
    if (!got) return NextResponse.redirect(u, 302);
    const buf = got.buf;
    const contentType = got.contentType.startsWith("image/") ? got.contentType : `image/${ext === "jpg" ? "jpeg" : ext}`;
    try {
      const saved = await put(pathname, buf, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType,
        cacheControlMaxAge: 31536000,
      });
      return redirectTo(saved.url);
    } catch {
      // Blob write unavailable (e.g. no token locally) — serve the bytes directly.
      return new NextResponse(new Uint8Array(buf), {
        headers: { "Content-Type": contentType, "Cache-Control": `public, max-age=${WEEK}` },
      });
    }
  } catch {
    return NextResponse.redirect(u, 302); // supplier hiccup — fall back to original
  }
}
