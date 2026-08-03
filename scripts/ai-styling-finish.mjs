// AI STYLING - phase 3 (finish). WIPES the styling folder (removes all previous
// PHL items + badge), trims each cutout, downscales, writes alpha webp, and writes
// a FRESH public/data/styling.json of just the AI ranges. sharp only.
//   node scripts/ai-styling-finish.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const cutDir = path.join(root, ".refwork/ai-cut");
const outDir = path.join(root, "public/images/styling");
const jsonPath = path.join(root, "public/data/styling.json");
const manifest = JSON.parse(fs.readFileSync(path.join(root, ".refwork/ai-gen/manifest.json"), "utf8"));

// Fresh start: drop every previous styling image (PHL cutouts + phl-logo badge).
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const title = (slug) =>
  slug
    .replace(/^ai-(floral|cushion|decor)-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const ORDER = ["Cushion", "Floral", "Decor"];
const out = [];
for (const m of manifest) {
  const src = path.join(cutDir, `${m.slug}.png`);
  if (!fs.existsSync(src)) { console.log(`skip ${m.slug}`); continue; }
  try {
    let base = sharp(src);
    // Cushions must read opaque - harden the alpha (clean noise, push body solid).
    if (m.category === "Cushion") {
      const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const LO = 15, HI = 90, span = HI - LO;
      for (let i = 0; i < data.length; i += info.channels) {
        const a = data[i + 3];
        data[i + 3] = a <= LO ? 0 : a >= HI ? 255 : Math.round(((a - LO) / span) * 255);
      }
      const png = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toBuffer();
      base = sharp(png);
    }
    const trimmed = await base.trim({ threshold: 12 }).toBuffer();
    const meta = await sharp(trimmed).metadata();
    const ar = +(meta.width / meta.height).toFixed(3);
    await sharp(trimmed).resize(460, 460, { fit: "inside", withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 92 }).toFile(path.join(outDir, `${m.slug}.webp`));
    out.push({ name: title(m.slug), category: m.category, url: `/images/styling/${m.slug}.webp`, ar });
    process.stdout.write(".");
  } catch (e) {
    console.log(`\nx ${m.slug}: ${e.message}`);
  }
}
out.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || a.name.localeCompare(b.name));
fs.writeFileSync(jsonPath, JSON.stringify(out));
const byCat = out.reduce((a, s) => ((a[s.category] = (a[s.category] || 0) + 1), a), {});
console.log(`\nwrote ${out.length} AI styling items -> styling.json`, JSON.stringify(byCat));
