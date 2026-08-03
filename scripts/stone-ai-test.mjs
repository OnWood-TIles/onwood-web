// TEST: run Caesarstone benchtop images through Gemini to sharpen/enhance them
// while KEEPING the exact colour/veining/texture. Saves to .refwork/stone-ai/ so
// we can compare against the originals before committing.
// Run: GEMINI_API_KEY=... node scripts/stone-ai-test.mjs
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY missing"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY });
const MODEL = "gemini-3.1-flash-image";
const root = process.cwd();
const outDir = path.join(root, ".refwork/stone-ai");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// 3 diverse test stones (concrete, veined marble, bold Calacatta).
const TESTS = [
  { code: "4044", name: "Airy Concrete" },
  { code: "5171", name: "Arabetto" },
  { code: "5105", name: "Calacatta Dreamwave" },
];

const prompt = (name) =>
  `The attached image is a photograph of a real ${name} engineered-stone (quartz) benchtop slab surface. Reproduce the SAME slab surface as a flawless, ultra-sharp, high-resolution photorealistic FLAT top-down view. CRITICAL: keep the EXACT same colours, veining, marbling, pattern, movement, speckles and texture as the attached image - do NOT invent, add, remove or reposition any veins or marks, and do not change the design, colours or contrast in any way. Only clean it up: sharpen fine detail, even out the lighting, and remove any blur, softness, noise or compression artefacts. Fill the ENTIRE frame edge to edge with the continuous polished stone surface - a seamless benchtop, no slab edges, no join lines, no objects, no room, no reflections, no background, no text.`;

async function one(code, name, suffix) {
  const file = path.join(root, `public/images/stone/${code}${suffix}.webp`);
  const data = fs.readFileSync(file).toString("base64");
  try {
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/webp", data } }, { text: prompt(name) }] }],
    });
    const part = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) return console.log(`x ${code}${suffix} (no image)`);
    const out = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync(path.join(outDir, `${code}${suffix}.jpg`), out);
    console.log(`. ${code}${suffix} (${out.length} bytes)`);
  } catch (e) {
    console.log(`x ${code}${suffix}: ${e.message}`);
  }
}

for (const t of TESTS) {
  await Promise.all([one(t.code, t.name, ""), one(t.code, t.name, "-p")]);
}
console.log("done -> .refwork/stone-ai/");
