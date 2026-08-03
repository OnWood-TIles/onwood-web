// Parse the Tile One "Stock Master File List" PDF: reconstruct table rows, detect
// the GREEN-highlighted ones (the products we're taking on), and pull Item code +
// description (range/size/colour/finish) + prices + m2/box. Item code = permanent
// join key. Writes .refwork/tileone-green.json. Run: node scripts/tileone-parse.mjs
import fs from "fs";
import * as mupdf from "mupdf";
import sharp from "sharp";

const PDF = "C:/Users/Reagan Genrich/OneDrive/Documents/OnWood Flooring & Tiles/Suppliers/Tile One/Tile One Samples.pdf";
const SCALE = 2;
const doc = mupdf.Document.openDocument(fs.readFileSync(PDF), "application/pdf");
fs.mkdirSync(".refwork", { recursive: true });

const num = (t) => /^\d+(\.\d+)?$/.test(t);
const rows = [];

for (let p = 0; p < doc.countPages(); p++) {
  const page = doc.loadPage(p);
  // showExtras=true so the green HIGHLIGHT annotations render (that's the selection).
  const pix = page.toPixmap(mupdf.Matrix.scale(SCALE, SCALE), mupdf.ColorSpace.DeviceRGB, false, true);
  const { data, info } = await sharp(pix.asPNG()).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, ch = info.channels;
  const H = info.height;
  const green = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const i = (y * W + x) * ch, r = data[i], g = data[i + 1], b = data[i + 2];
    return g > 110 && g - r > 16 && g - b > 16; // pale highlight green
  };

  const st = JSON.parse(page.toStructuredText("preserve-whitespace").asJSON());
  const cells = [];
  for (const blk of st.blocks || []) for (const ln of blk.lines || []) {
    const t = (ln.text || "").trim();
    if (!t) continue;
    const b = ln.bbox; // {x,y,w,h}
    const x0 = b.x * SCALE, y0 = b.y * SCALE, y1 = (b.y + b.h) * SCALE;
    cells.push({ t, x0, cy: (y0 + y1) / 2 });
  }
  cells.sort((a, b) => a.cy - b.cy || a.x0 - b.x0);

  const groups = [];
  for (const c of cells) {
    let g = groups.length && Math.abs(groups[groups.length - 1].cy - c.cy) < 7 ? groups[groups.length - 1] : null;
    if (!g) { g = { cy: c.cy, cells: [] }; groups.push(g); }
    g.cells.push(c);
    g.cy = g.cells.reduce((s, x) => s + x.cy, 0) / g.cells.length;
  }

  for (const g of groups) {
    g.cells.sort((a, b) => a.x0 - b.x0);
    const texts = g.cells.map((c) => c.t);
    const yb = Math.round(g.cy);
    let hit = 0, tot = 0;
    for (let x = Math.round(W * 0.02); x < Math.round(W * 0.5); x += 4) { tot++; if (green(x, yb)) hit++; }
    const isGreen = tot > 0 && hit / tot > 0.25;
    let item = texts[0] || "";
    const descIdx = texts.findIndex((t) => /\d+X\d+/i.test(t));
    if (descIdx < 0) continue; // not a product row
    let desc = texts[descIdx];
    // Some rows put the item code + description in one cell -> split the code off.
    if (descIdx === 0) {
      const mm = desc.match(/^(\S+)\s+(.*\d+X\d+.*)$/i);
      if (mm) { item = mm[1]; desc = mm[2]; }
    }
    const decimals = texts.filter((t) => /^\d+\.\d+$/.test(t)).map(Number);
    const m2box = decimals.find((n) => n > 0.2 && n < 5) ?? null;
    const prices = decimals.filter((n) => n >= 5).sort((a, b) => b - a);
    // Boxes/Pallet is the pure-integer column (Suppl Stock is alphanumeric, sizes
    // live inside the description, prices/m2box always carry a decimal point).
    const ints = texts.filter((t) => /^\d+$/.test(t)).map(Number);
    const boxesPerPallet = ints.find((n) => n >= 3 && n <= 400) ?? null;
    const m = desc.match(/^(.*?)\s+(\d+X\d+(?:X\d+)?)\s+(.*)$/i);
    rows.push({
      item,
      code: item,
      description: desc,
      range: m ? m[1].trim() : null,
      size: m ? m[2] : null,
      colourFinish: m ? m[3].trim() : null,
      cartonPriceM2: prices[0] ?? null,
      palletPriceM2: prices[1] ?? null,
      m2box,
      boxesPerPallet,
      green: isGreen,
      page: p + 1,
    });
  }
}

fs.writeFileSync(".refwork/tileone-all.json", JSON.stringify(rows, null, 1));
const green = rows.filter((r) => r.green);
console.log(`product rows: ${rows.length} (green: ${green.length})`);
console.log("\nANTIQUITY (all rows):");
console.log(rows.filter((r) => /ANTIQUITY/i.test(r.range || "")).map((r) => `  ${r.green ? "✓" : " "} ${r.code} | ${r.description} | m2/box ${r.m2box} | $${r.cartonPriceM2}`).join("\n"));
