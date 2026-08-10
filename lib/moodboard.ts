// Server-side "Mood Board" builder for the vision-board Share flow.
//
//   composeBoardImage()  - recreates the customer's benchtop arrangement as a PNG
//                          (sharp: the Caesarstone background + every placed piece
//                          composited at its position, in stacking order).
//   buildMoodboardPdf()  - lays that image into a branded A4 PDF (pdf-lib) with a
//                          grouped list of the finishes they chose + supplier.
//
// pdf-lib is used (not pdfkit) because it is pure-JS with built-in StandardFonts,
// so it needs no .afm font files at runtime - safe on Vercel's serverless bundler.

import sharp from "sharp";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage, type Color } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export type SharePiece = {
  kind: string;
  name: string;
  color?: string; // hex (paint/decor) or metal mid-tone
  url?: string; // swatch/render image (http(s), /relative, or data: URL)
  sub?: string; // range / collection / finish
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

export type SharePayload = {
  customer: {
    name: string;
    phone?: string;
    email?: string;
    suburb?: string;
    postcode?: string;
  };
  board: { w: number; h: number; stoneName?: string | null; stoneUrl?: string | null };
  pieces: SharePiece[];
};

const TARGET_W = 1400; // composite width (downscaled into the PDF, so crisp)

// ---- image helpers ---------------------------------------------------------

async function fetchImg(url: string): Promise<Buffer | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://onwoodtiles.com.au/" },
    });
    clearTimeout(t);
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

// Resolve a piece image: data: URL -> decode; /relative -> origin; else fetch.
async function resolveImg(url: string, origin: string): Promise<Buffer | null> {
  if (url.startsWith("data:")) {
    const b64 = url.split(",")[1] || "";
    try {
      return Buffer.from(b64, "base64");
    } catch {
      return null;
    }
  }
  const abs = url.startsWith("/") ? origin + url : url;
  return fetchImg(abs);
}

// Load a bundled public/ asset. Prefer fetching it over HTTP from the origin
// (reliable on Vercel, where serverless functions don't get public/ on disk);
// fall back to a local read for dev/offline (no server running).
async function loadAsset(rel: string, origin: string): Promise<Buffer | null> {
  const viaHttp = await fetchImg(origin + rel);
  if (viaHttp) return viaHttp;
  try {
    return await readFile(path.join(process.cwd(), "public", rel.replace(/^\//, "")));
  } catch {
    return null;
  }
}

const roundMask = (w: number, h: number, r: number) =>
  Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`,
  );

// Fan-deck "punch hole": a dark ring + a real see-through cutout (the benchtop
// shows through) near the top-centre. Used on paint chips AND cabinetry samples,
// matching the on-screen fan-deck chip look. Circles only, so no fonts involved.
async function punchHole(img: Buffer, pw: number, ph: number): Promise<Buffer> {
  const r = pw * 0.06;
  const cx = pw / 2;
  const cy = ph * 0.11;
  const ring = Buffer.from(
    `<svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg"><circle cx="${cx}" cy="${cy}" r="${r + 1.5}" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/></svg>`,
  );
  const hole = Buffer.from(
    `<svg width="${pw}" height="${ph}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/></svg>`,
  );
  const withRing = await sharp(img).composite([{ input: ring }]).png().toBuffer();
  return sharp(withRing).composite([{ input: hole, blend: "dest-out" }]).png().toBuffer();
}

// Build a single piece as a PNG buffer sized pw x ph.
async function buildPiece(
  p: SharePiece,
  pw: number,
  ph: number,
  origin: string,
): Promise<Buffer | null> {
  // Transparent styling cut-outs: keep alpha, fit inside, no rounding.
  if (p.kind === "styling" && p.url) {
    const raw = await resolveImg(p.url, origin);
    if (raw)
      return sharp(raw)
        .resize(pw, ph, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
  }

  // Image-backed swatches (carpet/flooring/tile/render/timber): cover + rounded.
  if (
    p.url &&
    ["carpet", "flooring", "tile", "render", "timber"].includes(p.kind)
  ) {
    const raw = await resolveImg(p.url, origin);
    if (raw) {
      const r = p.kind === "render" ? 8 : p.kind === "tile" ? 3 : 16;
      const resized = await sharp(raw).resize(pw, ph, { fit: "cover" }).toBuffer();
      const rounded = await sharp(resized)
        .composite([{ input: roundMask(pw, ph, r), blend: "dest-in" }])
        .png()
        .toBuffer();
      // Cabinetry samples (Laminex + Polytec) get the fan-deck punch hole too,
      // to match the paint chips + their on-screen look.
      return p.kind === "timber" ? punchHole(rounded, pw, ph) : rounded;
    }
  }

  // Metal disc: real texture in a circle if we have one, else the tone.
  if (p.kind === "metal") {
    const d = Math.min(pw, ph);
    if (p.url) {
      const raw = await resolveImg(p.url, origin);
      if (raw) {
        const resized = await sharp(raw).resize(d, d, { fit: "cover" }).toBuffer();
        const circle = Buffer.from(
          `<svg width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}"/></svg>`,
        );
        return sharp(resized)
          .composite([{ input: circle, blend: "dest-in" }])
          .png()
          .toBuffer();
      }
    }
    const col = p.color || "#b8b2a6";
    return sharp(
      Buffer.from(
        `<svg width="${d}" height="${d}" xmlns="http://www.w3.org/2000/svg"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - 2}" fill="${col}" stroke="rgba(0,0,0,.18)" stroke-width="2"/></svg>`,
      ),
    )
      .png()
      .toBuffer();
  }

  // Paint / decor chip: a clean rounded colour card. Deliberately NO SVG <text> -
  // librsvg has no fonts on the serverless runtime, so text would render blank.
  // The finish names live in the PDF's finishes list instead (drawn with pdf-lib
  // fonts, which are reliable). Paint chips also get the fan-deck "punch hole" as
  // a real see-through cutout (the benchtop shows through) - circles only, no fonts.
  const col = p.color || "#c9c2b4";
  const cardSvg = `<svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="${pw - 3}" height="${ph - 3}" rx="16" ry="16" fill="${col}" stroke="rgba(0,0,0,.16)" stroke-width="1.5"/>
    <rect x="1.5" y="1.5" width="${pw - 3}" height="7" rx="14" fill="rgba(255,255,255,.4)"/>
  </svg>`;
  const card = await sharp(Buffer.from(cardSvg)).png().toBuffer();
  // Paint chips get the fan-deck punch hole; decor colour chips stay solid.
  return p.kind === "paint" ? punchHole(card, pw, ph) : card;
}

export async function composeBoardImage(
  payload: SharePayload,
  origin: string,
): Promise<Buffer> {
  const bw = Math.max(400, payload.board.w || 900);
  const bh = Math.max(300, payload.board.h || 560);
  const scale = TARGET_W / bw;
  const W = Math.round(bw * scale);
  const H = Math.round(bh * scale);

  // Background: the selected Caesarstone stone, else the default marble board.
  let bgBuf: Buffer | null = null;
  if (payload.board.stoneUrl) bgBuf = await resolveImg(payload.board.stoneUrl, origin);
  if (!bgBuf) bgBuf = await loadAsset("/images/colour-board.jpg", origin);

  // The benchtop is often upscaled to fill the (tall, on mobile) board, so a mild
  // sharpen restores crispness in the stone veining after the resize.
  const base = bgBuf
    ? sharp(
        await sharp(bgBuf)
          .resize(W, H, { fit: "cover" })
          .sharpen({ sigma: 1 })
          .toBuffer(),
      )
    : sharp({
        create: { width: W, height: H, channels: 3, background: "#efece5" },
      });

  // Composite pieces bottom-up in stacking (z) order at their EXACT board positions.
  const ordered = [...payload.pieces].sort((a, b) => (a.z || 0) - (b.z || 0));
  const composites: sharp.OverlayOptions[] = [];
  for (const p of ordered) {
    const pw = Math.max(8, Math.round(p.w * scale));
    const ph = Math.max(8, Math.round(p.h * scale));
    const left = Math.round(p.x * scale);
    const top = Math.round(p.y * scale);
    try {
      const buf = await buildPiece(p, pw, ph, origin);
      if (buf) composites.push({ input: buf, left, top });
    } catch {
      /* skip a piece that fails to build */
    }
  }

  // Return the FULL board exactly as the customer arranged it on screen - same
  // canvas, same positions + spacing. We deliberately do NOT crop to the pieces:
  // that "jammed" everything together and lost their layout. The PDF places this
  // image contained (never stretched), so a portrait (mobile) or landscape
  // (desktop) board each keeps its true look.
  return base.composite(composites).png().toBuffer();
}

// ---- PDF -------------------------------------------------------------------

// Palette matched to the OnWood emails/brand: warm cream ground, teal-ink ("teak")
// for text + the dark band, terracotta accent.
const CREAM = rgb(0.965, 0.945, 0.91); // #f6f1e8
const INK = rgb(0.125, 0.188, 0.227); // #20303a teal-ink
const MUTED = rgb(0.42, 0.478, 0.502); // #6b7a80 muted teal-grey
const FAINT = rgb(0.55, 0.6, 0.62);
const LINE = rgb(0.87, 0.845, 0.8);
const ACCENT = rgb(0.816, 0.416, 0.271); // #d06a45 terracotta
const DARK = rgb(0.125, 0.188, 0.227); // #20303a — same teal-ink band as the emails
const ONCREAM = rgb(0.965, 0.945, 0.91);

// Names can carry accents; keep to what the embedded fonts cover (Latin-1).
const safe = (s: string) => (s || "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim();

// Supplier / manufacturer per piece kind, for the finishes list.
const SUPPLIERS: Record<string, { label: string; supplier: string }> = {
  paint: { label: "Paint", supplier: "Dulux" },
  tile: { label: "Tiles", supplier: "OnWood Tiles" },
  flooring: { label: "Flooring", supplier: "Quick-Step" },
  carpet: { label: "Carpet", supplier: "Godfrey Hirst" },
  timber: { label: "Cabinetry", supplier: "Laminex" },
  metal: { label: "Metal", supplier: "Designer finish" },
  styling: { label: "Styling", supplier: "OnWood" },
  chip: { label: "Decor", supplier: "" },
};
const GROUP_ORDER = ["paint", "tile", "flooring", "carpet", "timber", "metal", "styling", "chip"];
const IMAGE_KINDS = new Set(["tile", "flooring", "carpet", "timber", "styling", "metal"]);

// Cover-fit a photo to wPx x hPx with rounded (transparent) corners, so images
// sit as rounded cards on the cream page with no stretch.
async function roundedCover(buf: Buffer, wPx: number, hPx: number, rPx: number): Promise<Buffer | null> {
  try {
    const w = Math.max(2, Math.round(wPx));
    const h = Math.max(2, Math.round(hPx));
    const resized = await sharp(buf).resize(w, h, { fit: "cover" }).toBuffer();
    return sharp(resized).composite([{ input: roundMask(w, h, rPx), blend: "dest-in" }]).png().toBuffer();
  } catch {
    return null;
  }
}

type Finish = { key: string; cat: string; name: string; sub: string; url?: string; color?: string };

export async function buildMoodboardPdf(
  payload: SharePayload,
  boardPng: Buffer,
  dateStr: string,
  origin: string,
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  // Embed the design's Instrument Serif + Space Mono; Helvetica covers the sans.
  // Any font that can't load falls back so a PDF always renders.
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const loadFont = async (rel: string, fallback: PDFFont): Promise<PDFFont> => {
    try {
      const bytes = await loadAsset(rel, origin);
      if (bytes) return await pdf.embedFont(bytes, { subset: true });
    } catch {
      /* fall back */
    }
    return fallback;
  };
  const serif = await loadFont("/fonts/InstrumentSerif-Regular.ttf", helvB);
  const mono = await loadFont("/fonts/SpaceMono-Regular.ttf", helv);
  const monoB = await loadFont("/fonts/SpaceMono-Bold.ttf", helvB);

  const W = 595.28;
  const H = 841.89;
  const M = 44;
  const cw = W - M * 2;

  // Top-origin text helpers (pdf-lib's y is measured from the bottom).
  const T = (page: PDFPage, s: string, x: number, top: number, size: number, font: PDFFont, color: Color) =>
    page.drawText(safe(s), { x, y: H - top - size, size, font, color });
  const TR = (page: PDFPage, s: string, xRight: number, top: number, size: number, font: PDFFont, color: Color) =>
    T(page, s, xRight - font.widthOfTextAtSize(safe(s), size), top, size, font, color);
  const fitSize = (s: string, font: PDFFont, maxW: number, start: number, min: number) => {
    let sz = start;
    while (sz > min && font.widthOfTextAtSize(safe(s), sz) > maxW) sz -= 0.5;
    return sz;
  };
  const ellipsize = (s: string, font: PDFFont, size: number, maxW: number) => {
    let t = safe(s);
    if (font.widthOfTextAtSize(t, size) <= maxW) return t;
    while (t.length > 1 && font.widthOfTextAtSize(`${t}...`, size) > maxW) t = t.slice(0, -1);
    return `${t}...`;
  };
  const wrap = (page: PDFPage, text: string, x: number, top: number, maxW: number, size: number, font: PDFFont, color: Color, lineH = size * 1.5) => {
    const words = safe(text).split(/\s+/);
    let line = "";
    let used = 0;
    const flush = () => { T(page, line, x, top + used, size, font, color); used += lineH; };
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) > maxW && line) { flush(); line = w; } else line = t;
    }
    if (line) flush();
    return used;
  };
  const hexRgb = (hex?: string): Color => {
    const m = (hex || "").replace("#", "").match(/^([0-9a-f]{6})$/i);
    if (!m) return rgb(0.85, 0.83, 0.79);
    const int = parseInt(m[1], 16);
    return rgb(((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255);
  };
  const bg = (page: PDFPage) => page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
  const footer = (page: PDFPage) => {
    page.drawLine({ start: { x: M, y: 52 }, end: { x: W - M, y: 52 }, thickness: 0.75, color: LINE });
    page.drawText(safe("2/11 Packer Road, Baringa QLD   ·   onwoodtiles.com.au   ·   sales@onwoodtiles.com.au"), { x: M, y: 36, size: 8, font: mono, color: MUTED });
  };

  // ── gather the finishes (benchtop first, then grouped, deduped) ──────────────
  const finishes: Finish[] = [];
  finishes.push({
    key: "benchtop",
    cat: "BENCHTOP",
    name: payload.board.stoneName || "Caesarstone benchtop",
    sub: payload.board.stoneName ? "Caesarstone" : "",
    url: payload.board.stoneUrl || undefined,
  });
  for (const kind of GROUP_ORDER) {
    const meta = SUPPLIERS[kind];
    if (!meta) continue;
    const seen = new Set<string>();
    for (const p of payload.pieces) {
      if (p.kind !== kind) continue;
      const n = (p.name || "").trim();
      const nk = n.toLowerCase();
      if (!n || seen.has(nk)) continue;
      seen.add(nk);
      finishes.push({
        key: `${kind}:${nk}`,
        cat: meta.label.toUpperCase(),
        name: n,
        // Tiles are our own range - always "OnWood Tiles" (never the old GlowTile
        // placeholder + a redundant "Tiles" category).
        sub: kind === "tile" ? "OnWood Tiles" : [meta.supplier, p.sub].filter(Boolean).join(", "),
        url: IMAGE_KINDS.has(kind) ? p.url : undefined,
        color: p.color,
      });
    }
  }

  // Pre-embed swatch thumbnails (rounded).
  const thumbs: Record<string, PDFImage | null> = {};
  await Promise.all(
    finishes.map(async (f) => {
      if (!f.url) { thumbs[f.key] = null; return; }
      try {
        const raw = await resolveImg(f.url, origin);
        const rc = raw ? await roundedCover(raw, 72, 72, 10) : null;
        thumbs[f.key] = rc ? await pdf.embedPng(rc) : null;
      } catch {
        thumbs[f.key] = null;
      }
    }),
  );

  // ── PAGE 1 ───────────────────────────────────────────────────────────────
  const page1 = pdf.addPage([W, H]);
  bg(page1);
  let y = 42;

  // Top bar: LARGE ink logo + right-aligned meta.
  const inkLogo = (await loadAsset("/onwood-logo-ink.png", origin)) || (await loadAsset("/onwood-logo-ink-tight.png", origin));
  let logoBottom = y + 30;
  if (inkLogo) {
    try {
      const img = await pdf.embedPng(inkLogo);
      const lw = 190; // much larger than before
      const lh = (img.height / img.width) * lw;
      page1.drawImage(img, { x: M, y: H - y - lh, width: lw, height: lh });
      logoBottom = y + lh;
    } catch {
      T(page1, "OnWood Tiles", M, y + 2, 26, serif, INK);
      logoBottom = y + 30;
    }
  } else {
    T(page1, "OnWood Tiles", M, y + 2, 26, serif, INK);
  }
  TR(page1, "VISION BOARD", W - M, y + 2, 9, monoB, ACCENT);
  TR(page1, dateStr, W - M, y + 18, 8.5, mono, MUTED);

  y = logoBottom + 20;
  page1.drawLine({ start: { x: M, y: H - y }, end: { x: W - M, y: H - y }, thickness: 0.75, color: LINE });
  y += 18;

  // Prepared-for + big serif name (auto-shrinks to fit). Kept compact so the
  // board below reads large (Reagan: the moodboard should fill ~half the page).
  T(page1, "PREPARED FOR", M, y, 8.5, monoB, MUTED);
  y += 19;
  const nm = payload.customer.name || "Your vision board";
  const nmSize = fitSize(nm, serif, cw, 34, 22);
  T(page1, ellipsize(nm, serif, nmSize, cw), M, y, nmSize, serif, INK);
  y += nmSize * 0.96 + 8;

  y += wrap(
    page1,
    "The finishes you chose on our Vision Board - and your room, brought to life. Reply to your email or drop in, and we'll help make it real.",
    M, y, cw, 10.5, helv, MUTED, 14,
  );
  y += 16;

  // A LARGE hero of the board they built (full width), with the finishes laid out
  // in columns UNDERNEATH it - so the board reads big and every name shows in full.
  const contentBottom = H - 66; // stay clear of the footer

  // Reserve the finishes block at the bottom: a 2-column grid keeps each name
  // wide enough to show the full tile name + variation without truncating.
  const fCols = 2;
  const fRows = Math.max(1, Math.ceil(finishes.length / fCols));
  const fRowH = 46;
  const fColGap = 22;
  const finishesH = 24 + fRows * fRowH;
  const finishesTop = contentBottom - finishesH;

  // BOARD: full content width, as tall as the room between the intro and the
  // finishes allows (contained, never stretched).
  const boardTop = y;
  let bImg: PDFImage | null = null;
  try { bImg = await pdf.embedPng(boardPng); } catch { bImg = null; }
  if (bImg) {
    const bAr = bImg.width / bImg.height;
    const boxH = Math.max(170, finishesTop - 28 - boardTop);
    let iw = cw;
    let ih = iw / bAr;
    if (ih > boxH) { ih = boxH; iw = ih * bAr; }
    const ix = M + (cw - iw) / 2;
    page1.drawRectangle({ x: ix - 1.5, y: H - boardTop - ih - 1.5, width: iw + 3, height: ih + 3, borderColor: LINE, borderWidth: 1 });
    page1.drawImage(bImg, { x: ix, y: H - boardTop - ih, width: iw, height: ih });
    T(page1, "YOUR BOARD", M, boardTop + ih + 11, 8, monoB, MUTED);
  }

  // FINISHES: numbered swatch rows in columns; the name auto-shrinks to fit its
  // column so the full name + variation is never cut off.
  T(page1, "YOUR FINISHES", M, finishesTop, 9, monoB, ACCENT);
  const gridTop = finishesTop + 24;
  const colW = (cw - fColGap * (fCols - 1)) / fCols;
  finishes.forEach((f, i) => {
    const col = i % fCols;
    const row = Math.floor(i / fCols);
    const colX = M + col * (colW + fColGap);
    const ry = gridTop + row * fRowH;
    const sz = 32;
    T(page1, String(i + 1).padStart(2, "0"), colX, ry + 7, 9, mono, FAINT);
    const tx = colX + 20;
    const thumb = thumbs[f.key];
    if (thumb) {
      page1.drawImage(thumb, { x: tx, y: H - ry - sz, width: sz, height: sz });
    } else if (f.color) {
      page1.drawRectangle({ x: tx, y: H - ry - sz, width: sz, height: sz, color: hexRgb(f.color), borderColor: LINE, borderWidth: 0.75 });
    } else {
      page1.drawRectangle({ x: tx, y: H - ry - sz, width: sz, height: sz, color: rgb(0.9, 0.88, 0.84) });
    }
    const bx = tx + sz + 10;
    const tw = colX + colW - bx;
    T(page1, f.cat, bx, ry, 7.5, mono, MUTED);
    const nSize = fitSize(f.name, helvB, tw, 11.5, 8);
    T(page1, f.name, bx, ry + 12, nSize, helvB, INK);
    if (f.sub) T(page1, ellipsize(f.sub, helv, 8.5, tw), bx, ry + 26, 8.5, helv, MUTED);
    page1.drawLine({ start: { x: colX, y: H - (ry + fRowH - 10) }, end: { x: colX + colW, y: H - (ry + fRowH - 10) }, thickness: 0.5, color: LINE });
  });
  footer(page1);

  // ── PAGE 2 ───────────────────────────────────────────────────────────────
  const page2 = pdf.addPage([W, H]);
  bg(page2);
  let y2 = 50;
  T(page2, "THE ROOM", M, y2, 8.5, monoB, ACCENT);
  y2 += 20;
  const hSize = fitSize("Step inside your future room.", serif, cw, 34, 22);
  T(page2, "Step inside your future room.", M, y2, hSize, serif, INK);
  y2 += hSize * 0.96 + 18;

  // Embed a render into a box at ~2x resolution (crisp), rounded.
  const embedRender = async (url: string, wPt: number, hPt: number): Promise<PDFImage | null> => {
    try {
      const raw = await resolveImg(url, origin);
      const rc = raw ? await roundedCover(raw, wPt * 2, hPt * 2, 18) : null;
      return rc ? await pdf.embedPng(rc) : null;
    } catch {
      return null;
    }
  };
  const soft = (x: number, top: number, w: number, h: number) =>
    page2.drawRectangle({ x, y: H - top - h, width: w, height: h, color: rgb(0.93, 0.91, 0.87) });

  // Show ALL the room renders the customer generated. One = a big hero; several
  // = a 2-up grid (up to 4).
  const renders = payload.pieces.filter((p) => p.kind === "render" && p.url);
  const heroH = 322;
  if (renders.length === 0) {
    soft(M, y2, cw, heroH);
    T(page2, "Create a room visual on our Vision Board to see your palette come to life.", M + 26, y2 + heroH / 2 - 8, 13, serif, MUTED);
    y2 += heroH;
  } else if (renders.length === 1) {
    const img = await embedRender(renders[0].url!, cw, heroH);
    if (img) page2.drawImage(img, { x: M, y: H - y2 - heroH, width: cw, height: heroH });
    else soft(M, y2, cw, heroH);
    y2 += heroH;
  } else {
    const g = 14;
    const cols = 2;
    const cellW = (cw - g) / cols;
    const cellH = Math.round(cellW * 0.74);
    const show = renders.slice(0, 4);
    for (let i = 0; i < show.length; i++) {
      const cx = M + (i % cols) * (cellW + g);
      const cyTop = y2 + Math.floor(i / cols) * (cellH + g);
      const img = await embedRender(show[i].url!, cellW, cellH);
      if (img) page2.drawImage(img, { x: cx, y: H - cyTop - cellH, width: cellW, height: cellH });
      else soft(cx, cyTop, cellW, cellH);
    }
    const rows = Math.ceil(show.length / cols);
    y2 += rows * cellH + (rows - 1) * g;
    if (renders.length > show.length) {
      y2 += 14;
      T(page2, `+ ${renders.length - show.length} more room visuals`, M, y2, 8.5, mono, ACCENT);
    }
  }
  y2 += 12;

  // AI disclaimer - the room visuals are AI-generated.
  if (renders.length > 0) {
    y2 += wrap(
      page2,
      "Please note: the room visuals above are AI-generated. While our generator is accurate, they are a guide for visual inspiration only - not an exact representation of the real product. Colour, texture, pattern and scale can vary; always confirm with a physical sample before ordering.",
      M, y2, cw, 8, mono, MUTED, 12,
    );
    y2 += 12;
  } else {
    y2 += 22;
  }

  // Dark "let's bring it to life" next-steps band (rounded corners - pdf-lib
  // rectangles are square, so draw it as a rounded shape via sharp).
  const bandH = 168;
  const bandTop = y2;
  try {
    const bw = Math.round(cw * 2);
    const bh = bandH * 2;
    const bandSvg = Buffer.from(
      `<svg width="${bw}" height="${bh}" xmlns="http://www.w3.org/2000/svg"><rect width="${bw}" height="${bh}" rx="34" ry="34" fill="#20303a"/></svg>`,
    );
    const bandImg = await pdf.embedPng(await sharp(bandSvg).png().toBuffer());
    page2.drawImage(bandImg, { x: M, y: H - bandTop - bandH, width: cw, height: bandH });
  } catch {
    page2.drawRectangle({ x: M, y: H - bandTop - bandH, width: cw, height: bandH, color: DARK });
  }
  T(page2, "NEXT STEPS", M + 26, bandTop + 26, 8, monoB, rgb(0.82, 0.55, 0.4));
  T(page2, "Let's bring it to life.", M + 26, bandTop + 40, 26, serif, ONCREAM);
  const whiteLogo = await loadAsset("/onwood-logo-white.png", origin);
  if (whiteLogo) {
    try {
      const wl = await pdf.embedPng(whiteLogo);
      const ww = 104;
      const wh = (wl.height / wl.width) * ww;
      page2.drawImage(wl, { x: W - M - 26 - ww, y: H - bandTop - 34 - wh, width: ww, height: wh });
    } catch {
      /* logo optional */
    }
  }
  const steps: [string, string, string][] = [
    ["01", "REPLY OR DROP IN", "Reply to your email or visit our Baringa showroom - we'd love to meet you."],
    ["02", "SEE IT IN PERSON", "We'll pull the real samples together so you can see and feel every finish."],
    ["03", "WE TAKE IT FROM HERE", "Choose, quote and supply - honest Sunshine Coast advice, start to finish."],
  ];
  const stepW = (cw - 52) / 3;
  steps.forEach((s, i) => {
    const sx = M + 26 + i * stepW;
    const st = bandTop + 92;
    T(page2, s[0], sx, st, 9, mono, rgb(0.82, 0.55, 0.4));
    T(page2, s[1], sx, st + 16, 8.5, monoB, ONCREAM);
    wrap(page2, s[2], sx, st + 30, stepW - 16, 8.5, helv, rgb(0.78, 0.75, 0.7), 12);
  });
  footer(page2);

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
