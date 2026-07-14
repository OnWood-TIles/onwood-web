// Mosaic tiles - PHASE 1 (background removal). Reads public/data/tiles.json,
// finds the mosaic / penny-round / kit-kat / stack-bond / cobble / Piccolo tiles,
// downloads each supplier shot and cuts the (usually white) background to a
// transparent PNG in .refwork/tiles-cut/. Kept SEPARATE from sharp (loading
// @imgly + sharp in one process crashes). Run first, then gen-mosaic-finish.mjs:
//   node scripts/gen-mosaic-cut.mjs && node scripts/gen-mosaic-finish.mjs
import fs from "fs";
import path from "path";
import { pathToFileURL } from "node:url";
import { removeBackground } from "@imgly/background-removal-node";

const ROOT = process.cwd();
const TILES = path.join(ROOT, "public/data/tiles.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const isMosaic = (t) =>
  /piccolo|penny\s*round/i.test(t.type) ||
  /mosaic|kit\s*kat|penny\s*round|stack\s*bond|mini\s*arch|cobble/i.test(t.name);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const tiles = JSON.parse(fs.readFileSync(TILES, "utf8"));
const mosaics = tiles.filter((t) => isMosaic(t) && !String(t.url).startsWith("/"));
const cutDir = path.join(ROOT, ".refwork/tiles-cut");
fs.rmSync(cutDir, { recursive: true, force: true });
fs.mkdirSync(cutDir, { recursive: true });

const manifest = [];
console.log(`Cutting ${mosaics.length} mosaic tiles...`);
for (const t of mosaics) {
  const slug = slugify(t.name);
  try {
    const resp = await fetch(t.url, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await resp.arrayBuffer());
    if (resp.status !== 200 || buf.length < 2000) throw new Error(`img http ${resp.status}`);
    const tmp = path.join(cutDir, "_tmp");
    fs.writeFileSync(tmp, buf);
    const blob = await removeBackground(pathToFileURL(tmp).href);
    fs.writeFileSync(path.join(cutDir, `${slug}.png`), Buffer.from(await blob.arrayBuffer()));
    manifest.push({ id: t.id, name: t.name, slug });
    process.stdout.write(".");
  } catch (e) {
    console.log(`\nx ${t.name}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 200));
}
fs.rmSync(path.join(cutDir, "_tmp"), { force: true });
fs.writeFileSync(path.join(ROOT, ".refwork/tiles-mosaic-manifest.json"), JSON.stringify(manifest, null, 1));
console.log(`\ncut ${manifest.length}/${mosaics.length} -> ${cutDir}. Now run gen-mosaic-finish.mjs`);
