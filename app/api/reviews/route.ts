import { NextResponse } from "next/server";
import { checkRateLimit, clientIp, type RateRule } from "../../../lib/rateLimit";
import { submitReview } from "../../../lib/onbase/client";

// Public product-review submission. Creates a PENDING review in OnBase (moderated
// there before it ever shows on the site). Mirrors the site's other forms: a
// hidden `company` honeypot silently drops bots, and per-IP rate limits blunt
// spam. Fails CLOSED - if OnBase rejects the write, the customer is told, so a
// genuine review is never silently lost.
export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// A little tighter than the generic form limit - a person leaves at most a
// handful of reviews in a sitting; anything faster is abuse.
const RL_REVIEW: RateRule[] = [
  { limit: 5, windowMs: 600_000 }, // 5 per 10 minutes
  { limit: 20, windowMs: 86_400_000 }, // 20 per day
];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "reviews", RL_REVIEW);
  if (rl) return rl;

  let b: Record<string, unknown>;
  try {
    b = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields; pretend success + drop (never saved).
  if (typeof b.company === "string" && b.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const productId = str(b.productId);
  const authorName = str(b.authorName);
  const authorEmail = str(b.authorEmail);
  const rating = Math.round(typeof b.rating === "number" ? b.rating : Number(b.rating));
  const title = str(b.title);
  const body = str(b.body);
  const orderRef = str(b.orderRef);

  // Photos: only accept a short list of https urls (they come back from our own
  // upload route, which returns Vercel Blob URLs). Anything else is discarded.
  const images = Array.isArray(b.images)
    ? b.images
        .filter((u): u is string => typeof u === "string" && /^https:\/\//i.test(u))
        .slice(0, 4)
    : [];

  if (!productId) {
    return NextResponse.json({ ok: false, error: "Missing product." }, { status: 400 });
  }
  if (!authorName || authorName.length > 80) {
    return NextResponse.json({ ok: false, error: "Please add your name." }, { status: 400 });
  }
  if (!authorEmail || !EMAIL_RE.test(authorEmail)) {
    return NextResponse.json({ ok: false, error: "Please add a valid email address." }, { status: 400 });
  }
  if (!(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ ok: false, error: "Please choose a star rating." }, { status: 400 });
  }
  if (body.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Please add a little more to your review (at least a sentence)." },
      { status: 400 },
    );
  }
  if (body.length > 4000) {
    return NextResponse.json({ ok: false, error: "That review is a bit long - please shorten it." }, { status: 400 });
  }

  try {
    await submitReview({
      productId,
      authorName,
      authorEmail,
      rating,
      title: title || undefined,
      body,
      images: images.length ? images : undefined,
      orderRef: orderRef || undefined,
      ip: clientIp(request),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reviews] submit failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Sorry - we couldn't send your review just now. Please try again shortly, or email sales@onwoodtiles.com.au.",
      },
      { status: 502 },
    );
  }
}
