import { GoogleGenAI } from "@google/genai";
import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });
const ref = fs.readFileSync("_work/field-seville.png").toString("base64");
const prompt =
  "A photorealistic photograph of a sun-drenched Andalusian Spanish courtyard, viewed at natural EYE-LEVEL from a three-quarter angle, looking across the patio toward a whitewashed keyhole archway with a rustic timber gate. A weathered-stone wellhead to one side, terracotta pots of orange trees, red geraniums and blue-glazed accent pots, a wrought-iron wall lantern and a rustic timber bench, bright warm Spanish afternoon light casting crisp shadows across the floor." +
  " The FLOOR is small 150x150mm (hand-span) encaustic-look porcelain tiles laid EXACTLY like the attached reference: a central patterned floral 'rug' framed by a border of plain warm-cream tiles, with MANY small tiles and clear fine grout lines between every tile, the delicate blue-grey floral medallions repeating across the floor in correct perspective as it recedes. Reproduce the reference palette and the way four tiles pivot at a shared corner to form each soft floral medallion." +
  " CRITICAL: the tiles are SMALL 150mm with frequent grout lines - do NOT render large-format tiles, and do NOT shoot straight-down; keep a natural eye-level perspective. Editorial, warm, inviting, no people, no text.";
const resp = await ai.models.generateContent({ model: "gemini-3.1-flash-image", contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: prompt }] }] });
const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!out?.inlineData?.data) { console.error("no image"); process.exit(1); }
fs.writeFileSync("_work/room-seville.png", Buffer.from(out.inlineData.data, "base64"));
console.log("saved _work/room-seville.png");
