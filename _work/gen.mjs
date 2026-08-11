import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
if (!KEY) { console.error("no GEMINI_API_KEY"); process.exit(1); }

const ref = fs.readFileSync("_work/valencia-floral.png").toString("base64");

const prompt = [
  "A photorealistic architectural photograph of the EXTERNAL FRONT ENTRANCE of a Mediterranean-style home on the Sunshine Coast, Australia.",
  "Warm off-white rendered/stucco walls, an arched timber front door, terracotta or clay accents, large potted olive and greenery, a hint of blue sky, soft warm natural daylight with realistic long shadows.",
  "The ENTRY PORCH FLOOR is fully tiled with the EXACT decorative encaustic-look tile in the attached reference image: reproduce its soft duck-egg blue, cream and warm-grey palette and its ornamental pattern faithfully, where FOUR tiles rotate to form a symmetric FLORAL medallion. Tile it seamlessly, repeating edge-to-edge across the whole entry floor in correct perspective, with fine light-grey grout lines. 300x300mm matt porcelain floor tiles.",
  "Do NOT invent a different tile - the floor pattern must match the reference exactly. Straight-on, slightly elevated eye-level angle that shows the patterned floor prominently in the foreground. Editorial, magazine-quality, natural, no people, no text.",
].join(" ");

const ai = new GoogleGenAI({ apiKey: KEY });
const resp = await ai.models.generateContent({
  model: "gemini-3.1-flash-image",
  contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: prompt }] }],
});
const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!out?.inlineData?.data) {
  console.error("No image in response:", JSON.stringify(resp).slice(0, 600));
  process.exit(1);
}
fs.writeFileSync("_work/valencia-entry.png", Buffer.from(out.inlineData.data, "base64"));
console.log("saved _work/valencia-entry.png");
