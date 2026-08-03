// Reframe the AI-generated Boutique primaries to house style (white margin, NO shadow)
// and host Calacatta Penny's old styled photo as its new SECONDARY.
//   node scripts/boutique-gen-assets.mjs
import sharp from "sharp";
const GEN = ".refwork/bqgen/";
const SRC = ".refwork/bq3/Boutique/";
const PUB = "public/images/tileone";
const ROOMS = `${PUB}/rooms`;

const CODES = ["STABOUNEROMF", "STABOUMINGGP", "STABOUROJOAP", "STABOUROSSAP", "STABOUCALACP"];
const CANVAS = 1200, BOX = Math.round(CANVAS * 0.57);
async function reframe(inp, out) {
  const resized = await sharp(inp).resize(BOX, BOX, { fit: "inside" }).toBuffer();
  const m = await sharp(resized).metadata();
  const left = Math.round((CANVAS - m.width) / 2), top = Math.round((CANVAS - m.height) / 2);
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" } })
    .composite([{ input: resized, left, top }]).webp({ quality: 90 }).toFile(out);
}
for (const c of CODES) { await reframe(`${GEN}${c}.png`, `${PUB}/${c}.webp`); console.log("primary", c); }
// Calacatta Penny old styled photo -> secondary
await sharp(`${SRC}CALACATTA GOLD M - Penny Round 20mm .jpg`).resize(1400, 1400, { fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toFile(`${ROOMS}/STABOUCALACP.webp`);
console.log("secondary STABOUCALACP (old styled photo)");
console.log("done");
