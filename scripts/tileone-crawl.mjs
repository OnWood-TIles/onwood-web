// Crawl the whole Tile One catalogue: for product ids 1..220, fetch showproduct,
// and record { id, title(range name), brochurePdf, imageUrls[] }. Robust base map
// so we never re-scrape. Parallel batches. -> .refwork/tileone-catalog.json
import fs from "fs";
const UA = { "User-Agent": "Mozilla/5.0" };
fs.mkdirSync(".refwork", { recursive: true });
const MAX = 220, BATCH = 15;

async function one(id) {
  try {
    const r = await fetch(`https://www.tileone.com.au/product/showproduct.php?id=${id}&lang=en`, { headers: UA });
    if (!r.ok) return null;
    const html = await r.text();
    const tm = html.match(/<title>([^<]*)<\/title>/i);
    let title = tm ? tm[1].trim() : "";
    // "Antiquity-Tilearte Wholesale" -> "Antiquity"
    title = title.replace(/\s*-\s*[^-]*wholesale\s*$/i, "").replace(/\s*-\s*Tile\s*One.*$/i, "").trim();
    if (!title || /^tile\s*one/i.test(title)) return null;
    const pdf = (html.match(/upload\/file\/[0-9]+\/[0-9]+\.pdf/i) || [])[0] || null;
    const imgs = [...new Set([...html.matchAll(/upload\/20[0-9]{4}\/[0-9]+\.(?:jpg|jpeg|png)/gi)].map((m) => m[0]))];
    return { id, title, brochurePdf: pdf, imageUrls: imgs };
  } catch { return null; }
}

const found = [];
for (let start = 1; start <= MAX; start += BATCH) {
  const ids = Array.from({ length: Math.min(BATCH, MAX - start + 1) }, (_, i) => start + i);
  const res = await Promise.all(ids.map(one));
  for (const r of res) if (r) found.push(r);
  process.stdout.write(`.${start + BATCH - 1}`);
}
console.log(`\ncrawled ${found.length} products`);
fs.writeFileSync(".refwork/tileone-catalog.json", JSON.stringify(found, null, 1));
console.log("names:", found.map((f) => f.title).sort().join(", "));
