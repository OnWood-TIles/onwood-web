// Repair patterned cushions whose WHITE/cream areas went see-through in bg-removal
// (white pattern matched the white studio bg). We keep @imgly's mask only as the
// OUTER outline, flood-fill any interior transparent HOLES back to opaque, and take
// the RGB from the original (un-removed) Gemini image so the white pattern returns.
// No Gemini needed. sharp only. Run: node scripts/repair-cushions.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const genDir = path.join(root, ".refwork/ai-gen");
const cutDir = path.join(root, ".refwork/ai-cut");
const outDir = path.join(root, "public/images/styling");
const jsonPath = path.join(root, "public/data/styling.json");

const SLUGS = ["ai-cushion-terracotta-blockprint", "ai-cushion-olive-stripe", "ai-cushion-blue-coastal-stripe"];

// Flood-fill background from the borders; any transparent pixel NOT reachable from
// a border is an interior hole -> make it opaque. Object pixels keep their alpha.
function fillHoles(alpha, w, h, T = 128) {
  const bg = new Uint8Array(w * h);
  const stack = [];
  const consider = (i) => { if (bg[i] === 0 && alpha[i] < T) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { consider(x); consider((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { consider(y * w); consider(y * w + (w - 1)); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    if (x > 0) consider(i - 1);
    if (x < w - 1) consider(i + 1);
    if (y > 0) consider(i - w);
    if (y < h - 1) consider(i + w);
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = bg[i] ? 0 : alpha[i] < T ? 255 : alpha[i];
  return out;
}

const styling = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
for (const slug of SLUGS) {
  const cutPng = path.join(cutDir, `${slug}.png`);
  const genJpg = path.join(genDir, `${slug}.jpg`);
  if (!fs.existsSync(cutPng) || !fs.existsSync(genJpg)) { console.log(`skip ${slug} (missing source)`); continue; }
  const cut = await sharp(cutPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = cut.info;
  const alpha = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) alpha[i] = cut.data[i * channels + 3];
  const filled = fillHoles(alpha, w, h);
  const rgb = await sharp(genJpg).resize(w, h, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = rgb[i * 3];
    rgba[i * 4 + 1] = rgb[i * 3 + 1];
    rgba[i * 4 + 2] = rgb[i * 3 + 2];
    rgba[i * 4 + 3] = filled[i];
  }
  const png = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(png).trim({ threshold: 12 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const ar = +(meta.width / meta.height).toFixed(3);
  await sharp(trimmed).resize(460, 460, { fit: "inside", withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 92 }).toFile(path.join(outDir, `${slug}.webp`));
  // cache-bust + refresh ar in styling.json
  const entry = styling.find((s) => s.url.includes(`${slug}.webp`));
  if (entry) { entry.ar = ar; entry.url = `/images/styling/${slug}.webp?v=2`; }
  console.log(`. ${slug} ar=${ar}`);
}
fs.writeFileSync(jsonPath, JSON.stringify(styling));
console.log("repaired + cache-busted in styling.json");
