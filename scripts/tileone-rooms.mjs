// Host Antiquity's room shots by SOURCE id so one photo can serve several
// colourways (a mixed wall showing a plain colour + its matching feature tile).
// Optimised webp. node scripts/tileone-rooms.mjs
import fs from "fs";
import sharp from "sharp";
const UA = { "User-Agent": "Mozilla/5.0" };
const OUT = "public/images/tileone/rooms";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// unique room shots we're using (id -> source path). Mixed-wall shots included:
// they legitimately show a plain colour alongside its patterned feature version.
const ROOMS = {
  "1726013254": "upload/202409/1726013254.jpg", // E: blue banded bathroom  -> Blue
  "1726013212": "upload/202409/1726013212.jpg", // A: grey plain + grey pattern -> Ice + Venetian
  "1726013485": "upload/202409/1726013485.jpg", // D: warm cream pantry -> Opal + Almond
  "1726013353": "upload/202409/1726013353.jpg", // B: grey/blue pattern vanity -> Seville
  "1726013233": "upload/202409/1726013233.jpg", // C: blue plain + blue pattern -> Valencia Blue
};
for (const [id, src] of Object.entries(ROOMS)) {
  const buf = Buffer.from(await fetch(`https://www.tileone.com.au/${src}`, { headers: UA }).then((r) => r.arrayBuffer()));
  await sharp(buf).resize(1400, 1400, { fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toFile(`${OUT}/${id}.webp`);
  console.log(`hosted room ${id}`);
}
console.log(`done -> ${OUT}`);
