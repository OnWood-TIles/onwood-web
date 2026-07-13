// Generate public/data/tiles.json from GlowTile's Shopify catalogue.
//
// GlowTile (glowtile.com.au) is a Shopify store, so the full product list is at
// /products.json (paginated, 250/page). We keep only real tile FACES:
//   - drop non-tiles by name: freight/sundries, adhesives/primers (Davco), edge
//     TRIM (bullnose), timber-look "Australian Hardwood", fishscale mosaics, and
//     a couple of one-offs Reagan flagged (Rio Blue Loose Body, the stray "oak").
//   - drop product-on-WHITE-background studio shots by image analysis (they don't
//     read as a tiled surface): a tile whose 4 corners are uniform near-white while
//     the centre is clearly darker is an object floating on white, so we skip it.
// Natural Stone / stacked-stone ("Loose Body") ranges are KEPT (Reagan likes them).
//
// Each kept tile → { id, name, type, url }; images hotlink from cdn.shopify.com.
// Tiles are shown WITHOUT a brand badge (Reagan's call).
//
// Run: node scripts/gen-tiles.mjs

import { writeFileSync } from "node:fs";
import sharp from "sharp";

const BASE = "https://www.glowtile.com.au";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

// Not a tile face: sundries, adhesives/primers, edge trim, timber-look, fishscale,
// plus the specific one-offs Reagan asked to remove.
const BAD =
  /freight|delivery|pallet|per p\/p|to store|\bsample\b|deposit|gift ?card|adhesive|grout|\btrim\b|spacer|\bclip\b|installation|sealer|silicone|wedge|leveling|levelling|primer|davco|ultraprime|bullnose|\bhardwood\b|fish[- ]?scale|rio blue/i;
// Exact (case-insensitive) names to drop - mislabelled / junk data.
const BAD_EXACT = new Set(["oak"]);

async function fetchPage(page) {
  const res = await fetch(`${BASE}/products.json?limit=250&page=${page}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`products.json p${page}: ${res.status}`);
  return (await res.json()).products || [];
}

async function fetchImg(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA } });
    clearTimeout(t);
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

// Is this a product photo floating on a white studio background (not a tiled
// surface)? True when all 4 corners are uniform near-white AND the centre is
// clearly darker (so a genuine full-bleed white/pale tile is NOT flagged).
async function isWhiteBackground(buf) {
  try {
    const S = 100;
    const { data, info } = await sharp(buf)
      .resize(S, S, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    const P = 12;
    const lumAt = (x, y) => {
      const i = (y * S + x) * ch;
      return (data[i] + data[i + 1] + data[i + 2]) / 3;
    };
    const spreadAt = (x, y) => {
      const i = (y * S + x) * ch;
      return Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
    };
    const patchAvg = (cx, cy) => {
      let sum = 0, spread = 0, n = 0;
      for (let y = cy; y < cy + P; y++)
        for (let x = cx; x < cx + P; x++) {
          sum += lumAt(x, y);
          spread += spreadAt(x, y);
          n++;
        }
      return { lum: sum / n, spread: spread / n };
    };
    const corners = [
      [0, 0],
      [S - P, 0],
      [0, S - P],
      [S - P, S - P],
    ];
    let whiteCorners = 0;
    for (const [cx, cy] of corners) {
      const c = patchAvg(cx, cy);
      if (c.lum > 243 && c.spread < 16) whiteCorners++;
    }
    const centre = patchAvg(S / 2 - P / 2, S / 2 - P / 2);
    // All 4 corners uniform white + a meaningfully darker centre = object on white.
    return whiteCorners === 4 && centre.lum < 225;
  } catch {
    return false; // on any error, keep the tile
  }
}

const cleanName = (t) =>
  t.replace(/\s*\|\s*\d+\s*x\s*\d+.*$/i, "").replace(/\s{2,}/g, " ").trim();
const cleanType = (t) => {
  const s = (t || "").trim();
  if (!s || /^\d+\s*x\s*\d+/i.test(s)) return "";
  return s;
};

// Small concurrency pool.
async function mapPool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

async function main() {
  const all = [];
  for (let page = 1; page <= 6; page++) {
    const batch = await fetchPage(page);
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 250) break;
  }

  // Pass 1: name filter.
  const seen = new Set();
  const candidates = [];
  const droppedByName = [];
  for (const p of all) {
    const title = (p.title || "").trim();
    if (!title) continue;
    const img = (p.images || [])[0];
    if (!img || !img.src) continue;
    const name = cleanName(title);
    if (!name || seen.has(name.toLowerCase())) continue;
    if (BAD.test(title) || BAD_EXACT.has(name.toLowerCase())) {
      droppedByName.push(name);
      continue;
    }
    seen.add(name.toLowerCase());
    candidates.push({
      id: String(p.id),
      name,
      type: cleanType(p.product_type),
      url: img.src.split("?")[0] + "?width=600",
    });
  }

  // Pass 2: drop product-on-white studio shots (image analysis).
  const flags = await mapPool(candidates, 8, async (t) => {
    const buf = await fetchImg(t.url);
    if (!buf) return false;
    return isWhiteBackground(buf);
  });
  const tiles = [];
  const droppedWhite = [];
  candidates.forEach((t, i) => (flags[i] ? droppedWhite.push(t.name) : tiles.push(t)));

  tiles.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync("public/data/tiles.json", JSON.stringify(tiles));
  const types = new Set(tiles.map((t) => t.type).filter(Boolean));
  console.log(`Kept ${tiles.length} tiles across ${types.size} collections.`);
  console.log(`Dropped by name (${droppedByName.length}):`, droppedByName.join(", "));
  console.log(`Dropped white-bg (${droppedWhite.length}):`, droppedWhite.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
