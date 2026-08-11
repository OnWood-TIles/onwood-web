import { NextResponse } from "next/server";
import { checkRateLimit, checkDailyCap, RL_AI } from "../../../lib/rateLimit";
import { isAllowedImageHost } from "../../../lib/imageHosts";
import crypto from "node:crypto";
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";
import { buildImaginePrompt, classifyTile, defaultTileSurface, resolveTileSurfaces, type ImagineRequest, type TileSurface } from "../../../lib/imagine";

// "Imagine my room" — the HIGH-QUALITY room visualiser. Unlike /api/imagine
// (text-only Cloudflare Flux), this feeds the customer's EXACT chosen product
// swatches to Google Gemini as reference images (image-to-image), so the render
// shows the real materials, not an approximation.
//
// Gemini image generation costs money, so each visitor is capped (a signed,
// httpOnly cookie counts generations per day).
export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.1-flash-image"; // "Good" tier — sharp, ~4K
const DAILY_LIMIT = 3;
const MAX_REF_IMAGES = 6; // cap reference images sent to Gemini (cost + focus)
const COOKIE = "ow_rv";
const SECRET = process.env.RV_COOKIE_SECRET || process.env.ONBASE_API_KEY || "onwood-room-visual";

// ── per-visitor daily cap (signed cookie) ───────────────────────────────────
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date());

const sign = (payload: string) =>
  crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");

function readCount(cookieHeader: string | null): number {
  const raw = (cookieHeader || "").split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return 0;
  const val = decodeURIComponent(raw.slice(COOKIE.length + 1));
  const [body, sig] = val.split(".");
  if (!body || !sig || sign(body) !== sig) return 0; // tampered / unsigned
  try {
    const { d, n } = JSON.parse(Buffer.from(body, "base64url").toString()) as { d: string; n: number };
    return d === today() ? Number(n) || 0 : 0; // a new day resets the count
  } catch {
    return 0;
  }
}

function cookieFor(count: number): string {
  const body = Buffer.from(JSON.stringify({ d: today(), n: count })).toString("base64url");
  const val = `${body}.${sign(body)}`;
  // ~2 days so the day rolls over cleanly; httpOnly so the client can't forge it.
  return `${COOKIE}=${encodeURIComponent(val)}; Path=/; Max-Age=172800; HttpOnly; SameSite=Lax; Secure`;
}

// ── image helpers ───────────────────────────────────────────────────────────
type Ref = { mimeType: string; data: string; buffer: Buffer };

async function fetchImage(url: string, self: string): Promise<Ref | null> {
  if (!isAllowedImageHost(url, self)) return null; // SSRF guard
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://onwoodtiles.com.au/" },
    });
    if (!r.ok) return null;
    const buffer = Buffer.from(await r.arrayBuffer());
    // Normalise to a modest JPEG so odd formats (webp/avif) and huge sources are
    // safe + cheap to send to Gemini.
    const jpeg = await sharp(buffer).resize(768, 768, { fit: "inside" }).jpeg({ quality: 86 }).toBuffer();
    return { mimeType: "image/jpeg", data: jpeg.toString("base64"), buffer: jpeg };
  } catch {
    return null;
  }
}

const avgHex = async (buf: Buffer): Promise<string | null> => {
  try {
    const c = (await sharp(buf).stats()).channels;
    if (!c || c.length < 3) return null;
    const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${h(c[0].mean)}${h(c[1].mean)}${h(c[2].mean)}`;
  } catch {
    return null;
  }
};

// The role each reference image plays, so the prompt can tell Gemini where to
// use it. Priority order decides which images make the MAX_REF_IMAGES cut.
function roleFor(kind: string, name: string, sub?: string, surfaces?: TileSurface[]): { label: string; priority: number } | null {
  switch (kind) {
    case "tile": {
      // The customer's explicit choice(s) win; a tile can serve several surfaces.
      const s = surfaces && surfaces.length ? surfaces : [defaultTileSurface(name, sub)];
      const parts: string[] = [];
      if (s.includes("floor")) parts.push("the FLOOR (large-format porcelain laid across the floor)");
      if (s.includes("wall")) parts.push("a WALL / SPLASHBACK");
      if (s.includes("feature"))
        parts.push(classifyTile(name, sub) === "stone" ? "a natural-stone FEATURE WALL cladding" : "a MOSAIC / FEATURE WALL accent");
      const priority = s.includes("floor") ? 1 : s.includes("wall") ? 3 : 4;
      return { label: `used on ${parts.join(" and ")}`, priority };
    }
    case "flooring":
      return { label: "the FLOOR (timber-look boards across the floor)", priority: 2 };
    case "timber":
      return { label: "the CABINETRY / JOINERY finish", priority: 5 };
    case "carpet":
      return { label: "the CARPET / soft flooring", priority: 6 };
    case "metal":
      return { label: "the TAPWARE / hardware finish", priority: 7 };
    case "styling":
      return { label: "a styling / decor accent to place in the room", priority: 9 };
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "roomvisual", RL_AI);
  if (rl) return rl;
  const cap = checkDailyCap("roomvisual", 200, "Room rendering has reached today's limit, please try again tomorrow.");
  if (cap) return cap;

  if (!KEY) {
    return NextResponse.json({ ok: false, error: "Room rendering isn't switched on yet." }, { status: 503 });
  }

  // Daily cap.
  const used = readCount(request.headers.get("cookie"));
  if (used >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        ok: false,
        remaining: 0,
        error: `You've used all ${DAILY_LIMIT} room visuals for today. It resets tomorrow - or pop into the showroom and we'll design it with you.`,
      },
      { status: 429 },
    );
  }

  let req: ImagineRequest;
  try {
    req = (await request.json()) as ImagineRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const base = new URL(request.url).origin;
  const abs = (u?: string) => {
    if (!u) return u;
    // Unwrap the /api/tile trimmer proxy to its real source image. The AI
    // reference doesn't need the white margin trimmed, and fetching through the
    // proxy is a nested request that just adds latency (and can be skipped on a
    // slow trim, dropping the reference). Go straight to the source instead.
    if (u.includes("/api/tile")) {
      const m = u.match(/[?&]u=([^&]+)/);
      if (m) { try { return decodeURIComponent(m[1]); } catch { /* fall through */ } }
    }
    return u.startsWith("/") ? base + u : u;
  };
  const items = Array.isArray(req.items) ? req.items : [];

  // The customer's tile placements (tile name -> floor/wall/feature). A tile placed
  // on the floor takes priority over any timber flooring sample (drop the flooring).
  const placements = req.tilePlacements || {};
  const tileSurfaces = (it: (typeof items)[number]): TileSurface[] | undefined =>
    it.kind === "tile" ? resolveTileSurfaces(it.name, it.sub, placements) : undefined;
  const hasFloorTile = items.some((it) => it.kind === "tile" && resolveTileSurfaces(it.name, it.sub, placements).includes("floor"));

  // Pick the material swatches worth sending as reference images, by priority.
  const candidates = items
    .filter((it) => !(hasFloorTile && it.kind === "flooring"))
    .map((it) => ({ it, role: roleFor(it.kind, it.name, it.sub, tileSurfaces(it)) }))
    .filter((x): x is { it: (typeof items)[number]; role: { label: string; priority: number } } => Boolean(x.role && x.it.url));
  if (req.benchtop && req.benchtopUrl) {
    candidates.push({
      it: { kind: "benchtop", name: req.benchtop, url: req.benchtopUrl },
      role: { label: "the BENCHTOP (natural stone)", priority: 2 },
    });
  }
  candidates.sort((a, b) => a.role.priority - b.role.priority);

  // Fetch the chosen references once; reuse the buffer for both the Gemini part
  // and the average colour that enriches the text prompt.
  const chosen = candidates.slice(0, MAX_REF_IMAGES);
  const refs = await Promise.all(
    chosen.map(async ({ it, role }) => {
      const img = await fetchImage(abs(it.url)!, base);
      if (!img) return null;
      if (!it.color) {
        const hex = await avgHex(img.buffer);
        if (hex) it.color = hex; // feed the text prompt too
        if (it.kind === "benchtop" && !req.benchtopColor && hex) req.benchtopColor = hex;
      }
      return { role: role.label, name: it.name, img };
    }),
  );
  const usable = refs.filter((r): r is NonNullable<typeof r> => Boolean(r));

  // Text prompt: reuse the art-directed builder, then bind each reference image
  // to its surface so Gemini uses the EXACT sample where it belongs.
  const artPrompt = buildImaginePrompt(req);
  const refLines = usable
    .map((r, i) => `Reference image ${i + 1} = ${r.name}: use it as ${r.role}.`)
    .join(" ");
  const prompt = [
    artPrompt,
    usable.length
      ? `IMPORTANT: The attached reference images are the customer's EXACT chosen product samples. Reproduce each one faithfully - match its real colour, texture, veining, grain and finish precisely, and place it exactly as described. ${refLines}`
      : "",
    "Do not invent different materials. Keep every surface true to the attached samples.",
  ]
    .filter(Boolean)
    .join(" ");

  // Generate one high-quality render with Gemini (references first, prompt last).
  try {
    const ai = new GoogleGenAI({ apiKey: KEY });
    const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [
      ...usable.map((r) => ({ inlineData: { mimeType: r.img.mimeType, data: r.img.data } })),
      { text: prompt },
    ];
    // Cap the Gemini call well under the 120s function limit. If the image model
    // is slow/overloaded, a plain await would run until Vercel kills the function
    // and returns an HTML timeout page - which the client can't parse as JSON
    // ("Unexpected token '<'"). Racing a timeout lets us return a clean JSON error.
    const resp = (await Promise.race([
      ai.models.generateContent({ model: MODEL, contents: [{ role: "user", parts }] }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("gemini-timeout")), 75000)),
    ])) as Awaited<ReturnType<typeof ai.models.generateContent>>;
    const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!out?.inlineData?.data) {
      console.error("[room-visual] no image in Gemini response");
      return NextResponse.json({ ok: false, error: "The render service had a hiccup, please try again." }, { status: 502 });
    }
    const image = `data:${out.inlineData.mimeType || "image/png"};base64,${out.inlineData.data}`;
    const remaining = DAILY_LIMIT - (used + 1);
    return NextResponse.json(
      { ok: true, image, images: [image], prompt, remaining },
      { headers: { "Set-Cookie": cookieFor(used + 1), "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const timedOut = err instanceof Error && err.message === "gemini-timeout";
    console.error("[room-visual] Gemini failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: timedOut
          ? "The image service is busy right now and the render took too long. Please try again in a moment."
          : "The render service had a hiccup, please try again.",
      },
      { status: timedOut ? 503 : 502 },
    );
  }
}
