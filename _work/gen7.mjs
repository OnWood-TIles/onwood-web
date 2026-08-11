import { GoogleGenAI } from "@google/genai";
import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });

// Reuse the EXACT Valencia Blue courtyard formula (flat outdoor ground plane, no
// wide-angle interior bowing) with the correctly-pivoted Venetian medallion field.
const ref = fs.readFileSync("_work/vfield-venetian-B.png").toString("base64");
const prompt = [
  "A photorealistic architectural photograph of an elegant Italian / Venetian COURTYARD entrance, viewed at a natural three-quarter angle looking toward a rounded stone archway with a rustic timber gate.",
  "Warm-limestone and pale-stucco walls, a weathered stone bench and a small tiered stone fountain to one side, terracotta and stone pots of olive, cypress and citrus, climbing greenery overhead, soft late-afternoon sunlight casting gentle warm shadows across the ground.",
  "The COURTYARD FLOOR is paved with SMALL 150x150mm (hand-span) decorative encaustic-look porcelain floor tiles that form a dense, repeating medallion pattern EXACTLY like the attached reference image, where FOUR tiles pivot at a shared corner to form each symmetric medallion. There must be MANY small tiles with clear, fine light-grey grout lines between every single tile, so the pattern repeats many times across the floor in correct perspective. Reproduce the soft grey, sage-green and pale duck-egg blue palette of the reference faithfully.",
  "CRITICAL: the floor must be perfectly FLAT and LEVEL with straight, even grout lines and NO curvature, bowing or fisheye distortion. The tiles are SMALL - do NOT render large-format tiles; each tile is only about 150mm, so the floor should show a fine, frequent grid of grout lines and the medallion motif repeating densely, not a few big tiles.",
  "Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.",
].join(" ");

const resp = await ai.models.generateContent({ model: "gemini-3.1-flash-image", contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: prompt }] }] });
const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!out?.inlineData?.data) { console.error("no image"); process.exit(1); }
fs.writeFileSync("_work/room-venetian-B.png", Buffer.from(out.inlineData.data, "base64"));
console.log("saved _work/room-venetian-B.png (flat courtyard)");
