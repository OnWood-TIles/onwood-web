// Pre-generate AI room renders for the curated hero mood-boards, reusing the
// site's own buildImaginePrompt (colour-accurate + tile-role-aware, Phase B).
// Board recipes reference products BY NAME; URLs are resolved from the data
// files so a typo fails loudly instead of shipping a wrong swatch.
// Run from the repo root: npx tsx scripts/gen-hero-boards.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
// Load .env.local manually (no dotenv dependency needed).
try {
  for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
} catch { /* no .env.local */ }
import sharp from "sharp";
import { buildImaginePrompt, type ImagineRequest, type ImagineItem } from "../lib/imagine";

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_AI_TOKEN;
const MODEL = process.env.CLOUDFLARE_AI_MODEL || "@cf/black-forest-labs/flux-1-schnell";
const PUBLIC = join(process.cwd(), "public");
const OUT = join(process.env.TEMP || ".", "hero-gen");
mkdirSync(OUT, { recursive: true });

const COLOUR_KINDS = new Set(["flooring", "carpet", "timber", "tile"]);
const VARIANTS = 4;

// ---- product data (resolve URLs by name) -----------------------------------
type Named = { name: string; url: string; type?: string };
const load = (p: string) => JSON.parse(readFileSync(join(PUBLIC, p), "utf8"));
const TILES = load("data/tiles.json") as { name: string; type: string; url: string }[];
const STONE = load("data/stone.json") as { name: string; url: string }[];
const TIMBER = load("data/timber.json") as { name: string; url: string }[];
const CARPET = load("data/carpet.json") as { colour: string; url: string }[];

const tile = (name: string) => { const t = TILES.find((x) => x.name === name); if (!t) throw new Error(`tile not found: ${name}`); return t; };
const stone = (name: string) => { const s = STONE.find((x) => x.name === name); if (!s) throw new Error(`stone not found: ${name}`); return s; };
const timber = (name: string) => { const t = TIMBER.find((x) => x.name === name); if (!t) throw new Error(`timber not found: ${name}`); return t; };
const carpet = (colour: string) => { const c = CARPET.find((x) => x.colour === colour); if (!c) throw new Error(`carpet not found: ${colour}`); return c; };

async function swatchHex(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    let buf: Buffer;
    if (url.startsWith("/")) buf = readFileSync(join(PUBLIC, url.split("?")[0]));
    else {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: "https://onwoodtiles.com.au/" } });
      if (!r.ok) return null;
      buf = Buffer.from(await r.arrayBuffer());
    }
    // flatten onto white so transparent mosaic cutouts read their true colour
    const c = (await sharp(buf).flatten({ background: "#ffffff" }).stats()).channels;
    if (!c || c.length < 3) return null;
    const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${h(c[0].mean)}${h(c[1].mean)}${h(c[2].mean)}`;
  } catch { return null; }
}

async function generateOne(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, steps: 8 }),
    });
    if (!res.ok) { console.error("  CF " + res.status + ": " + (await res.text().catch(() => "")).slice(0, 160)); return null; }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) { const d = (await res.json()) as { result?: { image?: string } }; return d?.result?.image || null; }
    return Buffer.from(await res.arrayBuffer()).toString("base64");
  } catch (e) { console.error("  gen error", e); return null; }
}

// ---- the 6 boards (Phase C structure) --------------------------------------
type Paint = { name: string; hex: string };
type Preset = {
  id: string; label: string; room: string; style: string; note?: string;
  floorTile: string; wallTile?: string; stackstone?: string;
  cabinetry?: string; benchtop?: string; carpet?: string;
  metal: string; paints: Paint[]; styling: string[];
};

const PRESETS: Preset[] = [
  { id: "bath-coastal-white", label: "Bath · Coastal White", room: "Bathroom", style: "Hamptons",
    floorTile: "BIANCO Carrara In & Out", wallTile: "White Gloss Penny Round",
    cabinetry: "Whitewashed Oak", benchtop: "Calacatta Nuvo", metal: "Brushed Nickel",
    paints: [{ name: "Natural White", hex: "#EFE9DB" }], styling: ["Green Skimmia Stem", "Juniper Decorative Bowl"] },
  { id: "bath-warm-stone", label: "Bath · Warm Stone Spa", room: "Bathroom", style: "Contemporary",
    floorTile: "TRAVERTINE 3D CROSSCUT Warm In & Out", wallTile: "Roman Travertine Mini Arch Mosaic",
    cabinetry: "Golden Oak", benchtop: "Taj Whisper", metal: "Tumbled Aged Brass",
    paints: [{ name: "Antique White", hex: "#E6DECC" }], styling: ["Willow Twig Stem", "Woodland Book Box Set"] },
  { id: "kitchen-hamptons-white", label: "Kitchen · Hamptons White", room: "Kitchen", style: "Hamptons",
    floorTile: "LIMESTONE 2.0 Cotton Matt", wallTile: "Hampton White Matt Handmade",
    cabinetry: "White Painted Wood", benchtop: "Calacatta Nuvo", metal: "Brushed Brass",
    paints: [{ name: "Natural White", hex: "#EFE9DB" }], styling: ["Lemon Stem", "Silver Mist Book Box Set"] },
  { id: "kitchen-industrial-charcoal", label: "Kitchen · Industrial Charcoal", room: "Kitchen", style: "Industrial",
    floorTile: "LAVIDA Dark Grey Matt", wallTile: "Stack Bond Tundra",
    cabinetry: "Charred Oak", benchtop: "Raw Concrete", metal: "Matte Black",
    paints: [{ name: "Milton Moon", hex: "#A19D91" }], styling: ["Native Berry Eucalypt Bunch", "Surrey Atom Decoration"] },
  { id: "living-japandi-warm", label: "Living · Japandi Warmth", room: "Living room", style: "Japandi",
    floorTile: "Ever Timber Natural Matt", carpet: "Cotswold Stone", metal: "Brushed Brass",
    paints: [{ name: "Hog Bristle", hex: "#E4DDC8" }, { name: "Timeless Grey", hex: "#B6B3AA" }],
    styling: ["Ember Luxe Cushion 55x55", "Olive Stem", "Woodland Book Box Set"] },
  { id: "outdoor-alfresco-stone", label: "Outdoor · Alfresco Stone", room: "Alfresco / outdoor", style: "Mediterranean",
    note: "an outdoor kitchen BBQ island clad in the same porcelain tile and irregular crazy-pave stone (no timber cabinetry)",
    floorTile: "ACACIA Beige External", stackstone: "Crazy Pave", metal: "Stainless Steel",
    paints: [{ name: "Golden Sand", hex: "#E1CD99" }, { name: "Antique White", hex: "#E6DECC" }],
    styling: ["Olive Stem", "Flowering Gum Stem"] },
];

function buildItems(p: Preset): ImagineItem[] {
  const items: ImagineItem[] = [];
  for (const pt of p.paints) items.push({ kind: "paint", name: pt.name, color: pt.hex });
  const ft = tile(p.floorTile); items.push({ kind: "tile", name: p.floorTile, sub: ft.type, url: ft.url });
  if (p.wallTile) { const w = tile(p.wallTile); items.push({ kind: "tile", name: p.wallTile, sub: w.type, url: w.url }); }
  if (p.stackstone) { const s = tile(p.stackstone); items.push({ kind: "tile", name: p.stackstone, sub: s.type, url: s.url }); }
  if (p.cabinetry) { const c = timber(p.cabinetry); items.push({ kind: "timber", name: p.cabinetry, url: c.url }); }
  if (p.carpet) { const c = carpet(p.carpet); items.push({ kind: "carpet", name: p.carpet, url: c.url }); }
  items.push({ kind: "metal", name: p.metal });
  for (const s of p.styling) items.push({ kind: "styling", name: s });
  return items;
}

async function main() {
  if (!ACCOUNT || !TOKEN) { console.error("Missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_AI_TOKEN in .env.local"); process.exit(1); }
  for (const p of PRESETS) {
    if (existsSync(join(OUT, p.id + "-sheet.jpg"))) { console.log("skip (already generated) " + p.id); continue; }
    const items = buildItems(p);
    await Promise.all(items.map(async (it) => {
      if (!it.color && it.url && COLOUR_KINDS.has(it.kind)) { const hex = await swatchHex(it.url); if (hex) it.color = hex; }
    }));
    let benchtopColor: string | undefined, benchtopUrl: string | undefined;
    if (p.benchtop) { const s = stone(p.benchtop); benchtopUrl = s.url; const hex = await swatchHex(s.url); if (hex) benchtopColor = hex; }
    const req: ImagineRequest = { items, benchtop: p.benchtop ?? null, benchtopColor, benchtopUrl, room: p.room, style: p.style, note: p.note };
    const prompt = buildImaginePrompt(req);
    console.log("\n=== " + p.label + " ===");
    console.log(prompt + "\n");
    const tiles: Buffer[] = [];
    for (let n = 0; n < VARIANTS; n++) {
      const b64 = await generateOne(prompt);
      if (b64) {
        const buf = Buffer.from(b64, "base64");
        writeFileSync(join(OUT, p.id + "-" + n + ".jpg"), buf);
        tiles.push(await sharp(buf).resize(400, 400, { fit: "cover" }).jpeg({ quality: 84 }).toBuffer());
        console.log("  saved " + p.id + "-" + n + ".jpg");
      } else console.log("  variant " + n + " failed");
    }
    if (tiles.length) {
      const G = 12, S = 400, cols = 2, rows = Math.ceil(tiles.length / cols);
      const W = cols * S + (cols + 1) * G, H = rows * S + (rows + 1) * G;
      const comp = tiles.map((b, i) => ({ input: b, left: G + (i % cols) * (S + G), top: G + Math.floor(i / cols) * (S + G) }));
      await sharp({ create: { width: W, height: H, channels: 3, background: "#E4E0D6" } }).composite(comp).jpeg({ quality: 85 }).toFile(join(OUT, p.id + "-sheet.jpg"));
      console.log("  sheet -> " + p.id + "-sheet.jpg");
    }
  }
  console.log("\nDONE -> " + OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
