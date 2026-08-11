import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });

const url = "https://onwoodtiles.com.au/images/tileone/GLOANQVENET15M.webp?v=3";
const face = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer()))
  .trim({ background: "#ffffff", threshold: 22 }).toBuffer();

// ---- STEP 1: single tile ----
const S = 420;
await sharp(face).resize(S, S, { fit: "fill" }).png().toFile("_work/venetian-single.png");

// ---- STEP 2: pivot the CORRECT corner (scheme B, focalTL) -> one 4-tile medallion ----
// 2x2 rotations: TL=180 TR=270 BL=90 BR=0  (brings the focal corner to the centre)
const T = 512;
const cell = async (deg) => await sharp(face).resize(T, T, { fit: "fill" }).rotate(deg).toBuffer();
await sharp({ create: { width: 2 * T, height: 2 * T, channels: 3, background: "#fff" } })
  .composite([
    { input: await cell(180), left: 0, top: 0 }, { input: await cell(270), left: T, top: 0 },
    { input: await cell(90), left: 0, top: T }, { input: await cell(0), left: T, top: T },
  ]).png().toFile("_work/venetian-floral.png");

// demo montage: single tile  ->  4 tiles pivoted
const one = await sharp("_work/venetian-single.png").resize(400, 400, { fit: "fill" }).toBuffer();
const four = await sharp("_work/venetian-floral.png").resize(400, 400, { fit: "fill" }).toBuffer();
await sharp({ create: { width: 400 * 2 + 30, height: 420, channels: 3, background: "#efece6" } })
  .composite([{ input: one, left: 10, top: 10 }, { input: four, left: 420, top: 10 }])
  .png().toFile("_work/venetian-pivot-demo.png");

// ---- STEP 3: tile the medallion into an 8x8 field (reference for Gemini) ----
const N = 8, TT = 256;
const rot = (r, c) => (r % 2 === 0 ? (c % 2 === 0 ? 180 : 270) : (c % 2 === 0 ? 90 : 0));
const comp = [];
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++)
  comp.push({ input: await sharp(face).resize(TT, TT, { fit: "fill" }).rotate(rot(r, c)).toBuffer(), left: c * TT, top: r * TT });
await sharp({ create: { width: N * TT, height: N * TT, channels: 3, background: "#fff" } }).composite(comp).png().toFile("_work/venetian-field.png");
console.log("built single / floral / pivot-demo / field");

// ---- STEP 4: installed visual, exact Valencia Blue flat-courtyard formula ----
const ref = fs.readFileSync("_work/venetian-field.png").toString("base64");
const prompt = [
  "A photorealistic architectural photograph of an elegant Italian courtyard entrance, viewed at a natural three-quarter angle looking toward a rounded stone archway with a rustic timber gate.",
  "Warm-limestone and pale-stucco walls, a weathered stone bench and a small tiered stone fountain to one side, terracotta pots of olive, cypress and citrus, climbing greenery overhead, soft late-afternoon sunlight casting gentle warm shadows across the ground.",
  "The COURTYARD FLOOR is paved with SMALL 150x150mm (hand-span) decorative encaustic-look porcelain floor tiles that form a dense, repeating medallion pattern EXACTLY like the attached reference image, where FOUR tiles pivot at a shared corner to form each symmetric medallion. There must be MANY small tiles with clear, fine light-grey grout lines between every single tile, so the pattern repeats many times across the floor in correct perspective. Reproduce the soft grey, sage-green and pale duck-egg blue palette of the reference faithfully.",
  "CRITICAL: the floor must be perfectly FLAT and LEVEL with straight grout lines and NO curvature or fisheye. The tiles are SMALL - each only about 150mm - so the floor should show a fine, frequent grid of grout lines and the medallion motif repeating densely, NOT a few big tiles.",
  "Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.",
].join(" ");
const resp = await ai.models.generateContent({ model: "gemini-3.1-flash-image", contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: prompt }] }] });
const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!out?.inlineData?.data) { console.error("no image"); process.exit(1); }
fs.writeFileSync("_work/room-venetian-final.png", Buffer.from(out.inlineData.data, "base64"));
console.log("saved _work/room-venetian-final.png");
