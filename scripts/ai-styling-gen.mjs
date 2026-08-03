// AI STYLING - phase 1 (generate). Gemini image-gen, guided by an existing cutout
// as a style reference, creates themed styling objects on a plain background.
// Saves JPEGs to .refwork/ai-gen/ + a manifest. Run:
//   GEMINI_API_KEY=... node scripts/ai-styling-gen.mjs      (ONLY=slug1,slug2 to redo some)
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("GEMINI_API_KEY missing"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY });
const MODEL = "gemini-3.1-flash-image";
const CONCURRENCY = 5;
const ONLY = (process.env.ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const root = process.cwd();
const outDir = path.join(root, ".refwork/ai-gen");
if (!ONLY.length) { fs.rmSync(outDir, { recursive: true, force: true }); }
fs.mkdirSync(outDir, { recursive: true });

// pale=true -> generate on light grey so background-removal keeps white/cream parts.
const F = (slug, desc, pale) => ({ slug: `ai-floral-${slug}`, cat: "Floral", refCat: "Floral", pale, desc });
const C = (slug, desc, pale) => ({ slug: `ai-cushion-${slug}`, cat: "Cushion", refCat: "Cushion", pale, desc });
const D = (slug, desc, pale, extra = {}) => ({ slug: `ai-decor-${slug}`, cat: "Decor", refCat: "Floral", pale, desc, ...extra });

const ITEMS = [
  // ── FLORAL (20) - MOSTLY WITHOUT pots (loose bunches / stems / dried) ──────
  F("lavender-bunch", "a loose hand-tied bunch of French lavender stems, Mediterranean, cut stems showing, NO vase or pot", false),
  F("olive-branch", "a few fresh olive branches with silvery-green leaves and small olives, Mediterranean, NO vase or pot", false),
  F("eucalyptus-sprig", "a loose bunch of silver-dollar eucalyptus stems, Scandinavian, cut stems, NO vase or pot", false),
  F("pampas-cream", "a cluster of tall fluffy cream pampas grass plumes, contemporary boho, NO vase or pot", true),
  F("white-peony-bunch", "a hand-tied bunch of white peonies with eucalyptus, cut stems, NO vase or pot", true),
  F("blush-ranunculus", "a loose bunch of soft blush-pink ranunculus, cut stems, NO vase or pot", false),
  F("sunflower-bunch", "a rustic bunch of bright yellow sunflowers, Mediterranean, cut stems, NO vase or pot", false),
  F("wildflower-meadow", "a loose Mediterranean wildflower bunch of poppies, daisies and grasses, NO vase or pot", false),
  F("dried-mixed", "a dried arrangement of bunny tails, wheat and preserved neutral foliage, Scandinavian, NO vase or pot", true),
  F("blue-delphinium", "a tall bunch of blue delphiniums, coastal, cut stems, NO vase or pot", false),
  F("terracotta-protea", "a bold bunch of orange-terracotta king proteas with native foliage, NO vase or pot", false),
  F("red-garden-rose", "a lush bunch of deep red garden roses, cut stems, NO vase or pot", false),
  F("native-gum", "a bunch of Australian native gum leaves with gumnuts and a few red flowering-gum blooms, NO vase or pot", false),
  F("babys-breath", "an airy cloud of white baby's breath gypsophila, cut stems, NO vase or pot", true),
  F("white-tulip", "a loose relaxed bunch of white tulips, cut stems, NO vase or pot", true),
  F("hydrangea-blue", "a bunch of blue and lilac hydrangea heads with leaves, NO vase or pot", false),
  F("wheat-sheaf", "a tied golden wheat sheaf, rustic Scandinavian, NO vase or pot", false),
  F("anthurium-modern", "a few sculptural glossy red anthurium flowers, contemporary minimal, NO vase or pot", false),
  // a couple WITH a simple vessel for variety
  F("cream-peony-vase", "white and cream peonies arranged in a simple matte-white ceramic vase", true),
  F("mediterranean-jug", "a Mediterranean mix of sunflowers, olive branches and wildflowers in a rustic terracotta jug", false),

  // ── CUSHION (20) - colours / textures / shapes across themes ──────────────
  C("terracotta-linen", "a single plush square linen scatter cushion in warm terracotta, natural woven texture, Mediterranean", false),
  C("sage-boucle", "a single plush square boucle cushion in soft sage green, nubby textured fabric, Scandinavian", false),
  C("cream-knit", "a single plush square chunky knitted cushion in warm cream, cosy Scandinavian", true),
  C("charcoal-velvet", "a single plush square velvet cushion in deep charcoal, soft sheen, contemporary", false),
  C("ochre-linen", "a single plush square linen cushion in mustard ochre, Mediterranean", false),
  C("navy-linen", "a single plush square linen cushion in deep navy blue, coastal", false),
  C("white-linen", "a single plush square linen cushion in crisp white, minimal", true),
  C("mustard-lumbar", "a single plush rectangular lumbar cushion in warm mustard linen", false),
  C("blush-velvet", "a single plush square velvet cushion in blush pink, soft sheen", false),
  C("olive-stripe", "a single plush square cushion in an olive-and-cream Mediterranean stripe", false),
  C("rust-boucle", "a single plush square boucle cushion in rich rust, nubby texture", false),
  C("grey-herringbone", "a single plush square wool cushion in soft grey herringbone, Scandinavian", false),
  C("black-linen", "a single plush square linen cushion in matte black, contemporary minimal", false),
  C("natural-jute", "a single plush square cushion in natural jute hessian, coastal textured", false),
  C("terracotta-blockprint", "a single plush square cushion with a hand-blocked terracotta-on-cream Mediterranean print", false),
  C("teal-velvet", "a single plush square velvet cushion in deep teal", false),
  C("cream-tassel", "a single plush square cream linen cushion with corner tassels, boho", true),
  C("stone-linen", "a single plush square linen cushion in soft stone greige", true),
  C("burnt-orange-lumbar", "a single plush rectangular lumbar cushion in burnt orange linen", false),
  C("blue-coastal-stripe", "a single plush square cushion in a blue-and-white coastal stripe", false),

  // ── DECOR (30) - vases, bowls, candles, books, sculptural, planters ───────
  D("white-ceramic-vase", "a single empty matte-white ceramic vase, simple modern shape", true),
  D("black-ribbed-vase", "a single empty matte-black ribbed ceramic vase, contemporary", false),
  D("terracotta-urn", "a single rustic aged terracotta urn, Mediterranean", false),
  D("gold-vessel", "a single sculptural brushed-gold decorative vase, modern organic curved form, luxe", false),
  D("stone-bowl", "a single chunky travertine stone decorative bowl, contemporary", true),
  D("glass-bud-vase", "a single clear glass bud vase, minimal", false),
  D("rattan-lantern", "a single woven natural rattan lantern, coastal boho", false),
  D("book-stack", "a neat stack of three neutral linen-bound coffee-table books, contemporary styling", true, { noRef: true }),
  D("brass-candlesticks", "a pair of slim brass taper candle holders with cream candles", false),
  D("cream-stoneware-jug", "a single cream stoneware jug, rustic Mediterranean", true),
  D("black-abstract-sculpture", "a single matte-black abstract sculptural object, contemporary", false),
  D("olive-tree-pot", "a small potted olive tree in a simple terracotta pot, Mediterranean", false),
  D("pampas-in-vase", "tall cream pampas grass in a tall ribbed ceramic vase", true),
  D("white-pillar-candles", "a cluster of three white pillar candles of varying heights", true),
  D("cactus-terracotta", "a small potted cactus in a terracotta pot, contemporary desert", false),
  D("wooden-bowl", "a single carved light-oak decorative bowl, Scandinavian", true),
  D("marble-tray-candle", "a round white-marble tray holding a single lit candle, spa contemporary", true),
  D("blue-glaze-vase", "a single coastal blue-glazed ceramic vase, glossy", false),
  D("brass-bowl", "a single hammered brass decorative bowl, luxe", false, { noRef: true }),
  D("reed-diffuser", "a single amber-glass reed diffuser bottle with rattan reeds, spa", false),
  D("nested-bowls", "a set of three nested stoneware bowls in soft neutral tones, Scandinavian", true),
  D("black-metal-lantern", "a single black metal and glass candle lantern, contemporary", false),
  D("cream-sculptural-hands", "a single matte-cream sculptural hands ornament, contemporary art object", true),
  D("dried-in-stoneware", "dried pampas and bunny tails in a matte stoneware vase, boho", true),
  D("ginger-jar", "a single blue-and-white porcelain ginger jar, Hamptons", true),
  D("fern-terracotta", "a lush green fern in a terracotta planter, Mediterranean", false),
  D("concrete-vase", "a single raw concrete cylinder vase, contemporary industrial", true),
  D("seagrass-basket", "a single woven seagrass storage basket, Scandinavian coastal", false),
  D("brass-hurricane", "a single brass and glass hurricane candle holder with a cream candle", false),
  D("white-bud-vase-trio", "a trio of three small white bud vases of varying heights", true),
];

const styling = JSON.parse(fs.readFileSync(path.join(root, "public/data/styling.json"), "utf8"));
const refFor = (cat) => {
  const pick = styling.find((s) => s.category === cat) || styling[0];
  const file = path.join(root, "public", pick.url.replace(/^\//, ""));
  return { data: fs.readFileSync(file).toString("base64"), mimeType: "image/webp" };
};
const refs = { Floral: refFor("Floral"), Cushion: refFor("Cushion") };

const queue = ITEMS.filter((it) => !ONLY.length || ONLY.includes(it.slug));
const manifest = ONLY.length
  ? JSON.parse(fs.readFileSync(path.join(outDir, "manifest.json"), "utf8")).filter((m) => !ONLY.includes(m.slug))
  : [];

async function gen(it) {
  const ref = refs[it.refCat] || refs.Floral;
  const bg = it.pale
    ? "a soft even seamless LIGHT-GREY studio background (mid grey #b8b8b8, NOT white)"
    : "a plain seamless pure-white studio background";
  // The reference is a STYLE guide only (some items skip it entirely via noRef, so
  // a floral reference can't bleed into e.g. a book stack or a brass bowl).
  const styleLine = it.noRef
    ? ""
    : "Match ONLY the clean, isolated CUT-OUT product-photo STYLE and studio lighting of the attached reference image - do NOT copy its subject, flowers, berries or shape. ";
  const prompt = `${styleLine}Create this exact subject: ${it.desc}. Product-catalogue photograph of a single subject, centred on ${bg}, soft even studio lighting with a subtle soft contact shadow directly beneath it, photorealistic, high detail, premium interiors styling look. Show EXACTLY ONE subject - one composition only, do NOT duplicate, repeat, mirror or split the frame into panels. It sits centred and fills most of the frame with clean even margin all around. Absolutely no text, no watermark, no extra props, no hands, no furniture - nothing but the single subject on the plain background.`;
  const parts = it.noRef
    ? [{ text: prompt }]
    : [{ inlineData: { mimeType: ref.mimeType, data: ref.data } }, { text: prompt }];
  try {
    const resp = await ai.models.generateContent({ model: MODEL, contents: [{ role: "user", parts }] });
    const part = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) return console.log(`x ${it.slug} (no image)`);
    fs.writeFileSync(path.join(outDir, `${it.slug}.jpg`), Buffer.from(part.inlineData.data, "base64"));
    manifest.push({ slug: it.slug, category: it.cat, name: it.slug });
    console.log(`. ${it.slug}`);
  } catch (e) {
    console.log(`x ${it.slug}: ${e.message}`);
  }
}

for (let i = 0; i < queue.length; i += CONCURRENCY) {
  await Promise.all(queue.slice(i, i + CONCURRENCY).map(gen));
}
manifest.sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 1));
console.log(`\ngenerated ${queue.length} (manifest ${manifest.length}) -> .refwork/ai-gen/ (now run ai-styling-cut.mjs)`);
