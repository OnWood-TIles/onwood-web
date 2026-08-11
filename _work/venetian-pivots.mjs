import sharp from "sharp";
const url = "https://onwoodtiles.com.au/images/tileone/GLOANQVENET15M.webp?v=3";
const face = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer()))
  .trim({ background: "#ffffff", threshold: 22 }).toBuffer();

const T = 150, N = 4; // 4x4 field per scheme
const SCHEMES = {
  "A_focalBL(blue)": [270, 0, 180, 90],
  "B_focalTL":       [180, 270, 90, 0],
  "C_focalTR":       [90, 180, 0, 270],
  "D_focalBR":       [0, 90, 270, 180],
};
const cell = async (deg) => await sharp(face).resize(T, T, { fit: "fill" }).rotate(deg).toBuffer();

async function field([tl, tr, bl, br]) {
  const rot = (r, c) => (r % 2 === 0 ? (c % 2 === 0 ? tl : tr) : (c % 2 === 0 ? bl : br));
  const comp = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) comp.push({ input: await cell(rot(r, c)), left: c * T, top: r * T });
  return await sharp({ create: { width: N * T, height: N * T, channels: 3, background: "#fff" } }).composite(comp).png().toBuffer();
}

const names = Object.keys(SCHEMES);
const panels = [];
for (const n of names) panels.push(await field(SCHEMES[n]));
const P = N * T;
await sharp({ create: { width: 2 * P + 30, height: 2 * P + 30, channels: 3, background: "#d9d3c8" } })
  .composite([
    { input: panels[0], left: 10, top: 10 }, { input: panels[1], left: P + 20, top: 10 },
    { input: panels[2], left: 10, top: P + 20 }, { input: panels[3], left: P + 20, top: P + 20 },
  ]).png().toFile("_work/venetian-pivots.png");
console.log("grid: TL=" + names[0] + "  TR=" + names[1] + "  BL=" + names[2] + "  BR=" + names[3]);
