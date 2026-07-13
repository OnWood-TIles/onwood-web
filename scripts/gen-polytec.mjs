// Polytec colours for the Cabinetry tab (added 2026-07-10, alongside Laminex).
// Parses the coloursData JSON embedded in polytec.com.au/colours/ and self-hosts each
// colour's LARGER image (the /img/products/380-380/{slug}.jpg the individual colour
// page uses, NOT the tiny 140-140 listing swatch) as a downscaled webp. Writes
// public/data/polytec.json with brand:"Polytec" so the board shows the Polytec badge.
// Self-hosted like Laminex (reliable + small + fast). Also grabs /img/polytec.svg as
// the badge (adds xmlns if missing - a bare inline SVG renders blank via <img>).
//   node scripts/gen-polytec.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const BASE = "https://www.polytec.com.au";
const outImg = "public/images/timber";
const SIZES = ["380-380", "960-960", "140-140"]; // first that exists per colour

async function fetchBuf(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA, Referer: BASE + "/" } });
    clearTimeout(t);
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    clearTimeout(t);
    return null;
  }
}

function parseColours(html) {
  const key = "coloursData:";
  const s = html.indexOf(key) + key.length;
  let i = html.indexOf("{", s), depth = 0, end = -1;
  for (let j = i; j < html.length; j++) {
    if (html[j] === "{") depth++;
    else if (html[j] === "}") { depth--; if (depth === 0) { end = j + 1; break; } }
  }
  return JSON.parse(html.slice(i, end));
}

async function pool(items, size, fn) {
  let idx = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (idx < items.length) await fn(items[idx++]);
    }),
  );
}

async function run() {
  fs.mkdirSync(outImg, { recursive: true });
  const html = fs.existsSync(".refwork/poly-colours.html")
    ? fs.readFileSync(".refwork/poly-colours.html", "utf8")
    : await (await fetch(BASE + "/colours/", { headers: { "User-Agent": UA } })).text();
  const data = parseColours(html);
  const colours = Object.values(data)
    .map((c) => ({
      name: c.colour,
      slug: c.meta_colour_url,
      finish: (c.attributes?.Products_Attribute_Finish || [])[0] || "",
    }))
    .filter((c) => c.name && c.slug);
  console.log(`parsing ${colours.length} Polytec colours...`);

  // Badge logo.
  const logo = await fetchBuf(BASE + "/img/polytec.svg");
  if (logo) {
    let svg = logo.toString("utf8");
    if (!/xmlns=/.test(svg)) svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    fs.writeFileSync(path.join(outImg, "polytec-logo.svg"), svg);
    console.log("logo -> polytec-logo.svg");
  } else console.log("logo FAILED");

  const out = [];
  await pool(colours, 8, async (c) => {
    let buf = null;
    for (const sz of SIZES) {
      buf = await fetchBuf(`${BASE}/img/products/${sz}/${c.slug}.jpg`);
      if (buf && buf.length > 2500) break;
      buf = null;
    }
    if (!buf) { process.stdout.write("x"); return; }
    try {
      await sharp(buf)
        .resize(360, 360, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(path.join(outImg, `polytec-${c.slug}.webp`));
      out.push({ name: c.name, finish: c.finish, code: c.slug, url: `/images/timber/polytec-${c.slug}.webp`, brand: "Polytec" });
      process.stdout.write(".");
    } catch {
      process.stdout.write("x");
    }
  });
  out.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync("public/data/polytec.json", JSON.stringify(out));
  console.log(`\nwrote ${out.length} Polytec colours -> public/data/polytec.json`);
}
run();
