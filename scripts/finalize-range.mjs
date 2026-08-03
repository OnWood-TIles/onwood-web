// MECHANICAL pass 2: given the vision agent's colour map for a range, reframe the
// identified FACE images to the white-margin house style and optimise the ROOM
// images, writing them to public/images/tileone/. Reads raw cache (no re-download).
//   node scripts/finalize-range.mjs <NORMKEY> <matchJsonPath>
// matchJson: { colours: { "<colour>": { faceImgId, roomImgId|null, colourTag } }, ... }
import fs from "fs";
import sharp from "sharp";

const KEY = process.argv[2];
const MATCH = process.argv[3];
if (!KEY || !MATCH) { console.error("usage: finalize-range.mjs <NORMKEY> <matchJson>"); process.exit(1); }
const PACK = `.refwork/packets/${KEY}`;
const RAW = `${PACK}/raw`;
const PUB = "public/images/tileone";
const ROOMS = `${PUB}/rooms`;
fs.mkdirSync(ROOMS, { recursive: true });

const packet = JSON.parse(fs.readFileSync(`${PACK}/packet.json`, "utf8"));
const match = JSON.parse(fs.readFileSync(MATCH, "utf8"));
const rawPath = (id) => { const im = packet.images.find((x) => x.id === String(id)); return im ? `${RAW}/${id}.${im.ext}` : null; };

const CANVAS = 1200, BOX = Math.round(CANVAS * 0.57);
async function reframe(id) {
  const p = rawPath(id); if (!p || !fs.existsSync(p)) return false;
  const resized = await sharp(p).resize(BOX, BOX, { fit: "inside" }).toBuffer();
  const m = await sharp(resized).metadata();
  const left = Math.round((CANVAS - m.width) / 2), top = Math.round((CANVAS - m.height) / 2);
  await sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" } })
    .composite([{ input: resized, left, top }]).webp({ quality: 90 }).toFile(`${PUB}/${id}.webp`);
  return true;
}
async function room(id) {
  const p = rawPath(id); if (!p || !fs.existsSync(p)) return false;
  await sharp(p).resize(1400, 1400, { fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toFile(`${ROOMS}/${id}.webp`);
  return true;
}

const faces = new Set(), rooms = new Set();
for (const c of Object.values(match.colours || {})) {
  if (c.faceImgId) faces.add(String(c.faceImgId));
  if (c.roomImgId) rooms.add(String(c.roomImgId));
}
let f = 0, r = 0, miss = [];
for (const id of faces) (await reframe(id)) ? f++ : miss.push(`face:${id}`);
for (const id of rooms) (await room(id)) ? r++ : miss.push(`room:${id}`);
console.log(`[${KEY}] reframed ${f} faces, ${r} rooms` + (miss.length ? `  MISSING: ${miss.join(",")}` : ""));
