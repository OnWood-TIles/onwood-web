import { GoogleGenAI } from "@google/genai";
import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });

const ref = fs.readFileSync("_work/venetian-field.png").toString("base64");
const prompt = [
  "A photorealistic architectural photograph of an elegant Italian courtyard entrance, photographed from a standing adult EYE-LEVEL (about 1.5 metres high) looking horizontally ACROSS the courtyard toward a rounded stone archway with a rustic timber gate in the distance.",
  "Warm-limestone and pale-stucco walls, a weathered stone bench and a small tiered stone fountain to one side, terracotta pots of olive, cypress and citrus, climbing greenery, soft late-afternoon sunlight casting gentle warm shadows across the ground.",
  "The COURTYARD FLOOR is paved with SMALL 150x150mm (hand-span) decorative encaustic-look porcelain floor tiles that form a dense, repeating medallion pattern EXACTLY like the attached reference image, where FOUR tiles pivot at a shared corner to form each symmetric medallion. There must be MANY small tiles with clear, fine light-grey grout lines between every single tile. Reproduce the soft grey, sage-green and pale duck-egg blue palette of the reference faithfully.",
  "CRITICAL PERSPECTIVE: use ONE single, consistent vanishing-point perspective. The floor is a single perfectly FLAT, LEVEL ground plane that recedes smoothly and evenly into the distance. EVERY tile lies flat on that ground plane at the SAME grazing angle - NONE of the tiles tilt or fan up to face the camera, and there is absolutely NO warped, stretched or top-down foreground row of tiles along the bottom edge of the frame. No fisheye, no curvature, no distortion. The nearest tiles are seen at a shallow, natural floor angle, never from directly above.",
  "The tiles are SMALL - each only about 150mm - so the floor shows a fine, frequent grid of grout lines and the medallion motif repeating densely, NOT a few big tiles.",
  "Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.",
].join(" ");

const resp = await ai.models.generateContent({ model: "gemini-3.1-flash-image", contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: prompt }] }] });
const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!out?.inlineData?.data) { console.error("no image"); process.exit(1); }
fs.writeFileSync("_work/room-venetian-final.png", Buffer.from(out.inlineData.data, "base64"));
console.log("saved _work/room-venetian-final.png");
