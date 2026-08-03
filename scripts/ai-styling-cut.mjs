// AI STYLING - phase 2 (background removal). Cuts the white background off each
// Gemini image -> transparent PNG. @imgly only (no sharp - they crash together).
// Run: node scripts/ai-styling-cut.mjs
import fs from "fs";
import path from "path";
import { pathToFileURL } from "node:url";
import { removeBackground } from "@imgly/background-removal-node";

const root = process.cwd();
const genDir = path.join(root, ".refwork/ai-gen");
const cutDir = path.join(root, ".refwork/ai-cut");
fs.rmSync(cutDir, { recursive: true, force: true });
fs.mkdirSync(cutDir, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(genDir, "manifest.json"), "utf8"));

for (const m of manifest) {
  const src = path.join(genDir, `${m.slug}.jpg`);
  if (!fs.existsSync(src)) { console.log(`skip ${m.slug}`); continue; }
  try {
    const blob = await removeBackground(pathToFileURL(src).href);
    fs.writeFileSync(path.join(cutDir, `${m.slug}.png`), Buffer.from(await blob.arrayBuffer()));
    console.log(`. ${m.slug}`);
  } catch (e) {
    console.log(`x ${m.slug}: ${e.message}`);
  }
}
console.log("cut -> .refwork/ai-cut/ (now run ai-styling-finish.mjs)");
