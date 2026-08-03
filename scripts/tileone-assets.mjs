// Download a range's full-size website images and classify: square (>=700px) =
// flat tile FACE; landscape = room/lifestyle shot. Saves to faces/ and rooms/.
// Run: node scripts/tileone-assets.mjs <productId> <outdir>
import fs from "fs";
import path from "path";
import sharp from "sharp";

const id = process.argv[2] || "97";
const POC = process.argv[3] || ".refwork/tileone-antiquity";
const UA = { "User-Agent": "Mozilla/5.0" };
fs.mkdirSync(`${POC}/faces`, { recursive: true });
fs.mkdirSync(`${POC}/rooms`, { recursive: true });

const html = await (await fetch(`https://www.tileone.com.au/product/showproduct.php?id=${id}&lang=en`, { headers: UA })).text();
const urls = [...new Set([...html.matchAll(/upload\/20[0-9]{4}\/[0-9]+\.(?:jpg|jpeg|png)/gi)].map((m) => m[0]))];

const faces = [], rooms = [];
for (const u of urls) {
  try {
    const buf = Buffer.from(await (await fetch(`https://www.tileone.com.au/${u}`, { headers: UA })).arrayBuffer());
    const m = await sharp(buf).metadata();
    const ar = m.width / m.height;
    if (Math.max(m.width, m.height) < 700) continue; // skip icons/thumbs
    const name = path.basename(u);
    if (ar > 0.85 && ar < 1.18) { fs.writeFileSync(`${POC}/faces/${name}`, buf); faces.push(`${name} ${m.width}x${m.height}`); }
    else if (ar > 1.4) { fs.writeFileSync(`${POC}/rooms/${name}`, buf); rooms.push(`${name} ${m.width}x${m.height}`); }
  } catch (e) { /* skip */ }
}
console.log(`FACES (${faces.length}):`, faces.join("  |  "));
console.log(`ROOMS (${rooms.length}):`, rooms.join("  |  "));
