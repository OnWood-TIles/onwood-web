// Builds the Caesarstone benchtop catalogue: for each colour slug it fetches the
// product page, grabs the og:image slab, then rotates -> landscape upscales ->
// smooths (blur 1.2) and hosts it as a webp, and writes public/data/stone.json.
// Re-run to refresh: node scripts/gen-stone.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const sitemap = fs.readFileSync(
  path.join(root, ".refwork/cs-sitemap.xml"),
  "utf8",
);
const slugs = [
  ...new Set(
    (sitemap.match(/\/colours\/[a-z0-9-]+/gi) || []).map((s) =>
      s.replace("/colours/", ""),
    ),
  ),
].filter(Boolean);

const UA = { "User-Agent": "Mozilla/5.0" };
const outDir = path.join(root, "public/images/stone");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, "public/data"), { recursive: true });

const title = (s) =>
  s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

async function run() {
  const out = [];
  let done = 0;
  for (const slug of slugs) {
    const parts = slug.split("-");
    const code = parts[0];
    const name = title(parts.slice(1).join("-"));
    try {
      const html = await (
        await fetch(`https://www.caesarstone.com.au/colours/${slug}/`, {
          headers: UA,
        })
      ).text();
      // Prefer the high-res landscape Full_Slab image (crisp, less zoomed);
      // fall back to the low-res 50x70cm close-up (og:image) otherwise.
      const slabs = [
        ...html.matchAll(
          /https:\/\/[^"' ]*Full.?Slab[^"' ]*\.(?:jpg|jpeg|png|webp)/gi,
        ),
      ].map((m) => m[0]);
      const fullSlab =
        slabs.find((u) => !/-\d{2,4}x\d{2,4}\./.test(u)) || slabs[0];
      const og = (html.match(
        /<meta property="og:image" content="([^"]+)"/i,
      ) || [])[1];
      const src = fullSlab || og;
      if (!src) {
        console.log("SKIP (no image)", slug);
        continue;
      }
      const buf = Buffer.from(
        await (
          await fetch(src, {
            headers: { ...UA, Referer: "https://www.caesarstone.com.au/" },
          })
        ).arrayBuffer(),
      );
      if (fullSlab) {
        // High-res whole slab, already landscape - crisp, no blur.
        await sharp(buf)
          .resize(1600, 620, { fit: "cover", kernel: "lanczos3" })
          .webp({ quality: 84 })
          .toFile(path.join(outDir, `${code}.webp`));
        await sharp(buf)
          .resize(640, 1000, { fit: "cover", kernel: "lanczos3" })
          .webp({ quality: 84 })
          .toFile(path.join(outDir, `${code}-p.webp`));
      } else {
        // Low-res close-up: rotate to landscape + upscale + smooth (desktop),
        // near-native portrait + smooth (mobile).
        await sharp(buf)
          .rotate(90)
          .resize(1200, 600, { fit: "cover", kernel: "lanczos3" })
          .blur(1.2)
          .webp({ quality: 82 })
          .toFile(path.join(outDir, `${code}.webp`));
        await sharp(buf)
          .resize(600, 980, { fit: "cover", kernel: "lanczos3" })
          .blur(1.1)
          .webp({ quality: 82 })
          .toFile(path.join(outDir, `${code}-p.webp`));
      }
      out.push({
        name,
        code,
        url: `/images/stone/${code}.webp`,
        urlP: `/images/stone/${code}-p.webp`,
        hires: !!fullSlab,
      });
      done++;
      if (done % 10 === 0) console.log(`  ...${done}/${slugs.length}`);
    } catch (e) {
      console.log("ERR", slug, e.message);
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(
    path.join(root, "public/data/stone.json"),
    JSON.stringify(out),
  );
  console.log(`wrote ${out.length} stones to public/data/stone.json`);
}
run();
