// Validate every match file against its packet: JSON shape, ids exist, colour
// coverage vs pricelist. Reports problems. node scripts/validate-matches.mjs
import fs from "fs";
const MDIR = ".refwork/matches";
const plan = JSON.parse(fs.readFileSync(".refwork/tileone-plan.json", "utf8"));
const files = fs.readdirSync(MDIR).filter((f) => f.endsWith(".json"));
let problems = 0, totalColours = 0, totalRooms = 0;
const norm = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
console.log(`match files: ${files.length}\n`);
for (const f of files) {
  const key = f.replace(".json", "");
  let m;
  try { m = JSON.parse(fs.readFileSync(`${MDIR}/${f}`, "utf8")); } catch (e) { console.log(`✗ ${key}: BAD JSON ${e.message}`); problems++; continue; }
  const packet = JSON.parse(fs.readFileSync(`.refwork/packets/${key}/packet.json`, "utf8"));
  const ids = new Set(packet.images.map((i) => i.id));
  const priceColours = packet.sizes.flatMap((s) => s.colours.map((c) => c.colourFinish));
  const matched = Object.keys(m.colours || {});
  let bad = [];
  for (const [name, c] of Object.entries(m.colours || {})) {
    if (c.faceImgId && !ids.has(String(c.faceImgId))) bad.push(`face ${c.faceImgId} for ${name}`);
    if (c.roomImgId && !ids.has(String(c.roomImgId))) bad.push(`room ${c.roomImgId} for ${name}`);
    totalColours++;
    if (c.roomImgId) totalRooms++;
  }
  // how many pricelist colours resolve to a match key
  const resolved = priceColours.filter((cf) => matched.some((k) => norm(cf).startsWith(norm(k)) || norm(k).startsWith(norm(cf)) || norm(k) === norm(cf)));
  const cov = `${resolved.length}/${priceColours.length} pricelist colours resolved`;
  const status = bad.length ? "✗" : "✓";
  if (bad.length) problems++;
  console.log(`${status} ${key.padEnd(14)} ${matched.length} colours, rooms=${Object.values(m.colours||{}).filter(c=>c.roomImgId).length}, ${cov}${bad.length ? "  BAD: " + bad.join("; ") : ""}${m.flags?.length ? `  [${m.flags.length} flags]` : ""}`);
}
console.log(`\nTOTAL matched colours=${totalColours} rooms=${totalRooms}  problems=${problems}`);
const missing = plan.filter((p) => p.websiteIds.length && p.normKey !== "ANTIQUITY" && !files.includes(p.normKey + ".json"));
if (missing.length) console.log(`MISSING match files: ${missing.map((p) => p.normKey).join(", ")}`);
