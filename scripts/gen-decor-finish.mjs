// Styling tab "Decor" category - PHASE 2 (finish + MERGE). Sharp-only. Trims +
// downscales the Decor cutouts from .refwork/cut-decor/ to public/images/styling/
// and MERGES them into public/data/styling.json, KEEPING the existing Cushion/Floral
// (so the curated set is never disturbed). Run after gen-decor-cut.mjs.
//   node scripts/gen-decor-finish.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const cutDir = path.join(root, ".refwork/cut-decor");
const outDir = path.join(root, "public/images/styling");
const ORDER = ["Cushion", "Floral", "Decor"];

// Solid decor objects should be fully opaque (kill the ML remover's see-through
// haze) while keeping a soft edge - same alpha ramp used for cushions.
async function harden(src) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const LO = 15,
    HI = 90,
    span = HI - LO;
  for (let i = 0; i < data.length; i += info.channels) {
    const a = data[i + 3];
    data[i + 3] = a <= LO ? 0 : a >= HI ? 255 : Math.round(((a - LO) / span) * 255);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  // Clear any stale decor-*.webp (e.g. the removed vases) so nothing orphans.
  for (const f of fs.readdirSync(outDir))
    if (/^decor-.*\.webp$/.test(f)) fs.rmSync(path.join(outDir, f));

  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, ".refwork/decor-manifest.json"), "utf8"),
  );
  const decorItems = [];
  for (const m of manifest) {
    const src = path.join(cutDir, `${m.slug}.png`);
    if (!fs.existsSync(src)) continue;
    try {
      const png = await harden(src);
      const trimmed = await sharp(png).trim({ threshold: 12 }).toBuffer();
      const meta = await sharp(trimmed).metadata();
      const ar = +(meta.width / meta.height).toFixed(3);
      await sharp(trimmed)
        .resize(460, 460, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 86, alphaQuality: 92 })
        .toFile(path.join(outDir, `${m.slug}.webp`));
      decorItems.push({ name: m.name, category: "Decor", url: `/images/styling/${m.slug}.webp`, ar });
      process.stdout.write(".");
    } catch (e) {
      process.stdout.write("x");
    }
  }

  // MERGE: keep the existing Cushion/Floral, swap in the new Decor.
  const jsonPath = path.join(root, "public/data/styling.json");
  const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8")).filter((x) => x.category !== "Decor");
  const merged = [...existing, ...decorItems];
  merged.sort(
    (a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || a.name.localeCompare(b.name),
  );
  fs.writeFileSync(jsonPath, JSON.stringify(merged));
  const byCat = merged.reduce((a, s) => ((a[s.category] = (a[s.category] || 0) + 1), a), {});
  console.log(`\nmerged: ${merged.length} styling items`, JSON.stringify(byCat));
}
run();
