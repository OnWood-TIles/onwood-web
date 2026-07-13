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
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage } from "pdf-lib";

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

  const base = bgBuf
    ? sharp(await sharp(bgBuf).resize(W, H, { fit: "cover" }).toBuffer())
    : sharp({
        create: { width: W, height: H, channels: 3, background: "#efece5" },
      });

  // Composite pieces bottom-up in stacking (z) order.
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

  return base.composite(composites).png().toBuffer();
}

// ---- PDF -------------------------------------------------------------------

const INK = rgb(0.125, 0.188, 0.227); // #20303a
const ACCENT = rgb(0.816, 0.416, 0.271); // #d06a45
const MUTED = rgb(0.54, 0.52, 0.47);
const LINE = rgb(0.86, 0.84, 0.8);

// Keep drawn text within StandardFont (WinAnsi) - strip anything it can't encode.
const safe = (s: string) => (s || "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim();

// Supplier / manufacturer per piece kind, for the finishes list.
const SUPPLIERS: Record<string, { label: string; supplier: string }> = {
  paint: { label: "Paint", supplier: "Dulux" },
  tile: { label: "Tiles", supplier: "GlowTile" },
  flooring: { label: "Flooring", supplier: "Quick-Step" },
  carpet: { label: "Carpet", supplier: "Godfrey Hirst" },
  timber: { label: "Cabinetry", supplier: "Laminex" },
  metal: { label: "Metal finishes", supplier: "Designer finish" },
  styling: { label: "Styling", supplier: "Provincial Home Living" },
  chip: { label: "Decor", supplier: "" },
};
const GROUP_ORDER = ["paint", "tile", "flooring", "carpet", "timber", "metal", "styling", "chip"];

export async function buildMoodboardPdf(
  payload: SharePayload,
  boardPng: Buffer,
  dateStr: string,
  origin: string,
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28;
  const H = 841.89;
  const M = 42;
  const cw = W - M * 2;

  let page = pdf.addPage([W, H]);
  let cursor = 0; // distance from the top of the current page

  const bottomLimit = 70; // leave room for the footer
  const ensure = (need: number) => {
    if (H - cursor - need < bottomLimit) {
      drawFooter(page);
      page = pdf.addPage([W, H]);
      cursor = M;
    }
  };

  const drawFooter = (pg: typeof page) => {
    pg.drawText(
      safe(
        "OnWood Tiles  |  2/11 Packer Road, Baringa QLD  |  onwoodtiles.com.au  |  sales@onwoodtiles.com.au",
      ),
      { x: M, y: 34, size: 8, font: helv, color: MUTED },
    );
  };

  // Wrapped paragraph; returns the height consumed.
  const wrapText = (
    text: string,
    x: number,
    topCursor: number,
    maxW: number,
    size: number,
    font: PDFFont,
    color = MUTED,
    lineH = size * 1.4,
  ) => {
    const words = safe(text).split(/\s+/);
    let line = "";
    let used = 0;
    const flush = () => {
      page.drawText(line, { x, y: H - topCursor - used - size, size, font, color });
      used += lineH;
    };
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        flush();
        line = word;
      } else {
        line = test;
      }
    }
    if (line) flush();
    return used;
  };

  // Header band + logo.
  page.drawRectangle({ x: 0, y: H - 78, width: W, height: 78, color: INK });
  let logoDrawn = false;
  try {
    const logo = await loadAsset("/onwood-logo-white.png", origin);
    if (logo) {
      const img = await pdf.embedPng(logo);
      const lw = 128;
      const lh = (img.height / img.width) * lw;
      page.drawImage(img, { x: M, y: H - 44 - lh / 2, width: lw, height: lh });
      logoDrawn = true;
    }
  } catch {
    /* fall back to text */
  }
  if (!logoDrawn) {
    page.drawText("OnWood Tiles", { x: M, y: H - 46, size: 22, font: helvB, color: rgb(1, 1, 1) });
  }
  // Centred in the header banner (clears the logo on the left + date on the right).
  const vbLabel = "VISION BOARD";
  const vbSize = 13;
  page.drawText(vbLabel, {
    x: (W - helvB.widthOfTextAtSize(vbLabel, vbSize)) / 2,
    y: H - 47,
    size: vbSize,
    font: helvB,
    color: ACCENT,
  });
  const dstr = safe(dateStr);
  page.drawText(dstr, {
    x: W - M - helv.widthOfTextAtSize(dstr, 9),
    y: H - 44,
    size: 9,
    font: helv,
    color: rgb(0.85, 0.85, 0.83),
  });
  cursor = 78 + 22;

  // Title + intro.
  const title = safe(`${payload.customer.name || "Your"}'s vision board`);
  page.drawText(title, { x: M, y: H - cursor - 16, size: 17, font: helvB, color: INK });
  cursor += 26;
  cursor += wrapText(
    "Here's the look you built on our Vision Board. The finishes you chose are listed below - bring this in, or reply to this email and our team will help bring it to life.",
    M,
    cursor,
    cw,
    10,
    helv,
  );
  cursor += 12;

  // Board image (bordered).
  const ar = (payload.board.w || 900) / (payload.board.h || 560);
  let imgW = cw;
  let imgH = imgW / ar;
  const maxImgH = 340;
  if (imgH > maxImgH) {
    imgH = maxImgH;
    imgW = imgH * ar;
  }
  const imgX = M + (cw - imgW) / 2;
  let boardImg: PDFImage | null = null;
  try {
    boardImg = await pdf.embedPng(boardPng);
  } catch {
    boardImg = null;
  }
  if (boardImg) {
    page.drawRectangle({
      x: imgX - 1,
      y: H - cursor - imgH - 1,
      width: imgW + 2,
      height: imgH + 2,
      borderColor: LINE,
      borderWidth: 1,
    });
    page.drawImage(boardImg, { x: imgX, y: H - cursor - imgH, width: imgW, height: imgH });
    cursor += imgH + 24;
  }

  // "Your finishes" heading.
  ensure(30);
  page.drawText("YOUR FINISHES", { x: M, y: H - cursor - 11, size: 11, font: helvB, color: ACCENT });
  cursor += 22;

  // Benchtop first (if a stone was picked).
  const drawItem = (label: string, detail: string) => {
    ensure(18);
    page.drawText(safe(label), { x: M + 6, y: H - cursor - 10, size: 10, font: helvB, color: INK });
    const lw = helvB.widthOfTextAtSize(safe(label), 10);
    if (detail)
      page.drawText(safe(detail), {
        x: M + 12 + lw,
        y: H - cursor - 10,
        size: 9.5,
        font: helv,
        color: MUTED,
      });
    cursor += 17;
  };
  const drawGroupHeading = (label: string) => {
    ensure(20);
    cursor += 4;
    page.drawText(safe(label.toUpperCase()), {
      x: M,
      y: H - cursor - 9,
      size: 8.5,
      font: helvB,
      color: MUTED,
    });
    cursor += 15;
  };

  // Benchtop - always listed (the board IS a Caesarstone benchtop). Name the
  // specific colour if the customer picked one, else note the default surface.
  drawGroupHeading("Benchtop");
  if (payload.board.stoneName) drawItem(payload.board.stoneName, "-  Caesarstone");
  else drawItem("Caesarstone benchtop", "");

  // Grouped finishes (dedupe by name within a kind).
  for (const kind of GROUP_ORDER) {
    const meta = SUPPLIERS[kind];
    if (!meta) continue;
    const seen = new Set<string>();
    const items = payload.pieces.filter((p) => {
      if (p.kind !== kind) return false;
      const n = (p.name || "").trim().toLowerCase();
      if (!n || seen.has(n)) return false;
      seen.add(n);
      return true;
    });
    if (!items.length) continue;
    drawGroupHeading(meta.label);
    for (const p of items) {
      const bits = [meta.supplier, p.sub].filter(Boolean).join(", ");
      drawItem(p.name, bits ? `-  ${bits}` : "");
    }
  }

  // Any AI room render is a bonus visual, note it once.
  if (payload.pieces.some((p) => p.kind === "render")) {
    drawGroupHeading("Room render");
    drawItem("AI-generated room visual", "-  a guide to the finished look");
  }

  drawFooter(page);
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
