import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ref = fs.readFileSync("_work/valencia-field.png").toString("base64");

const prompt = [
  "A photorealistic architectural photograph of a sun-drenched Mediterranean villa COURTYARD entrance, viewed at a natural three-quarter angle looking toward a rounded stucco archway with a rustic timber gate.",
  "Whitewashed and warm-limestone walls, a weathered timber bench and a small tiered stone fountain to one side, terracotta pots of olive, lavender and citrus, climbing bougainvillea overhead, dappled late-afternoon sunlight through a timber pergola casting soft warm shadows across the ground.",
  "The COURTYARD FLOOR is paved with SMALL 150x150mm (hand-span) decorative encaustic-look porcelain floor tiles that form a dense, repeating floral medallion pattern EXACTLY like the attached reference image. There must be MANY small tiles with clear, fine light-grey grout lines between every single tile, so the floral pattern repeats many times across the floor in correct perspective. Reproduce the soft duck-egg blue, cream and warm-grey palette of the reference faithfully.",
  "CRITICAL: the tiles are SMALL - do NOT render large-format tiles. Each tile is only about 150mm, so the floor should show a fine, frequent grid of grout lines and the floral motif repeating densely, not a few big tiles.",
  "Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.",
].join(" ");

const ai = new GoogleGenAI({ apiKey: KEY });
const resp = await ai.models.generateContent({
  model: "gemini-3.1-flash-image",
  contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: prompt }] }],
});
const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!out?.inlineData?.data) { console.error("no image:", JSON.stringify(resp).slice(0, 600)); process.exit(1); }
fs.writeFileSync("_work/valencia-courtyard.png", Buffer.from(out.inlineData.data, "base64"));
console.log("saved _work/valencia-courtyard.png");
