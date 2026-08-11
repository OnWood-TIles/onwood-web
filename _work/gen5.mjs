import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });

// Venetian is a soft all-over grey DAMASK (no central medallion), so a 4-way pivot
// looks chaotic. Lay it as a REGULAR STRAIGHT GRID (all tiles identical) for structure.
const url = "https://onwoodtiles.com.au/images/tileone/GLOANQVENET15M.webp?v=3";
const T = 256, N = 8;
const face = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer()))
  .trim({ background: "#ffffff", threshold: 22 }).resize(T, T, { fit: "fill" }).toBuffer();
const comp = [];
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) comp.push({ input: face, left: c * T, top: r * T });
await sharp({ create: { width: N * T, height: N * T, channels: 3, background: "#ffffff" } })
  .composite(comp).png().toFile("_work/vfield-venetian-straight.png");
console.log("built straight field");

const ref = fs.readFileSync("_work/vfield-venetian-straight.png").toString("base64");
const prompt =
  "A photorealistic architectural photograph of an elegant Venetian / Italian palazzo entry vestibule, composed low and looking across the floor so the TILED FLOOR fills the foreground and the lower two-thirds of the frame. Soft warm-greige Venetian-plaster walls, a tall arched shuttered window with a wrought-iron rail, a slim marble console with an antique gilt mirror and a vase of hydrangeas to one side, warm directional late-afternoon light raking low across the floor." +
  " The FLOOR is paved with SMALL 150x150mm decorative encaustic-look porcelain floor tiles laid in a REGULAR STRAIGHT GRID exactly like the attached reference image: reproduce the soft grey and warm-greige damask / scrollwork motif faithfully, EVERY tile identical and aligned, with clear crisp light-grey grout lines forming an even, well-ordered grid. The pattern must read CRISPLY and with clear contrast - well-defined and structured, NOT washed out, blurry or faded - repeating densely across the whole floor in correct perspective." +
  " CRITICAL: the tiles are SMALL 150mm, do NOT render large-format; show a fine, frequent grout grid. Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.";
const resp = await ai.models.generateContent({ model: "gemini-3.1-flash-image", contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: prompt }] }] });
const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!out?.inlineData?.data) { console.error("no image"); process.exit(1); }
fs.writeFileSync("_work/room-venetian.png", Buffer.from(out.inlineData.data, "base64"));
console.log("saved _work/room-venetian.png");
