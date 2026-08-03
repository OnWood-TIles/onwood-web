// Finalise the Gemini-generated Prism tiles to the OnWood house style: lift the
// soft studio background to pure white (auto-measured per image so the tile keeps
// its definition) and pad to a 1200 square on #ffffff, matching every other tile.
//   node scripts/prism-assets.mjs
import sharp from "sharp";

const GEN = ".refwork/prismgen";
const OUT = "public/images/tileone";
const CODES = ["GLOPRIWHIT1020BG", "GLOPRIWHIT1030BG", "GLOPRIWHIT753BG"];
const CANVAS = 1200;

for (const c of CODES) {
  const src = `${GEN}/${c}.png`;
  // Sample the top strip (always background) to learn how grey it is.
  const { data, info } = await sharp(src).resize(200, 200, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, ch = info.channels;
  let sum = 0, n = 0;
  for (let y = 0; y < 14; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * ch; sum += (data[i] + data[i + 1] + data[i + 2]) / 3; n++; }
  const bg = sum / n;
  // Lift so the background reaches ~253 (near-pure white) without over-clipping.
  const scale = Math.min(1.12, Math.max(1, 253 / bg));
  await sharp(src)
    .linear(scale, 0)
    .resize(CANVAS, CANVAS, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 90 })
    .toFile(`${OUT}/${c}.webp`);
  console.log(`prism ${c}  bg=${bg.toFixed(1)}  scale=${scale.toFixed(3)}`);
}
console.log(`done -> ${OUT}`);
