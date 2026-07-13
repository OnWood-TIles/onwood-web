// Styling tab - PHASE 1 (background removal). Scrapes Provincial Home Living for
// cushions / florals / decor, downloads each full-size product shot, and cuts out
// the background with an ML segmenter -> transparent PNG cutouts in .refwork/cut/.
// Writes a manifest for phase 2 (gen-styling-finish.mjs). Kept SEPARATE from sharp
// (loading @imgly + sharp in one process crashes). Run first, then the finish step.
//   node scripts/gen-styling-cut.mjs && node scripts/gen-styling-finish.mjs
import fs from "fs";
import path from "path";
import { pathToFileURL } from "node:url";
import { removeBackground } from "@imgly/background-removal-node";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const SOURCES = [
  { category: "Cushion", url: "https://www.provincialhomeliving.com.au/living/soft-furnishings/cushions", cap: 15 },
  { category: "Floral", url: "https://www.provincialhomeliving.com.au/outdoor/homewares/greenery", cap: 15 },
  // Decor is generated SEPARATELY + merge-safe (PHL "decorative-accents" - bowls,
  // planters, book boxes, sculptures) by scripts/gen-decor-cut.mjs + gen-decor-finish.mjs
  // (2026-07-10, replaced the removed clear-jar vases). Not in this full-regen list.
];

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const fullSize = (u) => u.replace(/\/cache\/[a-f0-9]+\//i, "/"); // strip Magento cache -> original

async function parse(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  const h = await r.text();
  const items = [...h.matchAll(/class="product-image-photo"[^>]*?(?:src|data-src)="([^"]+)"[^>]*?alt="([^"]*)"/gi)];
  const byName = new Map();
  for (const m of items) {
    const name = decode(m[2]);
    if (!name || byName.has(name)) continue;
    if (/cushion cover/i.test(name)) continue; // packaged covers cut out poorly
    if (!/\.(jpg|jpeg|png)/i.test(m[1])) continue;
    byName.set(name, fullSize(m[1]));
  }
  return [...byName.entries()].map(([name, img]) => ({ name, img }));
}

async function run() {
  const cutDir = path.join(process.cwd(), ".refwork/cut");
  fs.rmSync(cutDir, { recursive: true, force: true });
  fs.mkdirSync(cutDir, { recursive: true });
  const manifest = [];
  for (const s of SOURCES) {
    const products = (await parse(s.url)).slice(0, s.cap);
    console.log(`\n${s.category}: ${products.length} products`);
    for (const p of products) {
      const slug = `${s.category.toLowerCase()}-${slugify(p.name)}`;
      try {
        const resp = await fetch(p.img, { headers: { "User-Agent": UA, Referer: "https://www.provincialhomeliving.com.au/" } });
        const buf = Buffer.from(await resp.arrayBuffer());
        if (resp.status !== 200 || buf.length < 3000) throw new Error(`img http ${resp.status}`);
        // removeBackground needs a file:// URL (a bare Windows path fails to parse)
        const tmp = path.join(cutDir, "_tmp.jpg");
        fs.writeFileSync(tmp, buf);
        const blob = await removeBackground(pathToFileURL(tmp).href);
        const out = Buffer.from(await blob.arrayBuffer());
        fs.writeFileSync(path.join(cutDir, `${slug}.png`), out);
        manifest.push({ name: p.name, category: s.category, slug });
        process.stdout.write(".");
      } catch (e) {
        if (!globalThis.__err) console.log("\nfirst error:", e.message);
        globalThis.__err = 1;
        process.stdout.write("x");
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  fs.writeFileSync(path.join(process.cwd(), ".refwork/styling-manifest.json"), JSON.stringify(manifest, null, 1));
  console.log(`\ncut ${manifest.length} products -> .refwork/cut/ (+ manifest). Now run gen-styling-finish.mjs`);
}
run();
