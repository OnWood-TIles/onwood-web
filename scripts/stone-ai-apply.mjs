// Apply AI-enhanced benchtop images. Only replaces a stone when BOTH orientations
// (landscape + portrait) exist, so no stone is left half-AI/half-original. Converts
// to webp, replaces public/images/stone/<code>.webp(+ -p), and in stone.json marks
// those stones hires:true + bumps the ?v cache-buster. sharp only.
//   node scripts/stone-ai-apply.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const aiDir = path.join(root, ".refwork/stone-ai");
const stoneDir = path.join(root, "public/images/stone");
const jsonPath = path.join(root, "public/data/stone.json");
const NEWV = "v3";

// Which codes have BOTH images ready?
const files = fs.readdirSync(aiDir).filter((f) => f.endsWith(".jpg"));
const has = {};
for (const f of files) {
  const base = f.replace(/\.jpg$/, "");
  const code = base.replace(/-p$/, "");
  (has[code] = has[code] || {})[/-p$/.test(base) ? "port" : "land"] = true;
}
const ready = Object.keys(has).filter((c) => has[c].land && has[c].port);
const incomplete = Object.keys(has).filter((c) => !ready.includes(c));

for (const code of ready) {
  for (const suf of ["", "-p"]) {
    await sharp(path.join(aiDir, `${code}${suf}.jpg`)).webp({ quality: 88 }).toFile(path.join(stoneDir, `${code}${suf}.webp`));
  }
  process.stdout.write(".");
}

const readySet = new Set(ready);
const stone = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let updated = 0;
for (const s of stone) {
  if (!readySet.has(s.code)) continue;
  s.hires = true;
  s.url = s.url.replace(/\?v=?\w+$/, "") + `?${NEWV}`;
  s.urlP = s.urlP.replace(/\?v=?\w+$/, "") + `?${NEWV}`;
  updated++;
}
fs.writeFileSync(jsonPath, JSON.stringify(stone));
console.log(`\napplied ${ready.length} stones (both orientations); stone.json updated ${updated}.`);
if (incomplete.length) console.log(`skipped ${incomplete.length} incomplete (kept original): ${incomplete.join(", ")}`);
