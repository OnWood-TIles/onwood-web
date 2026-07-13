// Generates public/data/carpet.json from the range data in lib/carpet.ts.
// Keeps the (large, growing) catalogue OUT of the client JS bundle - the vision
// board fetches this JSON on demand instead. Re-run after editing lib/carpet.ts:
//   node scripts/gen-carpet.mjs
import fs from "fs";
import path from "path";

const root = process.cwd();
const src = fs.readFileSync(path.join(root, "lib/carpet.ts"), "utf8");

// Extract the CARPET_RANGES array literal and eval it with the `c` helper.
const decl = src.indexOf("CARPET_RANGES");
const arrStart = src.indexOf("[", src.indexOf("=", decl));
const boundary = src.indexOf("export type CarpetSwatchItem");
const arrEnd = src.lastIndexOf("]", boundary);
const literal = src.slice(arrStart, arrEnd + 1);
const c = (name, id) => ({ name, id });
const CARPET_RANGES = eval(literal);

const LOGOS = {
  Feltex: "/images/carpet/feltex-logo.svg",
  Redbook: "/images/carpet/redbook-logo.svg",
  "Godfrey Hirst": "/images/carpet/godfreyhirst-logo.svg",
};

// Feltex + Redbook share the same Cloudinary "gh" swatch pattern.
const swatchUrl = (id) =>
  `https://res.cloudinary.com/gh/image/upload/d_variants:${id}:floods:flat-web.jpg/ar_1:1,c_crop,g_center,w_400/f_auto/q_auto:good/v1/variants/${id}/swatches/1`;

const out = [];
for (const r of CARPET_RANGES) {
  const brand = r.brand || "Feltex";
  for (const col of r.colours) {
    out.push({
      colour: col.name,
      range: r.name,
      category: r.category,
      brand,
      brandLogo: LOGOS[brand],
      id: col.id,
      url: swatchUrl(col.id),
    });
  }
}

fs.mkdirSync(path.join(root, "public/data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "public/data/carpet.json"),
  JSON.stringify(out),
);
console.log(`wrote ${out.length} carpet swatches to public/data/carpet.json`);
