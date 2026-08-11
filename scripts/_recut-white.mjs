// Re-cut the ABI "White" metal disc so it FILLS the frame like every other disc.
// The previous cut kept the product photo's white padding, so the disc ended up as a
// small grey dot inside a huge opaque white circle. Here we detect the disc's true
// bounds (pixels that differ from the white studio background), crop tight, mask a
// clean circle, and size it to match the others. Writes a review composite too.
//   node scripts/_recut-white.mjs
import fs from "fs";
import sharp from "sharp";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const BASE = "https://www.abiinteriors.com.au";
const API = "/wp-json/wc/store/v1/products?search=Colour%20Sample&per_page=80";
const OUT = "public/images/metals/abi";
const fullSize = (u) => u.replace(/-\d+x\d+(\.\w+)(?=$|\?)/, "$1");
const decode = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const clean = (t) => decode(t).replace(/^Colour Sample\s*[-–—]\s*/i, "").replace(/\s*\([^)]*\)/g, "").replace(/\s*[-–—]\s*(?:Solid Brass|Stainless Steel|Solid \w+)\s*$/i, "").replace(/\s+/g, " ").trim();

async function fetchBuf(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Referer: BASE + "/" } });
  if (!r.ok) throw new Error(`fetch ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function run() {
  const products = await (await fetch(BASE + API, { headers: { "User-Agent": UA } })).json();
  const cand = (Array.isArray(products) ? products : []).find((p) => clean(p.name).toLowerCase() === "white" && /colour sample/i.test(decode(p.name)));
  if (!cand?.images?.[0]) { console.log("No White sample found"); return; }
  console.log("Using:", decode(cand.name));
  const src = await fetchBuf(fullSize(cand.images[0].src));

  // Flatten onto white, then find the disc's bounding box: pixels differing from the
  // top-left background colour by more than a small delta (disc face + edge + shadow).
  const { data, info } = await sharp(src).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const bg = [data[0], data[1], data[2]];
  let minX = W, minY = H, maxX = 0, maxY = 0;
  const DELTA = 14;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const d = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
    if (d > DELTA) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const bw = maxX - minX, bh = maxY - minY;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const side = Math.round(Math.max(bw, bh) * 1.02); // tiny pad
  const left = Math.max(0, Math.round(cx - side / 2));
  const top = Math.max(0, Math.round(cy - side / 2));
  const wSafe = Math.min(side, W - left), hSafe = Math.min(side, H - top);
  console.log(`disc bbox ${bw}x${bh} @(${Math.round(cx)},${Math.round(cy)}) -> crop ${wSafe}x${hSafe}`);

  const sq = await sharp(src).flatten({ background: "#ffffff" })
    .extract({ left, top, width: wSafe, height: hSafe }).resize(400, 400).toBuffer();
  const mask = Buffer.from(`<svg width="400" height="400"><circle cx="200" cy="200" r="196"/></svg>`);
  const disc = await sharp(sq).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const out = await sharp(disc).trim().resize(300, 300, { fit: "inside" }).webp({ quality: 92 }).toBuffer();
  fs.writeFileSync(`${OUT}/white.webp`, out);

  // review: white disc over olive so its true framing (no big white border) is clear
  const deskDir = `${process.env.USERPROFILE}\\Desktop\\Metal-Holes-Review`;
  fs.mkdirSync(deskDir, { recursive: true });
  const olive = await sharp({ create: { width: 300, height: 300, channels: 4, background: "#5C6141" } }).png().toBuffer();
  await sharp(olive).composite([{ input: await sharp(out).resize(260, 260, { fit: "inside" }).png().toBuffer(), gravity: "center" }])
    .jpeg({ quality: 92 }).toFile(`${deskDir}\\_white-recut-over-olive.jpg`);
  console.log("wrote white.webp + review → Desktop/Metal-Holes-Review/_white-recut-over-olive.jpg");
}
run().catch((e) => { console.error(e); process.exit(1); });
