// Styling tab "Decor" category (added 2026-07-10, replacing the removed PHL vases).
// Source: Provincial Home Living "Decorative Accents" (bowls, book boxes, planters,
// sculptures, frames, bookends...). MERGE-SAFE: cuts ONLY the new Decor items into a
// SEPARATE dir so the curated Cushion/Floral set is never touched.
//
// PHASE 1 (background removal, @imgly) - kept separate from sharp (loading both in
// one process crashes). Run first, then gen-decor-finish.mjs:
//   node scripts/gen-decor-cut.mjs && node scripts/gen-decor-finish.mjs
import fs from "fs";
import path from "path";
import { pathToFileURL } from "node:url";
import { removeBackground } from "@imgly/background-removal-node";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const PAGES = [
  "https://www.provincialhomeliving.com.au/study/homewares/decorative-accents?p=1",
  "https://www.provincialhomeliving.com.au/study/homewares/decorative-accents?p=2",
];
const CAP = 16;
const SKIP = /\bjars?\b|\bvases?\b|\burns?\b/i; // Reagan: no clear jars/vases

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const fullSize = (u) => u.replace(/\/cache\/[a-f0-9]+\//i, "/");

async function parse(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  const h = await r.text();
  const items = [...h.matchAll(/class="product-image-photo"[^>]*?(?:src|data-src)="([^"]+)"[^>]*?alt="([^"]*)"/gi)];
  const out = [];
  for (const m of items) {
    const name = decode(m[2]);
    if (!name || SKIP.test(name)) continue;
    if (!/\.(jpg|jpeg|png)/i.test(m[1])) continue;
    out.push({ name, img: fullSize(m[1]) });
  }
  return out;
}

async function run() {
  const cutDir = path.join(process.cwd(), ".refwork/cut-decor");
  fs.rmSync(cutDir, { recursive: true, force: true });
  fs.mkdirSync(cutDir, { recursive: true });

  const byName = new Map();
  for (const u of PAGES)
    for (const p of await parse(u)) if (!byName.has(p.name)) byName.set(p.name, p.img);
  const products = [...byName.entries()].map(([name, img]) => ({ name, img })).slice(0, CAP);
  console.log(`Decor: ${products.length} products`);

  const manifest = [];
  for (const p of products) {
    const slug = `decor-${slugify(p.name)}`;
    try {
      const resp = await fetch(p.img, {
        headers: { "User-Agent": UA, Referer: "https://www.provincialhomeliving.com.au/" },
      });
      const buf = Buffer.from(await resp.arrayBuffer());
      if (resp.status !== 200 || buf.length < 3000) throw new Error(`img http ${resp.status}`);
      const tmp = path.join(cutDir, "_tmp.jpg");
      fs.writeFileSync(tmp, buf);
      const blob = await removeBackground(pathToFileURL(tmp).href);
      fs.writeFileSync(path.join(cutDir, `${slug}.png`), Buffer.from(await blob.arrayBuffer()));
      manifest.push({ name: p.name, category: "Decor", slug });
      process.stdout.write(".");
    } catch (e) {
      if (!globalThis.__e) {
        console.log("\nfirst error:", e.message);
        globalThis.__e = 1;
      }
      process.stdout.write("x");
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  fs.rmSync(path.join(cutDir, "_tmp.jpg"), { force: true });
  fs.writeFileSync(
    path.join(process.cwd(), ".refwork/decor-manifest.json"),
    JSON.stringify(manifest, null, 1),
  );
  console.log(`\ncut ${manifest.length} decor -> .refwork/cut-decor/. Now run gen-decor-finish.mjs`);
}
run();
