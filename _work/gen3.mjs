import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });

const COMMON =
  " The FLOOR is small 150x150mm (hand-span) encaustic-look porcelain tiles laid EXACTLY like the attached reference: a central patterned floral 'rug' framed by a border of plain tiles. There must be MANY small tiles with clear fine grout lines between every tile, the four-tile floral medallions repeating in correct perspective. Reproduce the reference's exact palette and the way four tiles pivot at a shared corner to form each floral. CRITICAL: the tiles are SMALL 150mm - do NOT render large-format tiles. Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.";

const JOBS = [
  { name: "seville", ref: "_work/field-seville.png",
    scene: "A photorealistic photograph of a sun-drenched Andalusian / Spanish courtyard patio: whitewashed walls, a central weathered-stone well and low fountain, terracotta pots of orange trees and red geraniums, blue-glazed pot accents, a wrought-iron lantern, bright Spanish midday light with crisp shadows." },
  { name: "valencia-verde", ref: "_work/field-valencia-verde.png",
    scene: "A photorealistic photograph of a light-filled French garden orangery / conservatory entrance: tall arched steel-framed windows, pale-stone and whitewashed walls, potted citrus trees, ferns and olive, a rattan chair, a weathered timber console, soft diffused morning light and lush greenery." },
  { name: "venetian", ref: "_work/field-venetian.png",
    scene: "A photorealistic photograph of an elegant Venetian / Italian palazzo entrance hall: soft warm-greige Venetian-plaster walls, a tall arched window with timber shutters, a slim marble console with a vase of hydrangeas, an antique gilt mirror, refined diffused light, understated old-world luxury." },
];

for (const j of JOBS) {
  const ref = fs.readFileSync(j.ref).toString("base64");
  const resp = await ai.models.generateContent({
    model: "gemini-3.1-flash-image",
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: j.scene + COMMON }] }],
  });
  const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!out?.inlineData?.data) { console.error(j.name, "no image"); continue; }
  fs.writeFileSync(`_work/room-${j.name}.png`, Buffer.from(out.inlineData.data, "base64"));
  console.log("saved _work/room-" + j.name + ".png");
}
