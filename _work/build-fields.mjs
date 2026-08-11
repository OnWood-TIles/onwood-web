import sharp from "sharp";
import fs from "fs";

// Same-design patterned colourways: 4 tiles pivot at a shared corner -> floral medallion.
// rotAt by (r%2,c%2): (0,0)=270 (0,1)=0 (1,0)=180 (1,1)=90  — proven on Valencia Blue.
const rotAt = (r, c) => (r % 2 === 0 ? (c % 2 === 0 ? 270 : 0) : (c % 2 === 0 ? 180 : 90));

const TILES = {
  "valencia-blue": "https://onwoodtiles.com.au/images/tileone/GLOANQVALENB15M.webp?v=3",
  "valencia-verde": "https://onwoodtiles.com.au/images/tileone/GLOANQVALENV15M.webp?v=3",
  "venetian": "https://onwoodtiles.com.au/images/tileone/GLOANQVENET15M.webp?v=3",
};

const T = 256;      // px per tile in the composite
const N = 8;        // NxN field (= 4x4 medallions), all pattern, NO plain border

async function faceBuf(url) {
  const r = await fetch(url);
  const b = Buffer.from(await r.arrayBuffer());
  // strip the white house-style frame so tiles butt seamlessly
  return await sharp(b).trim({ background: "#ffffff", threshold: 22 }).toBuffer();
}

async function build(name, url) {
  const face = await faceBuf(url);
  const cell = async (r, c) =>
    await sharp(face).resize(T, T, { fit: "fill" }).rotate(rotAt(r, c)).toBuffer();

  // single 2x2 medallion (the "4 tiles together" unit)
  const med = sharp({ create: { width: 2 * T, height: 2 * T, channels: 3, background: "#ffffff" } });
  const medComposite = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++)
    medComposite.push({ input: await cell(r, c), left: c * T, top: r * T });
  await med.composite(medComposite).png().toFile(`_work/med-${name}.png`);

  // NxN all-pattern field
  const field = sharp({ create: { width: N * T, height: N * T, channels: 3, background: "#ffffff" } });
  const fieldComposite = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
    fieldComposite.push({ input: await cell(r, c), left: c * T, top: r * T });
  await field.composite(fieldComposite).png().toFile(`_work/vfield-${name}.png`);
  console.log("built med-" + name + ".png + vfield-" + name + ".png");
}

for (const [name, url] of Object.entries(TILES)) await build(name, url);

// side-by-side montage of the three medallions to eyeball the pivot
const names = Object.keys(TILES);
const meds = await Promise.all(names.map((n) => sharp(`_work/med-${n}.png`).resize(360, 360).toBuffer()));
await sharp({ create: { width: 360 * 3 + 40, height: 380, channels: 3, background: "#f4f1ec" } })
  .composite(meds.map((b, i) => ({ input: b, left: 10 + i * 370, top: 10 })))
  .png().toFile("_work/med-montage.png");
console.log("built med-montage.png");
