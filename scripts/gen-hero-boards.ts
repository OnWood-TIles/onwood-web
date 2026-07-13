// Proof-of-concept: pre-generate AI room renders for curated hero mood-boards,
// reusing the site's own buildImaginePrompt (colour-accurate + style-cued).
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

async function swatchHex(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    let buf: Buffer;
    if (url.startsWith("/")) {
      buf = readFileSync(join(PUBLIC, url.split("?")[0]));
    } else {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: "https://onwoodtiles.com.au/" } });
      if (!r.ok) return null;
      buf = Buffer.from(await r.arrayBuffer());
    }
    const c = (await sharp(buf).stats()).channels;
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
    if (ct.includes("application/json")) {
      const d = (await res.json()) as { result?: { image?: string } };
      return d?.result?.image || null;
    }
    return Buffer.from(await res.arrayBuffer()).toString("base64");
  } catch (e) { console.error("  gen error", e); return null; }
}

type Preset = { id: string; label: string; room: string; style: string; note?: string; hero: string; items: ImagineItem[]; benchtop?: string; benchtopUrl?: string };

const PRESETS: Preset[] = [
  {
    id: "coastal-hamptons",
    label: "Coastal Hamptons",
    room: "Kitchen",
    style: "Hamptons",
    hero: "BIANCO Carrara In & Out",
    benchtop: "Calacatta Nuvo",
    benchtopUrl: "/images/stone/5131.webp?v=2",
    items: [
      { kind: "paint", name: "Natural White", color: "#EFE9DB" },
      { kind: "flooring", name: "Classic oak natural", url: "https://cdn3.quick-step.com/-/media/imported%20assets/flooring/6/8/0/im1848topshotjpg256677/square%20lr.ashx?rev=c55cd6281b7a436f92a814bdeefb36a5&mw=414&hash=AB2E15CC499ED0778627C7410B87B554" },
      { kind: "timber", name: "Whitewashed Oak", url: "/images/timber/AU1007480.webp" },
      { kind: "tile", name: "BIANCO Carrara In & Out", sub: "BIANCO CARRARA", url: "https://cdn.shopify.com/s/files/1/0626/3370/5561/files/BiancoCarraraIn_Out600x600.jpg?width=600" },
      { kind: "metal", name: "Brushed Brass" },
      { kind: "styling", name: "Olive Tree" },
    ],
  },
  {
    id: "industrial-luxe",
    label: "Industrial Luxe",
    room: "Kitchen",
    style: "Industrial",
    hero: "LAVIDA Dark Grey Matt",
    benchtop: "Raw Concrete",
    benchtopUrl: "/images/stone/4004.webp?v=2",
    items: [
      { kind: "paint", name: "Milton Moon", color: "#A19D91" },
      { kind: "flooring", name: "Patina oak grey", url: "https://cdn3.quick-step.com/-/media/imported%20assets/flooring/5/6/7/pen4752topshotjpg257681/square%20lr.ashx?rev=d9ab5280d31548a19d64d46365a99ce7&mw=414&hash=5A5DD2FA3A1BB58A371F7F73DC83235C" },
      { kind: "timber", name: "Charred Oak", url: "/images/timber/AU1004571.webp" },
      { kind: "tile", name: "LAVIDA Dark Grey Matt", sub: "LAVIDA", url: "https://cdn.shopify.com/s/files/1/0626/3370/5561/files/LavidaDarkGreyMatt600x600.jpg?width=600" },
      { kind: "metal", name: "Matte Black" },
      { kind: "styling", name: "Native Berry Eucalypt Bunch" },
    ],
  },
  {
    id: "japandi-calm",
    label: "Japandi Calm",
    room: "Living room",
    style: "Japandi",
    hero: "LIMESTONE 2.0 Cotton Matt",
    benchtop: "Organic White",
    benchtopUrl: "/images/stone/4600.webp?v=2",
    items: [
      { kind: "paint", name: "Hog Bristle Quarter", color: "#E4DDC8" },
      { kind: "flooring", name: "Brushed oak natural", url: "https://cdn3.quick-step.com/-/media/imported%20assets/flooring/c/6/d/pen4763topshotjpg255026/square%20lr.ashx?rev=8e177600ff4e4480bbfac3396ac0933e&mw=414&hash=82E7F8D6AD3D9C7AF3A9E17F6E88E7F3" },
      { kind: "timber", name: "Natural Oak", url: "/images/timber/AU1004667.webp" },
      { kind: "tile", name: "LIMESTONE 2.0 Cotton Matt", sub: "LIMESTONE", url: "https://cdn.shopify.com/s/files/1/0626/3370/5561/files/Limestone2.0CottonMatt600x600.jpg?width=600" },
      { kind: "metal", name: "Brushed Nickel" },
      { kind: "styling", name: "Potted Orchid" },
    ],
  },
  {
    id: "contemporary-mono",
    label: "Contemporary Monochrome",
    room: "Kitchen",
    style: "Contemporary",
    hero: "ROMANTIC CARRARA Matt",
    benchtop: "Jet Black",
    benchtopUrl: "/images/stone/3100.webp?v=2",
    items: [
      { kind: "paint", name: "Lexicon Half", color: "#EDEFEE" },
      { kind: "flooring", name: "Brushed oak grey", url: "https://cdn3.quick-step.com/-/media/imported%20assets/flooring/4/1/1/pen4765topshotjpg244481/square%20lr.ashx?rev=d9d7ebf58ec2450289481f04cc5c956e&mw=414&hash=61464627141212765CA56BDD82E3FE22" },
      { kind: "timber", name: "Silver Riftwood", url: "/images/timber/AU1004708.webp" },
      { kind: "tile", name: "ROMANTIC CARRARA Matt", sub: "ROMANTIC CARRARA", url: "https://cdn.shopify.com/s/files/1/0626/3370/5561/files/RomanticCarraraMatt600x1200.jpg?width=600" },
      { kind: "metal", name: "Brushed Gunmetal" },
      { kind: "styling", name: "Green Skimmia Stem" },
    ],
  },
  {
    id: "mediterranean-warm",
    label: "Mediterranean Warmth",
    room: "Kitchen",
    style: "Mediterranean",
    hero: "TRAVERTINE 3D CROSSCUT Warm",
    benchtop: "Taj Whisper",
    benchtopUrl: "/images/stone/8251.webp?v=2",
    items: [
      { kind: "paint", name: "Antique White U.S.A.", color: "#E6DECC" },
      { kind: "flooring", name: "Cinnamon oak", url: "https://cdn3.quick-step.com/-/media/imported%20assets/flooring/f/0/c/imd8244topshotjpg281039/square%20lr.ashx?rev=87a5953b68724b61b3a015465c938f0a&mw=414&hash=98CA2446F8D602028C3C8DAC692D1542" },
      { kind: "timber", name: "Golden Oak", url: "/images/timber/AU1006823.webp" },
      { kind: "tile", name: "TRAVERTINE 3D CROSSCUT Warm In & Out", sub: "TRAVERTINE", url: "https://cdn.shopify.com/s/files/1/0626/3370/5561/files/Travertine3DCross-cutCrossCutWarmIn_Out600x600_4464205c-d2d9-407a-bb81-e12e94a4d1e3.jpg?width=600" },
      { kind: "metal", name: "Tumbled Aged Brass" },
      { kind: "styling", name: "Lemon Stem" },
    ],
  },
  {
    id: "scandi-green",
    label: "Scandi Green Ensuite",
    room: "Bathroom",
    style: "Scandinavian",
    hero: "Shadow Green Gloss Kit Kat",
    benchtop: "Snow",
    benchtopUrl: "/images/stone/2141.webp?v=2",
    items: [
      { kind: "paint", name: "Lexicon Quarter", color: "#F2F4F3" },
      { kind: "flooring", name: "Painted oak white", url: "https://cdn3.quick-step.com/-/media/imported%20assets/flooring/6/2/7/pen4753topshotjpg243507/square%20lr.ashx?rev=f9271a19258743b5b72f571085425696&mw=414&hash=0A60310C906ADD2C495AF2C30EBAAB44" },
      { kind: "timber", name: "White Painted Wood", url: "/images/timber/AU1003791.webp" },
      { kind: "tile", name: "Shadow Green Gloss Kit Kat", sub: "Feature Tiles", color: "#6f9457", url: "https://cdn.shopify.com/s/files/1/0626/3370/5561/files/4_536a24e9-6ba0-4136-9eea-5b16ab9e7e77.webp?width=600" },
      { kind: "metal", name: "Brushed Brass" },
      { kind: "styling", name: "Potted Hydrangea Flower" },
    ],
  },
];

async function main() {
  if (!ACCOUNT || !TOKEN) { console.error("Missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_AI_TOKEN in .env.local"); process.exit(1); }
  for (const p of PRESETS) {
    if (existsSync(join(OUT, p.id + "-sheet.jpg"))) { console.log("skip (already generated) " + p.id); continue; }
    await Promise.all(p.items.map(async (it) => {
      if (!it.color && it.url && COLOUR_KINDS.has(it.kind)) { const hex = await swatchHex(it.url); if (hex) it.color = hex; }
    }));
    let benchtopColor: string | undefined;
    if (p.benchtop && p.benchtopUrl) { const hex = await swatchHex(p.benchtopUrl); if (hex) benchtopColor = hex; }
    const req: ImagineRequest = { items: p.items, benchtop: p.benchtop ?? null, benchtopColor, benchtopUrl: p.benchtopUrl, room: p.room, style: p.style, note: p.note };
    const prompt = buildImaginePrompt(req);
    console.log("\n=== " + p.label + " (hero tile: " + p.hero + ") ===");
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
    // 2x2 contact sheet for quick review
    if (tiles.length) {
      const G = 12, S = 400;
      const cols = 2, rows = Math.ceil(tiles.length / cols);
      const W = cols * S + (cols + 1) * G, H = rows * S + (rows + 1) * G;
      const comp = tiles.map((b, i) => ({ input: b, left: G + (i % cols) * (S + G), top: G + Math.floor(i / cols) * (S + G) }));
      await sharp({ create: { width: W, height: H, channels: 3, background: "#E4E0D6" } }).composite(comp).jpeg({ quality: 85 }).toFile(join(OUT, p.id + "-sheet.jpg"));
      console.log("  sheet -> " + p.id + "-sheet.jpg");
    }
  }
  console.log("\nDONE -> " + OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
