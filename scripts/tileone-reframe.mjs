// Reframe tile FACES to the OnWood house style: the tile sits on a white field at
// ~57% of the frame (matching the existing ABI tiles/mosaics), with a soft shadow
// so it reads as a real product shot rather than a blown-up crop. Fetches faces
// fresh from source, writes public/images/tileone/<code>.webp. Free (sharp only).
//   node scripts/tileone-reframe.mjs
import fs from "fs";
import sharp from "sharp";

const UA = { "User-Agent": "Mozilla/5.0" };
const OUT = "public/images/tileone";
fs.mkdirSync(OUT, { recursive: true });

// code -> source face url (Tile One website full-res faces). Permanent Item codes.
const FACES = {
  GLOANQBLUE15M: "upload/202409/1726013471.png",
  GLOANQICE15M: "upload/202409/1726014320.png",
  GLOANQOPAL15M: "upload/202409/1726013396.png",
  GLOANQALMON15M: "upload/202409/1726013501.png",
  GLOANQVERDE15M: "upload/202409/1726013093.png",
  GLOANQSEVIL15M: "upload/202409/1726013782.png",
  GLOANQVALENB15M: "upload/202409/1726013750.png",
  GLOANQVALENV15M: "upload/202409/1726013365.png",
  GLOANQVENET15M: "upload/202409/1726013309.png",
};

const CANVAS = 1200;
const RATIO = 0.57;                 // house style: tile ~57% of frame
const TILE = Math.round(CANVAS * RATIO);
const OFF = Math.round((CANVAS - TILE) / 2);

for (const [code, src] of Object.entries(FACES)) {
  const buf = Buffer.from(await fetch(`https://www.tileone.com.au/${src}`, { headers: UA }).then((r) => r.arrayBuffer()));
  const tile = await sharp(buf).resize(TILE, TILE, { fit: "cover" }).png().toBuffer();
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" } })
    .composite([{ input: tile, left: OFF, top: OFF }])
    .webp({ quality: 90 })
    .toFile(`${OUT}/${code}.webp`);
  console.log(`reframed ${code}`);
}
console.log(`done -> ${OUT} (${TILE}px tile on ${CANVAS}px white)`);
