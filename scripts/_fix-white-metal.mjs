// Re-cut the ABI "White" finish disc. The generic gen-abi.mjs trims the white
// background, but White is white-on-white so trim destroys the disc. Instead:
// centre-crop the source to a square and mask a clean circle (keeps the hole +
// embossed ABI logo). Saves a RAW copy + candidate for review. node scripts/_fix-white-metal.mjs
import fs from "fs";
import sharp from "sharp";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const BASE = "https://www.abiinteriors.com.au";
const API = "/wp-json/wc/store/v1/products?search=Colour%20Sample&per_page=80";
const OUT = "public/images/metals/abi";
const fullSize = (u) => u.replace(/-\d+x\d+(\.\w+)(?=$|\?)/, "$1");
const decode = (s) => s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

async function fetchBuf(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Referer: BASE + "/" } });
  if (!r.ok) throw new Error(`fetch ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function run() {
  const products = await (await fetch(BASE + API, { headers: { "User-Agent": UA } })).json();
  const SKIP = /oak|vanity|marble|solid surface|glacier|white ash|carrara|concrete|basin|matte white|\bstone\b|timber|sample pack|travertine/i;
  const cleanName = (t) => decode(t).replace(/^Colour Sample\s*[-–—]\s*/i, "").replace(/\s*\((?:PVD|AEA|SB|SS|PSLT|\d+\w)\)/gi, "").replace(/\s*[-–—]\s*(?:Solid Brass|Stainless Steel|Solid \w+)\s*$/i, "").replace(/\s+/g, " ").trim();
  const metals = (Array.isArray(products) ? products : []).filter((p) => /colour sample/i.test(decode(p.name || "")) && !SKIP.test(decode(p.name || "")));
  console.log("METAL FINISHES:", metals.map((p) => `"${cleanName(p.name)}"  <= ${decode(p.name)}`).join("\n  "));
  const cand = metals.find((p) => cleanName(p.name).toLowerCase() === "white");
  if (!cand) { console.log("\nNo exact 'White' metal finish found."); return; }
  console.log("\nUsing:", decode(cand.name));
  const img = cand.images?.[0] ? fullSize(cand.images[0].src) : null;
  if (!img) { console.log("no image"); return; }
  const buf = await fetchBuf(img);
  fs.writeFileSync(`${OUT}/_white-raw.png`, await sharp(buf).png().toBuffer());

  // Centre-crop to a square (disc is centred), mask a clean circle, keep the hole/logo.
  const m = await sharp(buf).metadata();
  const size = Math.min(m.width, m.height);
  const sq = await sharp(buf)
    .extract({ left: Math.round((m.width - size) / 2), top: Math.round((m.height - size) / 2), width: size, height: size })
    .resize(400, 400)
    .toBuffer();
  const mask = Buffer.from(`<svg width="400" height="400"><circle cx="200" cy="200" r="190"/></svg>`);
  const disc = await sharp(sq).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  await sharp(disc).resize(300, 300, { fit: "inside" }).webp({ quality: 92 }).toFile(`${OUT}/_white-candidate.webp`);
  console.log("wrote _white-raw.png + _white-candidate.webp");
}
run().catch((e) => { console.error(e); process.exit(1); });
