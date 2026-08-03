// Reframe Boutique mosaic FACE swatches to the white-margin house style and optimise
// the ROOM shots, keyed by the product Item CODE. node scripts/boutique-assets.mjs
import fs from "fs";
import sharp from "sharp";
const SRC = ".refwork/bq2/Boutique/";
const PUB = "public/images/tileone";
const ROOMS = `${PUB}/rooms`;
fs.mkdirSync(ROOMS, { recursive: true });

const FACE = {
  STABOUCALACF: "Mosaics/aSTONished_-_Feather_-_Calacatta_Gold_Mixed.jpg",
  STABOUMINGGF: "Mosaics/aSTONished_-_Feather_-_Ming_Green.jpg",
  STABOUROJOAF: "Mosaics/aSTONished_-_Feather_-_Rojo_Alicante.jpg",
  STABOUROSSAF: "Mosaics/aSTONished_-_Feather_-_Rosa_Crema.jpg",
  STABOUCALACB: "Mosaics/Calacatta Gold Mix 3D Bar.jpg",
  STABOUSTATUB: "Mosaics/Statuario 3D Bar.jpg",
  STABOUNEROMP: "Mosaics/PR_-_Nero_Marquina.jpg",
  STABOUROSSAP: "Boutique Rossa Crema Penny Round.jpg",
  STABOUCALACP: "CALACATTA GOLD M - Penny Round 20mm .jpg",
};
const ROOM = {
  STABOUNEROMF: "NERO MARQUINA - Feather.jpg",
  STABOUMINGGP: "MING GREEN - Penny Round 20mm.jpg",
  STABOUROJOAP: "ROJO ALICANTE - Penny Round 20mm.jpg",
  STABOUCALACB: "Calacatta Gold Mix 3D Bar mock-up.jpg",
  STABOUSTATUB: "Statuario 3D Bar mock-up.jpg",
  STABOUROSSAP: "Rossa Crema - Penny Round 20mm.jpg",
};

const CANVAS = 1200, BOX = Math.round(CANVAS * 0.57);
async function reframe(src, out) {
  const resized = await sharp(SRC + src).resize(BOX, BOX, { fit: "inside" }).toBuffer();
  const m = await sharp(resized).metadata();
  const left = Math.round((CANVAS - m.width) / 2), top = Math.round((CANVAS - m.height) / 2);
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" } })
    .composite([{ input: resized, left, top }]).webp({ quality: 90 }).toFile(out);
}

for (const [code, f] of Object.entries(FACE)) { await reframe(f, `${PUB}/${code}.webp`); console.log("face", code); }
for (const [code, f] of Object.entries(ROOM)) { await sharp(SRC + f).resize(1400, 1400, { fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toFile(`${ROOMS}/${code}.webp`); console.log("room", code); }
console.log("done");
