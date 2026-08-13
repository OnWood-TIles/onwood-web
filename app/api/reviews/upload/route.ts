import { NextResponse } from "next/server";
import { checkRateLimit, type RateRule } from "../../../../lib/rateLimit";
import { put } from "@vercel/blob";
import sharp from "sharp";
import crypto from "node:crypto";

// Review photo upload. Accepts ONE image from the review form, re-encodes it with
// sharp (which STRIPS EXIF/GPS metadata - important: customer job photos can carry
// a home address in their location tags), resizes it to a sensible max edge, and
// stores the webp result on Vercel Blob. Returns the public URL, which the review
// form then submits with the review. Rate-limited like the other public writes.
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_EDGE = 1600; // longest side, px
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

// Photo upload is heavier than a form post; keep the window tight (4 photos per
// review, so a burst of a handful in a short window is normal, more is abuse).
const RL_UPLOAD: RateRule[] = [
  { limit: 12, windowMs: 600_000 }, // 12 per 10 minutes
  { limit: 60, windowMs: 86_400_000 }, // 60 per day
];

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "reviews-upload", RL_UPLOAD);
  if (rl) return rl;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[reviews-upload] BLOB_READ_WRITE_TOKEN not set");
    return NextResponse.json(
      { ok: false, error: "Photo uploads aren't switched on right now." },
      { status: 503 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ ok: false, error: "No photo received." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "That photo is too large - please use one under 8MB." },
      { status: 413 },
    );
  }
  if (file.type && !ALLOWED.has(file.type.toLowerCase())) {
    return NextResponse.json(
      { ok: false, error: "Please upload a JPEG, PNG, WEBP or HEIC image." },
      { status: 415 },
    );
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    // Re-encode: sharp reads only the pixels, so EXIF/GPS/orientation metadata is
    // dropped (we .rotate() first to bake in orientation before that data is lost).
    // fit:"inside" + withoutEnlargement keeps the aspect ratio and never upscales.
    const webp = await sharp(input)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const name = `reviews/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.webp`;
    const blob = await put(name, webp, {
      access: "public",
      contentType: "image/webp",
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("[reviews-upload] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Sorry - that photo wouldn't upload. Please try another." },
      { status: 502 },
    );
  }
}
