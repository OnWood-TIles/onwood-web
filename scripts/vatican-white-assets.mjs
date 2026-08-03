// Build the missing "Alabaster" (supplier White) VEIN CUT faces for Colonnade 36 + 612,
// plus a room shot, from Reagan's genuine Vatican pack (VN6000V = White Vein Cut).
// House style: 1:2 portrait tile centred on a 1200x1200 white canvas.
//   36  tile 342x684   |   612 tile 440x880   (matches existing Novona/Silver faces exactly)
// Veins run vertically, so a centred 1:2 crop keeps continuous vertical veining.
//   node scripts/vatican-white-assets.mjs
import sharp from "sharp";
import path from "path";

const REF = ".refwork/vatican/VN6000V";
const OUT = "public/images/tileone";
const SRC = path.join(REF, "VN6000V_01.jpg");            // clean 1500x1500 White vein-cut face
const LIFE = path.join(REF, "VN6000V lifestyle image.jpg"); // 5906x4430 genuine White vein-cut room

const CANVAS = { width: 1200, height: 1200, channels: 4, background: "#ffffff" };
const centre = (tile, w, h) => sharp({ create: CANVAS })
  .composite([{ input: tile, gravity: "centre" }])
  .webp({ quality: 90 });

async function face(w, h, outName) {
  // cover-crop the square source to a centred 1:2 strip, scaled to the target tile size
  const tile = await sharp(SRC).resize(w, h, { fit: "cover", position: "centre" }).toBuffer();
  await centre(tile, w, h).toFile(path.join(OUT, outName));
  console.log(`  ✔ ${outName}  (tile ${w}x${h} on 1200x1200 white)`);
}

async function main() {
  console.log("Building Alabaster (White) Vein Cut assets from VN6000V:");
  await face(342, 684, "vatican-white-veincut-36.webp");
  await face(440, 880, "vatican-white-veincut-612.webp");
  await sharp(LIFE).resize(1600, null, { withoutEnlargement: true }).webp({ quality: 82 })
    .toFile(path.join(OUT, "vatican-white-veincut-room.webp"));
  console.log("  ✔ vatican-white-veincut-room.webp  (genuine lifestyle, 1600w)");
}
main().catch((e) => { console.error("ERR", e); process.exitCode = 1; });
