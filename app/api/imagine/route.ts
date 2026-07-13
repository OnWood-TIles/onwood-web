import { NextResponse } from "next/server";
import sharp from "sharp";
import { buildImaginePrompt, type ImagineRequest } from "../../../lib/imagine";

// Image generation runs server-side (keeps the Cloudflare token off the client).
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic"; // never cache - every board is different

// Cloudflare Workers AI (Flux schnell). Set in Vercel + .env.local for dev:
//   CLOUDFLARE_ACCOUNT_ID — the account id (Cloudflare dashboard URL / overview)
//   CLOUDFLARE_AI_TOKEN   — API token with the "Workers AI" permission
//   CLOUDFLARE_AI_MODEL   — optional model override
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_AI_TOKEN;
const MODEL = process.env.CLOUDFLARE_AI_MODEL || "@cf/black-forest-labs/flux-1-schnell";

// Read the overall (average) colour of a swatch image as a hex, so the render
// uses the customer's real material colours. Average beats "dominant" for
// woodgrains (dominant grabs a grain streak). Fails-soft to null (name only).
async function swatchHex(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://onwoodtiles.com.au/",
      },
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    const c = (await sharp(buf).stats()).channels;
    if (!c || c.length < 3) return null;
    const h = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${h(c[0].mean)}${h(c[1].mean)}${h(c[2].mean)}`;
  } catch {
    return null;
  }
}

const COLOUR_KINDS = new Set(["flooring", "carpet", "timber", "tile"]);

// One Flux render from a prompt -> { image } on success, or { status } with the
// HTTP status on failure (so the caller can tell a rate-limit apart from a hiccup).
async function generateOne(
  prompt: string,
): Promise<{ image?: string; status?: number }> {
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, steps: 8 }),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[imagine] Cloudflare ${res.status}: ${detail.slice(0, 300)}`);
      return { status: res.status };
    }
    // flux-1-schnell returns JSON { result: { image: <base64> } }; some models
    // return raw image bytes - handle both.
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = (await res.json()) as { result?: { image?: string } };
      const b64 = data?.result?.image;
      return b64 ? { image: `data:image/jpeg;base64,${b64}` } : {};
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return { image: `data:${ct || "image/png"};base64,${buf.toString("base64")}` };
  } catch (err) {
    console.error("[imagine] gen failed:", err);
    return {};
  }
}

export async function POST(request: Request) {
  if (!ACCOUNT || !TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Room rendering isn't switched on yet." },
      { status: 503 },
    );
  }

  let req: ImagineRequest;
  try {
    req = (await request.json()) as ImagineRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Enrich material swatches with their real dominant colour (relative URLs are
  // resolved against this deployment; styling cut-outs are transparent, so skip).
  const base = new URL(request.url).origin;
  const abs = (u?: string) => (u && u.startsWith("/") ? base + u : u);
  const items = Array.isArray(req.items) ? req.items : [];
  await Promise.allSettled([
    ...items.map(async (it) => {
      if (!it.color && it.url && COLOUR_KINDS.has(it.kind)) {
        const hex = await swatchHex(abs(it.url));
        if (hex) it.color = hex;
      }
    }),
    (async () => {
      if (req.benchtop && !req.benchtopColor && req.benchtopUrl) {
        const hex = await swatchHex(abs(req.benchtopUrl));
        if (hex) req.benchtopColor = hex;
      }
    })(),
  ]);

  const prompt = buildImaginePrompt(req);
  const count = Math.min(Math.max(Number(req.count) || 1, 1), 4);

  // Generate the variations in parallel from the same prompt (Flux is random per
  // call, so each comes out different). Return whichever succeed.
  const results = await Promise.all(
    Array.from({ length: count }, () => generateOne(prompt)),
  );
  const images = results
    .map((r) => r.image)
    .filter((x): x is string => Boolean(x));
  if (!images.length) {
    // 429 = Cloudflare's daily free-neuron allocation is used up (resets daily).
    const limited = results.some((r) => r.status === 429);
    return NextResponse.json(
      {
        ok: false,
        error: limited
          ? "Room rendering has reached today's free daily limit. It resets each day - please try again later."
          : "The render service had a hiccup, please try again.",
      },
      { status: limited ? 429 : 502 },
    );
  }
  return NextResponse.json(
    { ok: true, images, image: images[0], prompt },
    { headers: { "Cache-Control": "no-store" } },
  );
}
