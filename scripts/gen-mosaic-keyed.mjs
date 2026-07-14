// Mosaic tiles - background removal by EDGE WHITE-KEYING (replaces the @imgly
// approach, which erased most mosaics because a tile sheet is a full-frame
// texture, not a foreground object). Downloads each mosaic's ORIGINAL supplier
// shot (read from .refwork/tiles-orig.json = git show main:public/data/tiles.json),
// flood-fills the near-white studio surround inward from the borders (keeping
// white tiles INSIDE the sheet, since they aren't connected to the edge), trims,
// and writes a transparent webp -> public/images/tiles/. Sheets that fill the
// frame (border isn't mostly white) are kept as-is (clean square swatch).
//   git show main:public/data/tiles.json > .refwork/tiles-orig.json
//   node scripts/gen-mosaic-keyed.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const TILES = path.join(ROOT, "public/data/tiles.json");
const outDir = path.join(ROOT, "public/images/tiles");
fs.mkdirSync(outDir, { recursive: true });
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const isMosaic = (t) =>
  /piccolo|penny\s*round/i.test(t.type) ||
  /mosaic|kit\s*kat|penny\s*round|stack\s*bond|mini\s*arch|cobble/i.test(t.name);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const orig = JSON.parse(fs.readFileSync(path.join(ROOT, ".refwork/tiles-orig.json"), "utf8"));
const origById = new Map(orig.map((t) => [t.id, t]));
const cur = JSON.parse(fs.readFileSync(TILES, "utf8"));
const mosaics = cur.filter(isMosaic);

const isBg = (r, g, b) => Math.min(r, g, b) > 224; // near-white / light-grey studio

let keyed = 0, kept = 0, failed = 0;
for (const t of mosaics) {
  const src = origById.get(t.id);
  const url = src && src.url;
  const slug = slugify(t.name);
  try {
    if (!url || url.startsWith("/")) throw new Error("no original url");
    const resp = await fetch(url, { headers: { "User-Agent": UA } });
    const inBuf = Buffer.from(await resp.arrayBuffer());
    if (resp.status !== 200 || inBuf.length < 2000) throw new Error(`http ${resp.status}`);

    const { data, info } = await sharp(inBuf)
      .resize(600, 600, { fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, px = W * H;
    const idx = (x, y) => (y * W + x) * 4;

    // border whiteness -> decide whether to key at all
    let border = 0, borderWhite = 0;
    for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { border++; const i = idx(x, y); if (isBg(data[i], data[i+1], data[i+2])) borderWhite++; }
    for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { border++; const i = idx(x, y); if (isBg(data[i], data[i+1], data[i+2])) borderWhite++; }
    const frac = borderWhite / border;

    if (frac > 0.5) {
      // flood-fill background from every near-white border pixel
      const seen = new Uint8Array(px);
      const q = [];
      const push = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const p = y * W + x; if (seen[p]) return; const i = p * 4; if (!isBg(data[i], data[i+1], data[i+2])) return; seen[p] = 1; q.push(p); };
      for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
      for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
      for (let h = 0; h < q.length; h++) { const p = q[h], x = p % W, y = (p / W) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
      for (let p = 0; p < px; p++) if (seen[p]) data[p * 4 + 3] = 0; // clear alpha on background
      keyed++;
    } else {
      kept++;
    }

    await sharp(data, { raw: { width: W, height: H, channels: 4 } })
      .trim({ threshold: 10 })
      .webp({ quality: 88 })
      .toFile(path.join(outDir, `${slug}.webp`));
    t.url = `/images/tiles/${slug}.webp`;
    process.stdout.write(frac > 0.5 ? "k" : ".");
  } catch (e) {
    failed++;
    console.log(`\nx ${t.name}: ${e.message}`);
  }
}
fs.writeFileSync(TILES, JSON.stringify(cur));
console.log(`\nkeyed ${keyed} (white surround removed), kept ${kept} (full-frame), failed ${failed}. URLs repointed.`);
