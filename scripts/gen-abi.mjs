// Metals tab - ABI Interiors finish sample discs (replaces the old CSS-rendered
// metal discs/bars, 2026-07-10). Pulls ABI's "Colour Sample" products from the
// public WooCommerce Store API (real photographic finish discs on white), cuts out
// the white to a clean circular cutout (trim + circle mask - the disc floats on the
// benchtop, keeping its hang-hole + embossed ABI branding), and writes
// public/data/abi-metals.json. Also grabs the ABI logo (badge). Self-hosted webp.
//   node scripts/gen-abi.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const BASE = "https://www.abiinteriors.com.au";
const API = "/wp-json/wc/store/v1/products?search=Colour%20Sample&per_page=80";
const LOGO = "https://cdn.bfldr.com/8266KQUL/at/4gvhqwg6r6t32qrwth9n42n/abi-logo.svg";
const outImg = "public/images/metals/abi";
// Non-metal samples (vanities, stone, basins) to skip - we only want metal finishes.
const SKIP = /oak|vanity|marble|solid surface|glacier|white ash|carrara|concrete|basin|matte white|\bstone\b|timber|sample pack|travertine/i;

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const cleanName = (t) =>
  decode(t)
    .replace(/^Colour Sample\s*[-–—]\s*/i, "")
    .replace(/\s*\((?:PVD|AEA|SB|SS|PSLT)\)/gi, "")
    .replace(/\s*[-–—]\s*(?:Solid Brass|Stainless Steel|Solid \w+)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const fullSize = (u) => u.replace(/-\d+x\d+(\.\w+)(?=$|\?)/, "$1");

async function fetchBuf(url) {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 20000);
    const r = await fetch(url, { signal: c.signal, headers: { "User-Agent": UA, Referer: BASE + "/" } });
    clearTimeout(t);
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

// Cut the disc out of its white background -> transparent circular webp.
async function cutDisc(buf) {
  const trimmed = await sharp(buf).trim({ threshold: 25 }).toBuffer();
  const sq = await sharp(trimmed)
    .resize(400, 400, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const mask = Buffer.from(`<svg width="400" height="400"><circle cx="200" cy="200" r="194"/></svg>`);
  const disc = await sharp(sq).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  return sharp(disc).trim().resize(300, 300, { fit: "inside" }).webp({ quality: 90 }).toBuffer();
}

async function run() {
  fs.mkdirSync(outImg, { recursive: true });
  const products = await (await fetch(BASE + API, { headers: { "User-Agent": UA } })).json();
  const byName = new Map();
  for (const p of Array.isArray(products) ? products : []) {
    const title = decode(p.name || "");
    if (!/colour sample/i.test(title) || SKIP.test(title)) continue;
    const name = cleanName(title);
    if (!name || byName.has(name.toLowerCase())) continue;
    const img = p.images && p.images[0] ? fullSize(p.images[0].src) : null;
    if (!img) continue;
    byName.set(name.toLowerCase(), { name, img });
  }
  console.log(`${byName.size} unique metal finishes`);

  const logo = await fetchBuf(LOGO);
  if (logo) {
    let svg = logo.toString("utf8");
    if (!/xmlns=/.test(svg)) svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    fs.writeFileSync(path.join(outImg, "abi-logo.svg"), svg);
    console.log("logo -> abi-logo.svg");
  } else console.log("logo FAILED");

  const out = [];
  for (const { name, img } of byName.values()) {
    const buf = await fetchBuf(img);
    if (!buf) { console.log("img fail:", name); continue; }
    try {
      fs.writeFileSync(path.join(outImg, `${slugify(name)}.webp`), await cutDisc(buf));
      out.push({ name, url: `/images/metals/abi/${slugify(name)}.webp` });
      process.stdout.write(".");
    } catch (e) {
      console.log("cut fail:", name, e.message);
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync("public/data/abi-metals.json", JSON.stringify(out));
  console.log(`\nwrote ${out.length} ABI finishes -> public/data/abi-metals.json`);
  console.log(out.map((o) => o.name).join(", "));
}
run();
