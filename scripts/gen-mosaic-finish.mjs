// Mosaic tiles - PHASE 2 (finish). Takes the transparent PNG cutouts from
// gen-mosaic-cut.mjs, trims the empty margin, downsizes to a webp swatch in
// public/images/tiles/, and repoints each mosaic's `url` in tiles.json to the
// self-hosted transparent cutout. Uses sharp (run AFTER the @imgly cut phase).
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const TILES = path.join(ROOT, "public/data/tiles.json");
const cutDir = path.join(ROOT, ".refwork/tiles-cut");
const outDir = path.join(ROOT, "public/images/tiles");
fs.mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ".refwork/tiles-mosaic-manifest.json"), "utf8"));
const tiles = JSON.parse(fs.readFileSync(TILES, "utf8"));
const byId = new Map(tiles.map((t) => [t.id, t]));

let done = 0;
for (const m of manifest) {
  const src = path.join(cutDir, `${m.slug}.png`);
  if (!fs.existsSync(src)) { console.log(`skip (no cut): ${m.name}`); continue; }
  const out = path.join(outDir, `${m.slug}.webp`);
  await sharp(src)
    .trim({ threshold: 10 })
    .resize(600, 600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(out);
  const tile = byId.get(m.id);
  if (tile) tile.url = `/images/tiles/${m.slug}.webp`;
  done++;
  process.stdout.write(".");
}
fs.writeFileSync(TILES, JSON.stringify(tiles));
console.log(`\nfinished ${done} -> ${outDir}; tiles.json URLs repointed to /images/tiles/*.webp`);
