// Full run: enhance EVERY Caesarstone benchtop image (landscape + portrait) with
// Gemini - sharper/higher-res while keeping the exact colour/veining/texture.
// Resumable: skips outputs that already exist, so re-running fills any failures.
// Run: GEMINI_API_KEY=... node scripts/stone-ai-gen.mjs
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY missing"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY });
const MODEL = "gemini-3.1-flash-image";
const CONCURRENCY = 6;
const root = process.cwd();
const outDir = path.join(root, ".refwork/stone-ai");
fs.mkdirSync(outDir, { recursive: true }); // do NOT wipe - resume + keep the 3 test stones
const stone = JSON.parse(fs.readFileSync(path.join(root, "public/data/stone.json"), "utf8"));

const prompt = (name) =>
  `The attached image is a photograph of a real ${name} engineered-stone (quartz) benchtop slab surface. Reproduce the SAME slab surface as a flawless, ultra-sharp, high-resolution photorealistic FLAT top-down view. CRITICAL: keep the EXACT same colours, veining, marbling, pattern, movement, speckles and texture as the attached image - do NOT invent, add, remove or reposition any veins or marks, and do not change the design, colours or contrast in any way. Only clean it up: sharpen fine detail, even out the lighting, and remove any blur, softness, noise or compression artefacts. Fill the ENTIRE frame edge to edge with the continuous polished stone surface - a seamless benchtop, no slab edges, no join lines, no objects, no room, no reflections, no background, no text.`;

async function one(code, name, suffix) {
  const outPath = path.join(outDir, `${code}${suffix}.jpg`);
  if (fs.existsSync(outPath)) return; // already done (resume)
  const file = path.join(root, `public/images/stone/${code}${suffix}.webp`);
  if (!fs.existsSync(file)) { console.log(`\nx ${code}${suffix} (no source)`); return; }
  const data = fs.readFileSync(file).toString("base64");
  try {
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/webp", data } }, { text: prompt(name) }] }],
    });
    const part = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) { console.log(`\nx ${code}${suffix} (no image)`); return; }
    fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
    process.stdout.write(".");
  } catch (e) {
    console.log(`\nx ${code}${suffix}: ${e.message}`);
  }
}

const tasks = [];
for (const s of stone) {
  tasks.push(() => one(s.code, s.name, ""));
  tasks.push(() => one(s.code, s.name, "-p"));
}
for (let i = 0; i < tasks.length; i += CONCURRENCY) {
  await Promise.all(tasks.slice(i, i + CONCURRENCY).map((t) => t()));
}
const done = fs.readdirSync(outDir).filter((f) => f.endsWith(".jpg")).length;
console.log(`\ndone: ${done}/${stone.length * 2} images in .refwork/stone-ai/`);
