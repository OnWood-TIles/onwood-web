// Assemble the ANTIQUITY POC: join the parsed pricelist rows to the matched
// website faces, optimise each face to webp, and write a products.json ready for
// the OnBase import. Free (sharp only). Run: node scripts/tileone-assemble.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const POC = ".refwork/tileone-antiquity";
const out = `${POC}/final`;
fs.mkdirSync(out, { recursive: true });

// face filename -> colour (matched by eye against the brochure).
const MATCH = {
  "1726013471.png": "Blue",
  "1726014320.png": "Ice",
  "1726013396.png": "Opal",
  "1726013501.png": "Almond",
  "1726013093.png": "Verde",
  "1726013782.png": "Seville",
  "1726013750.png": "Valencia Blue",
  "1726013365.png": "Valencia Verde",
  "1726013309.png": "Venetian",
};

const rows = JSON.parse(fs.readFileSync(`${POC.replace("/tileone-antiquity", "")}/tileone-all.json`, "utf8"))
  .filter((r) => /ANTIQUITY/i.test(r.range || ""));

const norm = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim();
const products = [];
for (const [file, colour] of Object.entries(MATCH)) {
  // find the pricelist row whose colour/finish starts with this colour
  const row = rows.find((r) => norm(r.colourFinish).startsWith(norm(colour)));
  if (!row) { console.log(`! no pricelist row for ${colour}`); continue; }
  const webp = `${row.code}.webp`;
  await sharp(`${POC}/faces/${file}`).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(out, webp));
  products.push({
    code: row.code,
    supplierName: `Antiquity ${colour}`,
    range: "Antiquity",
    colour,
    size: "150x150",
    finish: /DECO/i.test(row.colourFinish) ? "Décor" : "Matt",
    material: "Porcelain",
    application: "Floor & Wall",
    slipRating: "P3",
    supplierPriceM2: row.cartonPriceM2,
    palletPriceM2: row.palletPriceM2,
    coverageM2PerBox: row.m2box,
    face: `${out}/${webp}`,
  });
}
products.sort((a, b) => a.colour.localeCompare(b.colour));
fs.writeFileSync(`${POC}/products.json`, JSON.stringify(products, null, 1));
console.log(`assembled ${products.length} products -> ${POC}/products.json`);
console.log(products.map((p) => `  ${p.code} | ${p.supplierName} | ${p.size} ${p.finish} | $${p.supplierPriceM2}/m² | ${p.coverageM2PerBox} m²/box`).join("\n"));
