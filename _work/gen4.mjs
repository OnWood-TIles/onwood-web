import { GoogleGenAI } from "@google/genai";
import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const ai = new GoogleGenAI({ apiKey: KEY });

// Built exactly like the winning Valencia Blue render: an all-pattern field where
// FOUR tiles pivot to form each medallion is fed to Gemini as the floor reference.
const floor = (palette) =>
  " The FLOOR is paved with SMALL 150x150mm (hand-span) decorative encaustic-look porcelain floor tiles that form a dense, repeating medallion pattern EXACTLY like the attached reference image, where FOUR tiles pivot at a shared corner to form each symmetric floral medallion. There must be MANY small tiles with clear, fine light-grey grout lines between every single tile, so the medallion pattern repeats many times across the floor in correct perspective. Reproduce " + palette + " of the reference faithfully." +
  " CRITICAL: the tiles are SMALL - do NOT render large-format tiles. Each tile is only about 150mm, so the floor must show a fine, frequent grid of grout lines and the medallion motif repeating densely, not a few big tiles." +
  " Natural, editorial, magazine-quality real-estate photograph, warm and inviting, no people, no text.";

const JOBS = [
  { name: "valencia-verde", ref: "_work/vfield-valencia-verde.png",
    scene: "A photorealistic architectural photograph of a light-filled French garden orangery / conservatory entrance, viewed at a natural three-quarter angle: tall arched steel-framed windows onto a garden, pale-stone and whitewashed walls, potted citrus trees, ferns and olive, a weathered timber console with botanical prints, soft diffused morning light and lush greenery.",
    palette: "the soft sage-green, cream and warm-grey palette" },
  { name: "venetian", ref: "_work/vfield-venetian.png",
    scene: "A photorealistic architectural photograph of an elegant Venetian / Italian palazzo entrance hall, viewed at a natural three-quarter angle: soft warm-greige Venetian-plaster walls, a tall arched window with timber shutters and a wrought-iron rail, a slim marble console with a vase of hydrangeas and an antique gilt mirror, refined diffused light, understated old-world luxury.",
    palette: "the soft grey, warm-greige and cream damask palette" },
];

for (const j of JOBS) {
  const ref = fs.readFileSync(j.ref).toString("base64");
  const resp = await ai.models.generateContent({
    model: "gemini-3.1-flash-image",
    contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/png", data: ref } }, { text: j.scene + floor(j.palette) }] }],
  });
  const out = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!out?.inlineData?.data) { console.error(j.name, "no image"); continue; }
  fs.writeFileSync(`_work/room-${j.name}.png`, Buffer.from(out.inlineData.data, "base64"));
  console.log("saved _work/room-" + j.name + ".png");
}
