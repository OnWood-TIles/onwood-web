// Reframe the matched Brescia faces (Earth = XB1-4 @600x600, Iconic = XB11-14 @600x1200)
// to house style (white margin, no shadow), keyed by supplier CODE, + a verify montage.
//   node scripts/brescia-assets.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";
const ROOT = ".refwork/brescia/Brescia";
const PUB = "public/images/tileone";

// code -> { folder, size, label }
const MAP = [
  ["FLOBREIVORY60M", "XB1", "600x600", "Earth Ivory"],
  ["FLOBREBEIGE60M", "XB2", "600x600", "Earth Beige"],
  ["FLOBREGRIGI60M", "XB3", "600x600", "Earth Grigio"],
  ["FLOBREGRAFI60M", "XB4", "600x600", "Earth Grafite"],
  ["FLOBREIVORY12S", "XB11", "600x1200", "Iconic Ivory"],
  ["FLOBREBEIGE12S", "XB12", "600x1200", "Iconic Beige"],
  ["FLOBREGRIGI12S", "XB13", "600x1200", "Iconic Grigio"],
  ["FLOBREGRAFI12S", "XB14", "600x1200", "Iconic Grafite"],
];

function pick(folder, size) {
  const dir = path.join(ROOT, folder);
  const all = fs.readdirSync(dir).filter((n) => /\.jpg$/i.test(n) && !/reduced/i.test(n));
  return path.join(dir,
    all.find((n) => n.includes(size) && /-0?1\.jpg$/i.test(n)) ||
    all.find((n) => n.includes(size)) ||
    all.find((n) => /-0?1\.jpg$/i.test(n)) || all[0]);
}

const CANVAS = 1200, BOX = Math.round(CANVAS * 0.57);
async function reframe(inp, out) {
  const resized = await sharp(inp).resize(BOX, BOX, { fit: "inside" }).toBuffer();
  const m = await sharp(resized).metadata();
  const left = Math.round((CANVAS - m.width) / 2), top = Math.round((CANVAS - m.height) / 2);
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" } })
    .composite([{ input: resized, left, top }]).webp({ quality: 90 }).toFile(out);
}

const mont = [];
for (const [code, folder, size, label] of MAP) {
  const src = pick(folder, size);
  await reframe(src, `${PUB}/${code}.webp`);
  console.log(`${code} <- ${folder}/${path.basename(src)}`);
  mont.push([label, `${PUB}/${code}.webp`]);
}
// verify montage: 2 rows (Earth, Iconic) x 4
const S = 240, cols = 4, pad = 6, lab = 20, cw = S + pad * 2, chh = S + lab + pad * 2;
const comps = [];
for (let i = 0; i < mont.length; i++) {
  const [label, f] = mont[i], col = i % cols, row = (i / cols) | 0;
  const t = await sharp(f).resize(S, S, { fit: "contain", background: "#eee" }).png().toBuffer();
  comps.push({ input: t, left: col * cw + pad, top: row * chh + pad + lab });
  comps.push({ input: Buffer.from(`<svg width="${S}" height="${lab}"><rect width="100%" height="100%" fill="#20303A"/><text x="5" y="15" font-family="Arial" font-size="12" fill="#F6F1E8">${label}</text></svg>`), left: col * cw + pad, top: row * chh + pad });
}
await sharp({ create: { width: cols * cw, height: 2 * chh, channels: 3, background: "#fff" } }).composite(comps).png().toFile("scripts/_brescverify.png");
console.log("verify montage -> scripts/_brescverify.png");
