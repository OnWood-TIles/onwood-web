// Builds the Quick-Step flooring catalogue for the vision board "Flooring" tab.
// Paginates the Quick-Step "find your floor" lister (Sitecore B2CFloorListerV2
// LoadMore endpoint, POST with page=N) and writes public/data/flooring.json.
//
// Images are HOTLINKED from cdn3.quick-step.com (a real CDN, hotlink-friendly,
// like the Feltex/Redbook carpet swatches) - for speed we pick a ~440w rendition
// from each product's srcSet instead of the full-res packshot. Quick-Step AU has
// Laminate / Vinyl / Timber only (no Hybrid). Re-run: node scripts/gen-flooring.mjs
import fs from "fs";
import path from "path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const G = "%7BBF371A68-426A-43AF-A317-740DA49CD6E1%7D";
const DS = "dataSource=%7B99594696-6915-4A2E-9CE0-BB3C8E70444A%7D";
const LOADMORE = `https://www.quick-step.com.au/services/Flooring-QS-Australia/en-AU/B2CFloorListerV2/LoadMore/${G}?${DS}`;
const dec = (s) =>
  s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pick a ~440w-wide rendition from the product's srcSet (good for a ~220px
// display at 2x), else fall back to the base packshot src.
function pickImg(images) {
  const im = images && images[0];
  if (!im) return "";
  const cands = [...(im.srcSet || "").matchAll(/(https:\/\/[^ ]+)\s+(\d+)w/g)].map(
    (m) => ({ url: dec(m[1]), w: +m[2] }),
  );
  if (cands.length) {
    cands.sort((a, b) => Math.abs(a.w - 440) - Math.abs(b.w - 440));
    return cands[0].url;
  }
  return dec(im.src || "");
}

async function run() {
  const byCode = new Map();
  for (let page = 1; page <= 15; page++) {
    const r = await fetch(`${LOADMORE}&page=${page}`, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `page=${page}&page_size=12`,
    });
    let j;
    try {
      j = JSON.parse(await r.text());
    } catch {
      break;
    }
    const list = j.list || [];
    if (!list.length) break;
    for (const p of list) {
      if (!p.code || byCode.has(p.code)) continue;
      const type = (p.floorType || "").toLowerCase();
      if (!["timber", "laminate", "vinyl", "hybrid"].includes(type)) continue;
      let name = "";
      const dm = (p.url || "").match(/data-product="([^"]+)"/);
      if (dm) {
        try {
          name = JSON.parse(dec(dm[1])).name.trim();
        } catch {}
      }
      if (!name) {
        const tm = (p.url || "").match(/>([^<]+)<\/a>/);
        name = tm ? tm[1].trim() : p.code;
      }
      const url = pickImg(p.images);
      if (!url) continue;
      byCode.set(p.code, {
        name,
        range: p.commercialRangeName || "",
        type,
        brand: "Quick-Step",
        code: p.code,
        url,
      });
    }
    console.log(`  page ${page}: total ${byCode.size}`);
    await sleep(500);
  }
  const all = [...byCode.values()].sort(
    (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
  );
  fs.mkdirSync(path.join(process.cwd(), "public/data"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), "public/data/flooring.json"),
    JSON.stringify(all),
  );
  const byType = all.reduce((a, p) => ((a[p.type] = (a[p.type] || 0) + 1), a), {});
  console.log(`wrote ${all.length} floors to public/data/flooring.json`, JSON.stringify(byType));
}
run();
