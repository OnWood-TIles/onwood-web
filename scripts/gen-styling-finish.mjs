// Styling tab - PHASE 2 (finish). Takes the transparent cutout PNGs from phase 1
// (.refwork/cut/ + manifest), trims the transparent margin, downscales, and writes
// alpha webp cutouts to public/images/styling/ + public/data/styling.json (with each
// item's aspect ratio so the board can size it naturally). Sharp-only (see phase 1).
//   node scripts/gen-styling-finish.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const cutDir = path.join(root, ".refwork/cut");
const outDir = path.join(root, "public/images/styling");
const ORDER = ["Cushion", "Floral"]; // Decor (PHL vases) removed 2026-07-10

async function run() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.join(root, "public/data"), { recursive: true });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, ".refwork/styling-manifest.json"), "utf8"),
  );
  const out = [];
  for (const m of manifest) {
    const src = path.join(cutDir, `${m.slug}.png`);
    if (!fs.existsSync(src)) continue;
    // Skip cushion "covers" - flat packaged shots that cut out poorly + duplicate
    // the filled cushion.
    if (/cushion cover/i.test(m.name)) continue;
    try {
      // Cushions must be opaque - the ML remover leaves pale ones semi-transparent
      // (they look see-through / washed out on the board). Harden the alpha: clean
      // near-transparent noise to 0, push the fabric body to fully opaque, keep a
      // soft edge ramp between. Florals/decor keep their natural alpha (glass vases
      // and wispy stems should stay translucent).
      let base = sharp(src);
      if (m.category === "Cushion") {
        const { data, info } = await sharp(src)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        const LO = 15,
          HI = 90,
          span = HI - LO;
        for (let i = 0; i < data.length; i += info.channels) {
          const a = data[i + 3];
          data[i + 3] = a <= LO ? 0 : a >= HI ? 255 : Math.round(((a - LO) / span) * 255);
        }
        const png = await sharp(data, {
          raw: { width: info.width, height: info.height, channels: info.channels },
        })
          .png()
          .toBuffer();
        base = sharp(png);
      }
      // trim the transparent border, cap the long edge at 460px, alpha webp
      const trimmed = await base.trim({ threshold: 12 }).toBuffer();
      const meta = await sharp(trimmed).metadata();
      const ar = +(meta.width / meta.height).toFixed(3);
      await sharp(trimmed)
        .resize(460, 460, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 86, alphaQuality: 92 })
        .toFile(path.join(outDir, `${m.slug}.webp`));
      out.push({ name: m.name, category: m.category, url: `/images/styling/${m.slug}.webp`, ar });
      process.stdout.write(".");
    } catch (e) {
      process.stdout.write("x");
    }
  }
  // Provincial Home Living logo badge (trim + downscale, keep alpha).
  try {
    await sharp(path.join(root, ".refwork/phl-logo.png"))
      .trim({ threshold: 10 })
      .resize({ width: 360 })
      .png()
      .toFile(path.join(outDir, "phl-logo.png"));
    console.log("\nlogo -> phl-logo.png");
  } catch (e) {
    console.log("\nlogo failed:", e.message);
  }
  out.sort(
    (a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || a.name.localeCompare(b.name),
  );
  fs.writeFileSync(path.join(root, "public/data/styling.json"), JSON.stringify(out));
  const byCat = out.reduce((a, s) => ((a[s.category] = (a[s.category] || 0) + 1), a), {});
  console.log(`wrote ${out.length} styling items to public/data/styling.json`, JSON.stringify(byCat));
}
run();
