// Reframe the Tivoli 450x450 faces (Beige/Grey/Silver) to the OnWood house style:
// clean tile face on white at ~57% of the frame, matching every other tile.
// Source faces are straight-on full-frame textures, so fit:cover fills the box.
//   node scripts/tivoli-assets.mjs
import sharp from "sharp";

const SRC = ".refwork/tivoli";
const OUT = "public/images/tileone";

const FACES = {
  GLOTIVBEIGE45M: "Tivoli Beige 450 x 450 Matt.jpg",
  GLOTIVGREY45M: "Tivoli Grey 450 x 450 Matt.jpg",
  GLOTIVSILVE45M: "Tivoli Silver 450 x 450 Matt.jpg",
};

const CANVAS = 1200;
const TILE = Math.round(CANVAS * 0.57);
const OFF = Math.round((CANVAS - TILE) / 2);

for (const [code, file] of Object.entries(FACES)) {
  const tile = await sharp(`${SRC}/${file}`).resize(TILE, TILE, { fit: "cover" }).png().toBuffer();
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" } })
    .composite([{ input: tile, left: OFF, top: OFF }])
    .webp({ quality: 90 })
    .toFile(`${OUT}/${code}.webp`);
  console.log(`reframed ${code}  <-  ${file}`);
}
console.log(`done -> ${OUT} (${TILE}px tile on ${CANVAS}px white)`);
