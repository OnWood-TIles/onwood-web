// Builds the Laminex woodgrain (timber cabinetry) catalogue for the vision board.
// Paginates the live woodgrains listing (200 products/page), dedupes to ONE swatch
// per decor (there are ~5 finishes per look), writes public/data/timber.json, then
// downloads each Laminex sample photo and hosts it locally as a portrait webp
// (Laminex's media server is behind bot-protection, so we self-host like stone).
//
// Laminex's /medias/ image path 400s any request without a valid browser session,
// so we PRIME a cookie session from a page load first, then fetch each image with
// those cookies + a Referer (re-priming if the session lapses). Resumable: existing
// webps are skipped and orphans pruned. Re-run any time: node scripts/gen-timber.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public/images/timber");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, "public/data"), { recursive: true });

const PAGE = "https://www.laminex.com.au/browse/colour-texture/woodgrains";
const BH = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-AU,en;q=0.9",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Decors to leave out: all "Multiplex" (plywood-edge) laminates - poor sample
// photos / not wanted for the moodboard.
const EXCLUDE = /multiplex/i;

let cookie = "";
async function prime() {
  const r = await fetch(PAGE, { headers: { ...BH, Accept: "text/html" } });
  const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  cookie = sc.map((c) => c.split(";")[0]).join("; ");
}

async function fetchImg(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, {
        headers: {
          ...BH,
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          Referer: PAGE,
          Cookie: cookie,
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "same-origin",
        },
      });
      const buf = Buffer.from(await r.arrayBuffer());
      if (r.status === 200 && buf.length > 500) return buf;
    } catch {}
    await prime(); // session may have lapsed - re-prime and back off
    await sleep(2000 * (attempt + 1));
  }
  return null;
}

// Parse one page's product cards into the shared decor map (dedupe by name,
// preferring an AbsoluteGrain finish photo). Returns the card count on the page.
function parsePage(html, byName) {
  const blocks = html.split(/<figure class="swatches-media/).slice(1);
  for (const b of blocks) {
    const name = (b.match(/data-click-product-colour="([^"]*)"/) || [])[1];
    const finish =
      (b.match(/data-click-product-finish="([^"]*)"/) || [])[1] || "";
    const code = (b.match(/data-click-product-code="([^"]*)"/) || [])[1];
    // Full image URL incl. its ?context=... token (required verbatim).
    let src = (b.match(
      /src="(https:\/\/www\.laminex\.com\.au\/medias\/[^"]+)"/i,
    ) || [])[1];
    if (!name || !src || !code) continue;
    const key = name.trim();
    if (EXCLUDE.test(key)) continue;
    src = src.replace(/&amp;/g, "&");
    const rec = { name: key, finish, code, src };
    const cur = byName.get(key);
    if (
      !cur ||
      (!/AbsoluteGrain/i.test(cur.finish) && /AbsoluteGrain/i.test(finish))
    )
      byName.set(key, rec);
  }
  return blocks.length;
}

async function run() {
  console.log("paginating woodgrains listing...");
  await prime(); // establishes the image session cookie too
  const byName = new Map();
  for (let page = 0; page < 20; page++) {
    const r = await fetch(`${PAGE}?page=${page}`, {
      headers: { ...BH, Accept: "text/html" },
    });
    const n = r.status === 200 ? parsePage(await r.text(), byName) : 0;
    console.log(`  page ${page}: ${n} cards (running decors ${byName.size})`);
    if (n === 0) break;
    await sleep(1300);
  }
  const decors = [...byName.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  console.log(`parsed ${decors.length} unique decors`);

  fs.writeFileSync(
    path.join(root, "public/data/timber.json"),
    JSON.stringify(
      decors.map((d) => ({
        name: d.name,
        finish: d.finish,
        code: d.code,
        url: `/images/timber/${d.code}.webp`,
      })),
    ),
  );
  console.log(`wrote ${decors.length} decors to public/data/timber.json`);

  let ok = 0,
    fetched = 0,
    failed = [];
  for (const d of decors) {
    const file = path.join(outDir, `${d.code}.webp`);
    if (fs.existsSync(file)) {
      ok++;
      continue;
    }
    const buf = await fetchImg(d.src);
    if (!buf) {
      failed.push(d.name);
      process.stdout.write("x");
      continue;
    }
    // Portrait webp matching the paint-chip aspect (120x168 = 0.714).
    await sharp(buf)
      .resize(320, 448, { fit: "cover", position: "centre", kernel: "lanczos3" })
      .sharpen(0.6)
      .webp({ quality: 84 })
      .toFile(file);
    ok++;
    fetched++;
    process.stdout.write(".");
    await sleep(2200 + Math.floor(Math.random() * 800)); // gentle
  }

  // Prune orphan webps (excluded/renamed decors no longer in the catalogue).
  const keep = new Set(decors.map((d) => `${d.code}.webp`));
  let pruned = 0;
  for (const f of fs.readdirSync(outDir)) {
    if (f.endsWith(".webp") && !keep.has(f)) {
      fs.unlinkSync(path.join(outDir, f));
      pruned++;
    }
  }
  console.log(
    `\nDONE - ${ok}/${decors.length} hosted (fetched ${fetched} new, pruned ${pruned}).` +
      (failed.length ? ` MISSING: ${failed.join(", ")} (re-run to retry)` : ""),
  );
}
run();
