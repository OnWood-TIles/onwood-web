import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });

const SCHEME_B = [180, 270, 90, 0]; // focalTL — centres the larger motif corner
const T = 256, N = 8;
async function buildField(url, out) {
  const face = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer()))
    .trim({ background: "#ffffff", threshold: 22 }).toBuffer();
  const rot = (r, c) => (r % 2 === 0 ? (c % 2 === 0 ? SCHEME_B[0] : SCHEME_B[1]) : (c % 2 === 0 ? SCHEME_B[2] : SCHEME_B[3]));
  const comp = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
    comp.push({ input: await sharp(face).resize(T, T, { fit: "fill" }).rotate(rot(r, c)).toBuffer(), left: c * T, top: r * T });
  await sharp({ create: { width: N * T, height: N * T, channels: 3, background: "#fff" } }).composite(comp).png().toFile(out);
  console.log("built", out);
}
const floor = (palette) =>
  " The FLOOR is paved with SMALL 150x150mm decorative encaustic-look porcelain floor tiles laid EXACTLY like the attached reference image, where FOUR tiles pivot at a shared corner to form each large symmetric flower medallion. There must be MANY small tiles with clear, fine light-grey grout lines between every tile, so the medallion pattern repeats densely across the floor in correct perspective. Reproduce " + palette + " faithfully." +
  " CRITICAL: the tiles are SMALL 150mm - do NOT render large-format; show a fine, frequent grout grid. Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.";

const JOBS = [
  { url: "https://onwoodtiles.com.au/images/tileone/GLOANQVALENV15M.webp?v=3",
    field: "_work/vfield-valencia-verde-B.png", out: "_work/room-valencia-verde-B.png",
    scene: "A photorealistic architectural photograph of a light-filled French garden orangery / conservatory entrance, viewed at a natural three-quarter angle: tall arched steel-framed windows onto a garden, pale-stone and whitewashed walls, potted citrus trees, ferns and olive, a weathered timber console with botanical prints, soft diffused morning light and lush greenery.",
    palette: "the sage-green, soft duck-egg blue, cream and warm-grey palette" },
  { url: "https://onwoodtiles.com.au/images/tileone/GLOANQVENET15M.webp?v=3",
    field: "_work/vfield-venetian-B.png", out: "_work/room-venetian-B.png",
    scene: "A photorealistic architectural photograph of an elegant Venetian / Italian palazzo entry vestibule, viewed at a natural three-quarter angle with the tiled floor prominent in the foreground: soft warm-greige Venetian-plaster walls, a tall arched shuttered window with a wrought-iron rail, a slim marble console with a gilt mirror and hydrangeas, warm directional light.",
    palette: "the soft grey, sage-green and pale duck-egg blue palette" },
];
for (const j of JOBS) {
  await buildField(j.url, j.field);
  const ref = fs.readFileSync(j.field).toString("base64");
  const resp = await ai.models.generateContent({ model: "gemini-3.1-flash-image", contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: j.scene + floor(j.palette) }] }] });
  const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!out?.inlineData?.data) { console.error(j.out, "no image"); continue; }
  fs.writeFileSync(j.out, Buffer.from(out.inlineData.data, "base64"));
  console.log("saved", j.out);
}
