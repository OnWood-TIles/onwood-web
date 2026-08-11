import sharp from "sharp";
const jobs = [
  ["_work/room-valencia-verde.png", "public/images/tileone/antico-valencia-verde-room.webp"],
  ["_work/room-venetian.png", "public/images/tileone/antico-venetian-room.webp"],
];
for (const [src, dst] of jobs) {
  await sharp(src).webp({ quality: 82 }).toFile(dst);
  console.log("wrote", dst);
}
