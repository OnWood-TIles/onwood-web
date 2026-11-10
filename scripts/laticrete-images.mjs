// OnWood-made images for the LATICRETE adhesive + grout products (we have no permission to use
// LATICRETE's own pack shots yet). Reads onbase/scripts/laticrete/catalogue.json and writes:
//   public/images/laticrete/<slug>.webp            product card (name, pack, rating, availability)
//   public/images/laticrete/grout/<num>-<name>.webp grout colour swatch with a fine sanded texture
//   node scripts/laticrete-images.mjs
import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";

const CAT = JSON.parse(readFileSync("../onbase/scripts/laticrete/catalogue.json", "utf8"));
const OUT = "public/images/laticrete";
mkdirSync(`${OUT}/grout`, { recursive: true });

const INK = "#20303a", ACCENT = "#d06a45", BG = "#f6f1ea", LINE = "#e6ded3", MUTED = "#6a7075";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const swatchFile = (c) => `grout/${c.num}-${slug(c.name)}.webp`;

// Fine "sanded grout" grain: random grey noise blended softly over the flat colour.
async function swatch(hex, size = 600) {
  const n = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = 128 + Math.round((Math.random() - 0.5) * 90);
    n[i * 4] = n[i * 4 + 1] = n[i * 4 + 2] = v;
    n[i * 4 + 3] = 34;
  }
  const grain = await sharp(n, { raw: { width: size, height: size, channels: 4 } }).blur(0.6).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background: hex } })
    .composite([{ input: grain, blend: "overlay" }]);
}

// Wrap text into lines of at most `max` characters.
function wrap(text, max) {
  const out = []; let line = "";
  for (const w of text.split(" ")) {
    if ((line + " " + w).trim().length > max) { out.push(line.trim()); line = w; } else line += " " + w;
  }
  if (line.trim()) out.push(line.trim());
  return out;
}

function card(item) {
  const W = 1200, H = 1200;
  const title = item.name.replace(/^LATICRETE /, "");
  const titleLines = wrap(title, 17);
  const tag = wrap(item.tagline, 40);
  const status = item.stocked ? "STOCKED IN OUR SHOWROOM" : "SPECIAL ORDER";
  let y = 340;
  const titleSvg = titleLines.map((l) => { const t = `<text x="90" y="${y}" font-family="Arial" font-weight="700" font-size="92" fill="${INK}" letter-spacing="-2">${esc(l)}</text>`; y += 100; return t; }).join("");
  y += 20;
  const tagSvg = tag.map((l) => { const t = `<text x="90" y="${y}" font-family="Georgia" font-style="italic" font-size="44" fill="${MUTED}">${esc(l)}</text>`; y += 58; return t; }).join("");
  // Grouts: a strip of their colours along the bottom.
  const cols = item.category === "grout" ? item.colours : [];
  const per = Math.max(cols.length, 1), sw = (W - 180) / per;
  const strip = cols.map((c, i) => `<rect x="${90 + i * sw}" y="${H - 300}" width="${Math.ceil(sw)}" height="90" fill="${c.hex}"/>`).join("");
  const stripBorder = cols.length ? `<rect x="90" y="${H - 300}" width="${W - 180}" height="90" fill="none" stroke="${LINE}" stroke-width="2"/>` : "";
  const pill = (x, label, fill, color, w) => `<rect x="${x}" y="${H - 175}" rx="32" width="${w}" height="64" fill="${fill}" stroke="${LINE}" stroke-width="2"/><text x="${x + w / 2}" y="${H - 132}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="28" fill="${color}">${esc(label)}</text>`;
  const packLabel = item.pack.replace(/ \(.*\)$/, ""); // "11 kg bag (covers like 20 kg)" -> "11 kg bag"
  const packW = 60 + packLabel.length * 16.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="${BG}"/>
    <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${LINE}" stroke-width="3"/>
    <text x="90" y="150" font-family="Arial" font-weight="700" font-size="30" letter-spacing="6" fill="${ACCENT}">LATICRETE · ${item.category === "grout" ? "GROUT" : "ADHESIVE"}</text>
    <text x="90" y="205" font-family="Arial" font-weight="700" font-size="30" letter-spacing="4" fill="${item.stocked ? INK : MUTED}">${status}</text>
    ${titleSvg}${tagSvg}${strip}${stripBorder}
    ${pill(90, packLabel, "#fff", INK, packW)}
    ${pill(90 + packW + 24, item.rating, ACCENT, "#fff6ee", 60 + item.rating.length * 22)}
  </svg>`;
  return sharp(Buffer.from(svg));
}

let n = 0;
for (const item of CAT) {
  await card(item).webp({ quality: 88 }).toFile(`${OUT}/${item.slug}.webp`); n++;
  if (item.category === "grout") for (const c of item.colours) {
    await (await swatch(c.hex)).webp({ quality: 86 }).toFile(`${OUT}/${swatchFile(c)}`);
  }
}
console.log(`${n} product cards + grout swatches written to ${OUT}`);
