// MECHANICAL pass 1: gather a range's website images (across all page ids), cache
// the raw files, and build labeled montages + a brochure render for a VISION pass.
// No classification here - a plank face and a room shot look alike by aspect, so
// the agent decides which images are faces vs rooms and matches them to colours.
//   node scripts/process-range.mjs <NORMKEY>
import fs from "fs";
import * as mupdf from "mupdf";
import sharp from "sharp";

const KEY = process.argv[2];
if (!KEY) { console.error("usage: process-range.mjs <NORMKEY>"); process.exit(1); }
const UA = { "User-Agent": "Mozilla/5.0" };
const HOST = "https://www.tileone.com.au/";

const plan = JSON.parse(fs.readFileSync(".refwork/tileone-plan.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync(".refwork/tileone-catalog.json", "utf8"));
const P = plan.find((p) => p.normKey === KEY);
if (!P) { console.error("range not in plan:", KEY); process.exit(1); }

const PACK = `.refwork/packets/${KEY}`;
const RAW = `${PACK}/raw`;
fs.mkdirSync(RAW, { recursive: true });

const imgId = (u) => u.match(/\/(\d+)\.(?:jpg|jpeg|png)$/i)[1];
const ext = (u) => u.match(/\.(jpg|jpeg|png)$/i)[1];
const get = async (u) => Buffer.from(await fetch(HOST + u, { headers: UA }).then((r) => r.arrayBuffer()));

async function montage(items, outPath, cell, cols) {
  if (!items.length) return false;
  const pad = 6, lab = 24, cw = cell + pad * 2, chh = cell + lab + pad * 2, rows = Math.ceil(items.length / cols);
  const comps = [];
  for (let i = 0; i < items.length; i++) {
    const col = i % cols, row = (i / cols) | 0;
    const t = await sharp(items[i].buf).resize(cell, cell, { fit: "contain", background: "#e9e9e9" }).png().toBuffer();
    comps.push({ input: t, left: col * cw + pad, top: row * chh + pad + lab });
    comps.push({ input: Buffer.from(`<svg width="${cell}" height="${lab}"><rect width="100%" height="100%" fill="#20303A"/><text x="5" y="17" font-family="Arial" font-size="14" fill="#F6F1E8">${items[i].label}</text></svg>`), left: col * cw + pad, top: row * chh + pad });
  }
  await sharp({ create: { width: cols * cw, height: rows * chh, channels: 3, background: "#fff" } }).composite(comps).png().toFile(outPath);
  return true;
}

const ids = P.websiteIds;
const cats = ids.map((id) => catalog.find((c) => c.id === id)).filter(Boolean);
const allImgs = [...new Set(cats.flatMap((c) => c.imageUrls))];
const brochures = [...new Set(cats.map((c) => c.brochurePdf).filter(Boolean))];

const items = [], images = [], skipped = [];
for (const u of allImgs) {
  let buf, m;
  try { buf = await get(u); m = await sharp(buf).metadata(); } catch { skipped.push(u); continue; }
  if (Math.max(m.width, m.height) < 640) { skipped.push(u); continue; } // icons/logos
  const id = imgId(u), e = ext(u), ar = +(m.width / m.height).toFixed(2);
  fs.writeFileSync(`${RAW}/${id}.${e}`, buf);
  images.push({ id, ext: e, w: m.width, h: m.height, ar });
  items.push({ label: `${id}  ${m.width}x${m.height} ar${ar}`, buf });
}

// montage all candidate images (split into pages of 16 for readability)
let pageAssets = [];
for (let i = 0; i < items.length; i += 16) {
  const part = items.slice(i, i + 16);
  const out = `${PACK}/images-${(i / 16) | 0}.png`;
  await montage(part, out, 300, 4);
  pageAssets.push(out);
}

// brochure render (all pages) if present
const broItems = [];
for (const b of brochures) {
  try {
    const doc = mupdf.Document.openDocument(await get(b), "application/pdf");
    for (let pg = 0; pg < doc.countPages(); pg++) {
      const pix = doc.loadPage(pg).toPixmap(mupdf.Matrix.scale(1.5, 1.5), mupdf.ColorSpace.DeviceRGB, false, true);
      broItems.push({ label: `broch p${pg + 1}`, buf: await sharp(pix.asPNG()).png().toBuffer() });
    }
  } catch { /* skip */ }
}
if (broItems.length) await montage(broItems, `${PACK}/brochure.png`, 520, 2);

const packet = {
  normKey: KEY, range: P.range, websiteIds: ids,
  sizes: P.sizes.map((s) => ({ size: s.size, colours: s.colours.map((c) => ({ code: c.code, colourFinish: c.colourFinish, price: c.price, m2box: c.m2box })) })),
  images, hasBrochure: broItems.length > 0,
  assets: { imagePages: pageAssets, brochure: broItems.length ? `${PACK}/brochure.png` : null },
  skippedCount: skipped.length,
};
fs.writeFileSync(`${PACK}/packet.json`, JSON.stringify(packet, null, 1));
console.log(`[${P.range}] images=${images.length} brochurePages=${broItems.length} sizes=${P.sizes.length} colours=${P.sizes.reduce((n, s) => n + s.colours.length, 0)} -> ${PACK}/packet.json`);
