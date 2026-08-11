// Second attempt at punching the ABI metal hang-holes transparent — DIRECT method:
// clear the alpha of the small cluster of near-white NEUTRAL opaque pixels (the hole)
// in the disc's upper area. Only runs on darker/neutral discs where the hole is
// clearly separable from the metal face; skips bright discs (their white hole is
// barely visible anyway). Verifies inline by compositing over magenta.
//   node scripts/_metal-punch2.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = "public/images/metals/abi";
const OUT = ".refwork/metals-punched2";
fs.mkdirSync(OUT, { recursive: true });
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

async function punch(file) {
  const buf = fs.readFileSync(path.join(SRC, file));
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const at = (x, y) => (y * W + x) * 4;

  // disc bbox + median luminance (opaque pixels)
  let minX = W, minY = H, maxX = 0, maxY = 0; const lums = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = at(x, y); if (data[i + 3] < 200) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    lums.push(lum(data[i], data[i + 1], data[i + 2]));
  }
  if (!lums.length) return { file, ok: false, why: "no disc" };
  lums.sort((a, b) => a - b);
  const median = lums[Math.floor(lums.length / 2)];
  if (median > 165) return { file, ok: false, why: `too bright (median ${median.toFixed(0)})` };

  // Hole = near-white NEUTRAL opaque pixels in the TOP 45% of the disc.
  const topLimit = minY + (maxY - minY) * 0.45;
  const mask = new Uint8Array(W * H); // 1 = clear this pixel
  let n = 0, sx = 0, sy = 0;
  for (let y = minY; y < topLimit; y++) for (let x = minX; x <= maxX; x++) {
    const i = at(x, y); if (data[i + 3] < 150) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (lum(r, g, b) > 205 && sat < 40) { mask[y * W + x] = 1; n++; sx += x; sy += y; }
  }
  if (n < 12) return { file, ok: false, why: `hole not found (${n}px)` };
  const cx = sx / n, cy = sy / n, rad = Math.sqrt(n / Math.PI);
  // reject if the cluster is scattered (not a compact hole)
  let spread = 0; for (let y = minY; y < topLimit; y++) for (let x = minX; x <= maxX; x++) if (mask[y * W + x]) spread += Math.hypot(x - cx, y - cy);
  if (spread / n > rad * 2.2 || rad > 24) return { file, ok: false, why: `not compact (r${rad.toFixed(1)})` };

  // Clear the hole + a 2px dilation, with a soft 1px feather on the ring.
  const clear = new Uint8Array(mask);
  for (let pass = 0; pass < 2; pass++) {
    const add = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (clear[y * W + x]) continue;
      if (clear[(y - 1) * W + x] || clear[(y + 1) * W + x] || clear[y * W + x - 1] || clear[y * W + x + 1]) add.push(y * W + x);
    }
    for (const p of add) clear[p] = 1;
  }
  for (let p = 0; p < W * H; p++) if (clear[p]) data[p * 4 + 3] = 0;

  await sharp(data, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 92 }).toFile(path.join(OUT, file));
  return { file, ok: true, cx: Math.round(cx), cy: Math.round(cy), rad: +rad.toFixed(1), n };
}

async function main() {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".webp"));
  const res = [];
  for (const f of files) { try { res.push(await punch(f)); } catch (e) { res.push({ file: f, ok: false, why: e.message }); } }

  // VERIFY: composite each PUNCHED disc over magenta so a transparent hole is obvious.
  const done = res.filter((r) => r.ok);
  const cell = 300, cols = 3, gap = 12, lbl = 30, pad = 16;
  const rows = Math.ceil(done.length / cols) || 1;
  const MW = pad * 2 + cols * cell + (cols - 1) * gap;
  const MH = pad * 2 + rows * (cell + lbl) + (rows - 1) * gap;
  const layers = [];
  for (let i = 0; i < done.length; i++) {
    const r = done[i]; const col = i % cols, row = Math.floor(i / cols);
    const x = pad + col * (cell + gap), y = pad + row * (cell + lbl + gap);
    const mag = await sharp({ create: { width: cell, height: cell, channels: 4, background: "#ff00ff" } }).png().toBuffer();
    const disc = await sharp(path.join(OUT, r.file)).resize(cell - 40, cell - 40, { fit: "inside" }).png().toBuffer();
    const tile = await sharp(mag).composite([{ input: disc, gravity: "center" }]).png().toBuffer();
    const lblSvg = Buffer.from(`<svg width="${cell}" height="${lbl}"><rect width="${cell}" height="${lbl}" fill="#f2e9dc"/><text x="8" y="21" font-family="Arial" font-size="15" font-weight="700" fill="#2B2723">${r.file.replace(".webp", "")}</text></svg>`);
    layers.push({ input: tile, left: x, top: y }, { input: lblSvg, left: x, top: y + cell });
  }
  const desk = path.join(process.env.USERPROFILE, "Desktop", "Metal-Holes-Review");
  fs.mkdirSync(desk, { recursive: true });
  if (layers.length) await sharp({ create: { width: MW, height: MH, channels: 3, background: "#fff" } }).composite(layers).jpeg({ quality: 92 }).toFile(path.join(desk, "_punch2-over-magenta.jpg"));

  console.log("Punched:", done.map((r) => `${r.file}(r${r.rad})`).join(", ") || "(none)");
  console.log("Skipped:", res.filter((r) => !r.ok).map((r) => `${r.file}[${r.why}]`).join(", ") || "(none)");
  console.log("Verify →", path.join(desk, "_punch2-over-magenta.jpg"));
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
