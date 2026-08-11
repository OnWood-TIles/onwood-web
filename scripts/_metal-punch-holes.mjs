// Punch the ABI metal discs' photographic hang-hole to TRANSPARENT, so the vision-
// board backdrop shows through it (instead of the baked-in white studio spot).
// Adaptive: finds the small light hole in the disc's upper area; skips any disc
// where the hole can't be located confidently (leaves it untouched).
// Writes punched copies to .refwork/metals-punched/ + a review montage over olive.
//   node scripts/_metal-punch-holes.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = "public/images/metals/abi";
const OUT = ".refwork/metals-punched";
fs.mkdirSync(OUT, { recursive: true });

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

async function punch(file) {
  const buf = fs.readFileSync(path.join(SRC, file));
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const at = (x, y) => (y * W + x) * 4;

  // disc bbox + median luminance (opaque pixels only)
  let minX = W, minY = H, maxX = 0, maxY = 0;
  const lums = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = at(x, y);
    if (data[i + 3] < 200) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    lums.push(lum(data[i], data[i + 1], data[i + 2]));
  }
  if (!lums.length) return { file, ok: false, why: "no disc" };
  lums.sort((a, b) => a - b);
  const median = lums[Math.floor(lums.length / 2)];
  const bboxH = maxY - minY;

  // candidate hole pixels: light + low-saturation (greyish/white) in the upper area
  const topLimit = minY + bboxH * 0.5;
  const cand = [];
  for (let y = minY; y < topLimit; y++) for (let x = minX; x <= maxX; x++) {
    const i = at(x, y);
    if (data[i + 3] < 200) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const L = lum(r, g, b);
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (L > median + 48 && L > 200 && sat < 46) cand.push([x, y]);
  }
  if (cand.length < 20) return { file, ok: false, why: `few candidates (${cand.length})` };

  // centroid + radius from area; reject if too scattered or wrong size
  const cx = cand.reduce((s, p) => s + p[0], 0) / cand.length;
  const cy = cand.reduce((s, p) => s + p[1], 0) / cand.length;
  const rad = Math.sqrt(cand.length / Math.PI);
  const meanDist = cand.reduce((s, p) => s + Math.hypot(p[0] - cx, p[1] - cy), 0) / cand.length;
  if (rad < 3 || rad > 22) return { file, ok: false, why: `radius ${rad.toFixed(1)}` };
  if (meanDist > rad * 1.9) return { file, ok: false, why: "scattered" };

  // punch a soft-edged transparent circle
  const rIn = rad * 0.92, rOut = rad * 1.05;
  for (let y = Math.max(0, cy - rOut - 2); y < Math.min(H, cy + rOut + 2); y++)
    for (let x = Math.max(0, cx - rOut - 2); x < Math.min(W, cx + rOut + 2); x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > rOut) continue;
      const i = at(x, y);
      const k = d <= rIn ? 0 : 1 - (rOut - d) / (rOut - rIn); // 0 inside, ramp to 1 at edge
      data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, k)));
    }

  await sharp(data, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 92 }).toFile(path.join(OUT, file));
  return { file, ok: true, cx: Math.round(cx), cy: Math.round(cy), rad: +rad.toFixed(1) };
}

async function main() {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".webp"));
  const results = [];
  for (const f of files) { try { results.push(await punch(f)); } catch (e) { results.push({ file: f, ok: false, why: e.message }); } }

  // review montage: each PUNCHED disc over an OLIVE tile (so a transparent hole shows olive)
  const done = results.filter((r) => r.ok);
  const cell = 300, cols = 4, gap = 16, lbl = 34, pad = 20;
  const rows = Math.ceil(done.length / cols);
  const MW = pad * 2 + cols * cell + (cols - 1) * gap;
  const MH = pad * 2 + rows * (cell + lbl) + (rows - 1) * gap;
  const layers = [];
  for (let i = 0; i < done.length; i++) {
    const r = done[i];
    const col = i % cols, row = Math.floor(i / cols);
    const x = pad + col * (cell + gap), y = pad + row * (cell + lbl + gap);
    const olive = await sharp({ create: { width: cell, height: cell, channels: 4, background: "#5C6141" } }).png().toBuffer();
    const disc = await sharp(path.join(OUT, r.file)).resize(cell - 40, cell - 40, { fit: "inside" }).png().toBuffer();
    const tile = await sharp(olive).composite([{ input: disc, gravity: "center" }]).png().toBuffer();
    const name = r.file.replace(".webp", "");
    const lblSvg = Buffer.from(`<svg width="${cell}" height="${lbl}"><rect width="${cell}" height="${lbl}" fill="#f2e9dc"/><text x="10" y="23" font-family="Arial" font-size="17" font-weight="700" fill="#2B2723">${name}</text></svg>`);
    layers.push({ input: tile, left: x, top: y }, { input: lblSvg, left: x, top: y + cell });
  }
  const deskDir = path.join(process.env.USERPROFILE, "Desktop", "Metal-Holes-Review");
  fs.mkdirSync(deskDir, { recursive: true });
  await sharp({ create: { width: MW, height: MH, channels: 3, background: "#ffffff" } })
    .composite(layers).jpeg({ quality: 92 }).toFile(path.join(deskDir, "_metal-holes-over-olive.jpg"));

  console.log("Punched:", done.map((r) => r.file).join(", ") || "(none)");
  console.log("Skipped:", results.filter((r) => !r.ok).map((r) => `${r.file} [${r.why}]`).join(", ") || "(none)");
  console.log("Review →", deskDir);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
