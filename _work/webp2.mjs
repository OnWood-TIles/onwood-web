import sharp from "sharp";
const jobs = [
  ["_work/room-valencia-verde.png", "public/images/tileone/antico-valencia-verde-room.webp"], // overwrite (approved)
  ["_work/room-seville.png", "public/images/tileone/antico-seville-room.webp"],               // original flat-lay (approved)
];
for (const [src, dst] of jobs) {
  await sharp(src).webp({ quality: 82 }).toFile(dst);
  console.log("wrote", dst);
}
