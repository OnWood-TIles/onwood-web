// Join the GREEN pricelist rows to the crawled catalogue. Group by range -> size,
// list colours+codes, and match each to website page id(s). Reports scope + any
// ranges that don't map (flags). -> .refwork/tileone-plan.json
import fs from "fs";
const rows = JSON.parse(fs.readFileSync(".refwork/tileone-all.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync(".refwork/tileone-catalog.json", "utf8"));
const norm = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// catalog: name -> [ids]
const byName = new Map();
for (const c of catalog) {
  const k = norm(c.title);
  if (!byName.has(k)) byName.set(k, []);
  byName.get(k).push(c);
}

const green = rows.filter((r) => r.green && r.range);
// group by range -> size
const ranges = new Map();
for (const r of green) {
  const rk = norm(r.range);
  if (!ranges.has(rk)) ranges.set(rk, { range: r.range, sizes: new Map() });
  const g = ranges.get(rk);
  const sz = r.size || "?";
  if (!g.sizes.has(sz)) g.sizes.set(sz, []);
  g.sizes.get(sz).push({ code: r.code, colourFinish: r.colourFinish, price: r.cartonPriceM2, m2box: r.m2box });
}

const plan = [];
let totalProducts = 0, totalColours = 0, unmapped = [];
for (const [rk, g] of ranges) {
  const cat = byName.get(rk) || [];
  const sizes = [...g.sizes.entries()].map(([size, cols]) => ({ size, colours: cols }));
  totalProducts += sizes.length;
  totalColours += g.colours;
  for (const s of sizes) totalColours += s.colours.length;
  if (!cat.length) unmapped.push(g.range);
  plan.push({ range: g.range, normKey: rk, websiteIds: cat.map((c) => c.id), sizes });
}
plan.sort((a, b) => a.range.localeCompare(b.range));
fs.writeFileSync(".refwork/tileone-plan.json", JSON.stringify(plan, null, 1));

console.log(`GREEN ranges: ${plan.length}`);
console.log(`Products (range x size): ${totalProducts}`);
console.log(`Total colour variations: ${green.length}`);
const multiSize = plan.filter((p) => p.sizes.length > 1);
console.log(`\nMulti-size ranges (${multiSize.length}): ` + multiSize.map((p) => `${p.range}[${p.sizes.map((s) => s.size).join("/")}]`).join(", "));
console.log(`\nUnmapped to website (${unmapped.length}): ` + unmapped.join(", "));
const multiId = plan.filter((p) => p.websiteIds.length > 1);
console.log(`\nRanges with multiple website pages (${multiId.length}): ` + multiId.map((p) => `${p.range}(${p.websiteIds.join(",")})`).join(", "));
console.log(`\n--- sample: first 6 ranges ---`);
for (const p of plan.slice(0, 6)) console.log(`${p.range}  ids=[${p.websiteIds}]  ${p.sizes.map((s) => `${s.size}:${s.colours.length}col`).join("  ")}`);
