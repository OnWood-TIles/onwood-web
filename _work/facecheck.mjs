import sharp from "sharp";
const FACES = {
  "Valencia Blue": "https://onwoodtiles.com.au/images/tileone/GLOANQVALENB15M.webp?v=3",
  "Valencia Verde": "https://onwoodtiles.com.au/images/tileone/GLOANQVALENV15M.webp?v=3",
  "Venetian": "https://onwoodtiles.com.au/images/tileone/GLOANQVENET15M.webp?v=3",
};
const names = Object.keys(FACES);
const bufs = [];
for (const n of names) {
  const r = await fetch(FACES[n]);
  const b = Buffer.from(await r.arrayBuffer());
  bufs.push(await sharp(b).trim({ background: "#ffffff", threshold: 22 }).resize(360, 360, { fit: "fill" }).toBuffer());
}
await sharp({ create: { width: 360 * 3 + 40, height: 380, channels: 3, background: "#ffffff" } })
  .composite(bufs.map((b, i) => ({ input: b, left: 10 + i * 370, top: 10 })))
  .png().toFile("_work/facecheck.png");
console.log("built _work/facecheck.png  (", names.join(" | "), ")");
